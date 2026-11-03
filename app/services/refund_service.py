import json
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import EntityNotFoundError, PayOpsException
from app.integrations.paypal.client import PayPalClient, get_paypal_client
from app.models.order import Order
from app.models.refund import Refund
from app.repositories.order_repo import OrderRepository
from app.repositories.refund_repo import RefundRepository
from app.schemas.refund import RefundCreate, RefundResult
from app.services.audit_service import AuditService
from app.services.pending_action_service import PendingActionService
from app.utils.money import paypal_string_to_cents


class RefundService:
    def __init__(self, db: Session, paypal_client: Optional[PayPalClient] = None):
        self.db = db
        self.order_repo = OrderRepository(db)
        self.refund_repo = RefundRepository(db)
        self.paypal = paypal_client or get_paypal_client()
        self.audit = AuditService(db)
        self.pending_service = PendingActionService(db)

    async def issue_refund(
        self,
        payload: RefundCreate,
        user_id: Optional[str] = None,
        bypass_confirmation: bool = False,
        ip_address: Optional[str] = None,
    ) -> RefundResult:
        """Validate and execute a refund, or queue as a pending action if threshold exceeded."""
        order = self.order_repo.get_by_id(payload.order_id)
        if not order:
            raise EntityNotFoundError("Order", payload.order_id)

        if order.status != "COMPLETED":
            raise PayOpsException(f"Cannot refund an order with status '{order.status}'. Order must be COMPLETED.")

        if not order.capture_id:
            raise PayOpsException("Order has no PayPal capture ID to issue a refund against.")

        # Compute already refunded cents
        existing_refunds = self.refund_repo.list_by_order_id(order.id)
        already_refunded_cents = sum(
            r.amount_cents for r in existing_refunds if r.status in ("COMPLETED", "PENDING")
        )

        refundable_cents = order.amount_cents - already_refunded_cents
        if refundable_cents <= 0:
            raise PayOpsException("Order has already been fully refunded.")

        target_amount_cents = payload.amount_cents if payload.amount_cents is not None else refundable_cents

        if target_amount_cents <= 0:
            raise PayOpsException("Refund amount must be greater than 0 cents.")

        if target_amount_cents > refundable_cents:
            raise PayOpsException(
                f"Requested refund amount ({target_amount_cents}c) exceeds remaining refundable balance ({refundable_cents}c)."
            )

        # Check sensitive financial threshold
        if (
            target_amount_cents >= settings.SENSITIVE_REFUND_THRESHOLD_CENTS
            and not bypass_confirmation
        ):
            pending_action = self.pending_service.create_pending_action(
                action_type="HIGH_VALUE_REFUND",
                entity_type="order",
                entity_id=order.id,
                payload={
                    "order_id": order.id,
                    "amount_cents": target_amount_cents,
                    "currency": order.currency,
                    "reason": payload.reason,
                    "capture_id": order.capture_id,
                },
                proposed_by_user_id=user_id or "ANONYMOUS",
                ip_address=ip_address,
            )
            return RefundResult(
                pending_action_id=pending_action.id,
                status="PENDING_CONFIRMATION",
                message=(
                    f"Refund of {target_amount_cents}c exceeds the threshold of "
                    f"{settings.SENSITIVE_REFUND_THRESHOLD_CENTS}c. Explicit confirmation required."
                ),
                amount_cents=target_amount_cents,
            )

        return await self._execute_paypal_refund(
            order=order,
            amount_cents=target_amount_cents,
            reason=payload.reason,
            user_id=user_id,
            ip_address=ip_address,
        )

    async def _execute_paypal_refund(
        self,
        order: Order,
        amount_cents: int,
        reason: Optional[str],
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> RefundResult:
        """Directly call PayPal API and record refund."""
        pp_response = await self.paypal.refund_capture(
            capture_id=order.capture_id,
            amount_cents=amount_cents,
            currency=order.currency,
            reason=reason,
        )

        pp_refund_id = pp_response.get("id")
        pp_status = pp_response.get("status", "COMPLETED")

        # Save local refund record
        refund_record = Refund(
            order_id=order.id,
            paypal_refund_id=pp_refund_id,
            amount_cents=amount_cents,
            currency=order.currency,
            status="COMPLETED" if pp_status == "COMPLETED" else pp_status,
            reason=reason,
            initiated_by_user_id=user_id,
        )
        saved_refund = self.refund_repo.create(refund_record)

        self.audit.log_action(
            action="REFUND_ISSUED",
            entity_type="refund",
            entity_id=saved_refund.id,
            user_id=user_id,
            new_values={
                "order_id": order.id,
                "amount_cents": amount_cents,
                "paypal_refund_id": pp_refund_id,
                "status": saved_refund.status,
            },
            ip_address=ip_address,
        )

        return RefundResult(
            refund_id=saved_refund.id,
            status=saved_refund.status,
            message="Refund processed successfully.",
            amount_cents=saved_refund.amount_cents,
        )

    async def confirm_pending_refund(
        self,
        action_id: str,
        user_id: str,
        ip_address: Optional[str] = None,
    ) -> RefundResult:
        """Confirm and execute a previously queued sensitive refund."""
        action = self.pending_service.get_by_id(action_id)
        if action.status != "PENDING":
            raise PayOpsException(f"Action '{action_id}' is already {action.status}.")

        payload = json.loads(action.payload_json)
        order = self.order_repo.get_by_id(payload["order_id"])
        if not order:
            raise EntityNotFoundError("Order", payload["order_id"])

        result = await self._execute_paypal_refund(
            order=order,
            amount_cents=payload["amount_cents"],
            reason=payload.get("reason"),
            user_id=user_id,
            ip_address=ip_address,
        )

        action.status = "CONFIRMED"
        action.confirmed_by_user_id = user_id
        action.resolved_at = datetime.now(timezone.utc)
        self.pending_service.repo.update(action)

        return result

    def get_refund(self, refund_id: str) -> Refund:
        refund = self.refund_repo.get_by_id(refund_id)
        if not refund:
            refund = self.refund_repo.get_by_paypal_refund_id(refund_id)
        if not refund:
            raise EntityNotFoundError("Refund", refund_id)
        return refund

    def list_refunds(
        self,
        order_id: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Refund], int]:
        return self.refund_repo.search_refunds(order_id=order_id, status=status, skip=skip, limit=limit)

