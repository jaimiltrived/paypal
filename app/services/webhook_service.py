import json
from datetime import datetime, timezone
from typing import Any, Optional, Tuple, List
from sqlalchemy.orm import Session

from app.core.exceptions import WebhookVerificationError
from app.core.logging import logger
from app.integrations.paypal.client import PayPalClient, get_paypal_client
from app.models.order import Order
from app.models.refund import Refund
from app.models.webhook import Event
from app.models.dispute import Dispute
from app.repositories.order_repo import OrderRepository
from app.repositories.refund_repo import RefundRepository
from app.repositories.webhook_repo import WebhookRepository
from app.repositories.dispute_repo import DisputeRepository
from app.services.audit_service import AuditService
from app.utils.money import paypal_string_to_cents


class WebhookService:
    def __init__(self, db: Session, paypal_client: Optional[PayPalClient] = None):
        self.db = db
        self.webhook_repo = WebhookRepository(db)
        self.order_repo = OrderRepository(db)
        self.refund_repo = RefundRepository(db)
        self.dispute_repo = DisputeRepository(db)
        self.paypal = paypal_client or get_paypal_client()
        self.audit = AuditService(db)


    async def process_webhook(
        self,
        headers: dict[str, str],
        payload: dict[str, Any],
        raw_body: bytes,
        skip_verification: bool = False,
        ip_address: Optional[str] = None,
    ) -> Event:
        """Verify, deduplicate, and process inbound PayPal webhook event."""
        event_id = payload.get("id")
        event_type = payload.get("event_type", "UNKNOWN")
        resource_type = payload.get("resource_type")
        summary = payload.get("summary")

        if not event_id:
            raise WebhookVerificationError("Webhook payload is missing an 'id' attribute.")

        # 1. Idempotency check: Have we seen this event before?
        existing_event = self.webhook_repo.get_by_event_id(event_id)
        if existing_event:
            logger.info(f"Idempotent Webhook: event {event_id} already ingested (status: {existing_event.status}).")
            return existing_event

        # 2. Signature verification
        if not skip_verification:
            is_valid = await self.paypal.verify_webhook_signature(
                transmission_id=headers.get("paypal-transmission-id", ""),
                transmission_time=headers.get("paypal-transmission-time", ""),
                cert_url=headers.get("paypal-cert-url", ""),
                auth_algo=headers.get("paypal-auth-algo", ""),
                transmission_sig=headers.get("paypal-transmission-sig", ""),
                webhook_event_payload=payload,
            )
            if not is_valid:
                logger.warning(f"PayPal webhook signature verification failed for event {event_id}.")
                # Record failed event for security auditing
                unverified_event = Event(
                    event_id=event_id,
                    event_type=event_type,
                    resource_type=resource_type,
                    summary=summary,
                    payload_json=json.dumps(payload, default=str),
                    status="FAILED",
                    error_message="Signature verification failed",
                )
                self.webhook_repo.create(unverified_event)
                raise WebhookVerificationError("PayPal signature verification failed.")

        # 3. Create Event record
        event_record = Event(
            event_id=event_id,
            event_type=event_type,
            resource_type=resource_type,
            summary=summary,
            payload_json=json.dumps(payload, default=str),
            status="RECEIVED",
        )
        saved_event = self.webhook_repo.create(event_record)

        # 4. Dispatch and process business logic
        try:
            await self._dispatch_event(event_type, payload.get("resource", {}), ip_address)
            saved_event.status = "PROCESSED"
            saved_event.processed_at = datetime.now(timezone.utc)
            self.webhook_repo.update(saved_event)
        except Exception as exc:
            logger.error(f"Error processing webhook event {event_id}: {exc}")
            saved_event.status = "FAILED"
            saved_event.error_message = str(exc)
            self.webhook_repo.update(saved_event)
            raise

        return saved_event

    async def _dispatch_event(
        self,
        event_type: str,
        resource: dict[str, Any],
        ip_address: Optional[str] = None,
    ) -> None:
        """Route recognized webhook events to domain updates."""
        logger.info(f"Processing webhook event type: {event_type}")

        if event_type == "CHECKOUT.ORDER.APPROVED":
            paypal_order_id = resource.get("id")
            if paypal_order_id:
                order = self.order_repo.get_by_paypal_order_id(paypal_order_id)
                if order and order.status != "COMPLETED":
                    order.status = "APPROVED"
                    self.order_repo.update(order)
                    self.audit.log_action(
                        action="ORDER_APPROVED_WEBHOOK",
                        entity_type="order",
                        entity_id=order.id,
                        new_values={"status": "APPROVED"},
                        ip_address=ip_address,
                    )

        elif event_type == "PAYMENT.CAPTURE.COMPLETED":
            capture_id = resource.get("id")
            # In capture completed, custom_id or supplementary_data contains order link
            custom_id = resource.get("custom_id")
            order = None
            if custom_id:
                order = self.order_repo.get_by_id(custom_id)
            if not order and capture_id:
                order = self.order_repo.get_by_capture_id(capture_id)

            if order:
                order.status = "COMPLETED"
                order.capture_id = capture_id
                amount_info = resource.get("amount", {})
                if "value" in amount_info:
                    try:
                        order.amount_cents = paypal_string_to_cents(amount_info["value"])
                    except Exception:
                        pass
                self.order_repo.update(order)
                self.audit.log_action(
                    action="PAYMENT_CAPTURE_COMPLETED_WEBHOOK",
                    entity_type="order",
                    entity_id=order.id,
                    new_values={"status": "COMPLETED", "capture_id": capture_id},
                    ip_address=ip_address,
                )

        elif event_type == "PAYMENT.CAPTURE.REFUNDED":
            paypal_refund_id = resource.get("id")
            amount_info = resource.get("amount", {})
            refund_cents = 0
            if "value" in amount_info:
                refund_cents = paypal_string_to_cents(amount_info["value"])
            currency = amount_info.get("currency_code", "USD")

            # Check existing refund
            if paypal_refund_id and not self.refund_repo.get_by_paypal_refund_id(paypal_refund_id):
                # Try finding capture
                # In PayPal refund events, links contains "up" rel pointing to capture
                links = resource.get("links", [])
                capture_id = None
                for link in links:
                    if link.get("rel") == "up" and "captures" in link.get("href", ""):
                        capture_id = link["href"].split("/")[-1]
                        break

                order = self.order_repo.get_by_capture_id(capture_id) if capture_id else None
                if order:
                    refund = Refund(
                        order_id=order.id,
                        paypal_refund_id=paypal_refund_id,
                        amount_cents=refund_cents,
                        currency=currency,
                        status="COMPLETED",
                        reason="Webhook initiated refund notification",
                    )
                    saved = self.refund_repo.create(refund)
                    self.audit.log_action(
                        action="REFUND_COMPLETED_WEBHOOK",
                        entity_type="refund",
                        entity_id=saved.id,
                        new_values={"amount_cents": refund_cents, "order_id": order.id},
                        ip_address=ip_address,
                    )

        elif event_type == "PAYMENT.CAPTURE.DENIED":
            capture_id = resource.get("id")
            order = self.order_repo.get_by_capture_id(capture_id) if capture_id else None
            if order:
                order.status = "DENIED"
                self.order_repo.update(order)
                self.audit.log_action(
                    action="PAYMENT_CAPTURE_DENIED_WEBHOOK",
                    entity_type="order",
                    entity_id=order.id,
                    new_values={"status": "DENIED"},
                    ip_address=ip_address,
                )

        elif event_type.startswith("CUSTOMER.DISPUTE"):
            paypal_dispute_id = resource.get("dispute_id")
            status = resource.get("status", "OPEN")
            reason = resource.get("reason", "OTHER")
            amount_info = resource.get("dispute_amount", {})
            cents = 0
            if "value" in amount_info:
                try:
                    cents = paypal_string_to_cents(amount_info["value"])
                except Exception:
                    pass

            if paypal_dispute_id:
                dispute = self.dispute_repo.get_by_paypal_dispute_id(paypal_dispute_id)
                if dispute:
                    dispute.status = status
                    self.dispute_repo.update(dispute)
                else:
                    first_order = self.order_repo.list_all(skip=0, limit=1)
                    order_id = first_order[0].id if first_order else "UNLINKED"
                    dispute = Dispute(
                        paypal_dispute_id=paypal_dispute_id,
                        order_id=order_id,
                        status=status,
                        reason=reason,
                        dispute_amount_cents=cents,
                        currency=amount_info.get("currency_code", "USD"),
                    )
                    self.dispute_repo.create(dispute)

                self.audit.log_action(
                    action=f"DISPUTE_WEBHOOK_{status}",
                    entity_type="dispute",
                    entity_id=paypal_dispute_id,
                    new_values={"status": status, "reason": reason},
                    ip_address=ip_address,
                )


    def list_events(
        self,
        event_type: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Event], int]:
        return self.webhook_repo.list_events(event_type=event_type, status=status, skip=skip, limit=limit)

