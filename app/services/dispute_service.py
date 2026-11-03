from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.exceptions import EntityNotFoundError, PayOpsException
from app.core.logging import logger
from app.integrations.paypal.client import PayPalClient, get_paypal_client
from app.models.dispute import Dispute
from app.repositories.dispute_repo import DisputeRepository
from app.repositories.order_repo import OrderRepository
from app.schemas.dispute import DisputeEvidenceRequest
from app.services.audit_service import AuditService
from app.utils.money import paypal_string_to_cents


class DisputeService:
    def __init__(self, db: Session, paypal_client: Optional[PayPalClient] = None):
        self.db = db
        self.dispute_repo = DisputeRepository(db)
        self.order_repo = OrderRepository(db)
        self.paypal = paypal_client or get_paypal_client()
        self.audit = AuditService(db)

    async def sync_disputes_from_paypal(
        self,
        dispute_state: Optional[str] = None,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> List[Dispute]:
        """Fetch disputes from PayPal Sandbox and synchronize into local database."""
        response = await self.paypal.list_disputes(dispute_state=dispute_state)
        items = response.get("items", [])
        synced_disputes: List[Dispute] = []

        for item in items:
            paypal_dispute_id = item.get("dispute_id")
            if not paypal_dispute_id:
                continue

            status = item.get("status", "OPEN")
            reason = item.get("reason", "OTHER")

            # Extract amount
            amount_info = item.get("dispute_amount", {})
            cents = 0
            if "value" in amount_info:
                try:
                    cents = paypal_string_to_cents(amount_info["value"])
                except Exception:
                    pass
            currency = amount_info.get("currency_code", "USD")

            # Try resolving linked order
            order_id = None
            disputed_txns = item.get("disputed_transactions", [])
            if disputed_txns:
                first_txn = disputed_txns[0]
                seller_txn_id = first_txn.get("seller_transaction_id")
                custom_id = first_txn.get("custom_id")
                if custom_id:
                    ord_match = self.order_repo.get_by_id(custom_id)
                    if ord_match:
                        order_id = ord_match.id
                if not order_id and seller_txn_id:
                    ord_match = self.order_repo.get_by_capture_id(seller_txn_id)
                    if ord_match:
                        order_id = ord_match.id

            # Fallback if no matching local order exists yet
            if not order_id:
                # Find or assign first completed order or skip
                first_order = self.order_repo.list_all(skip=0, limit=1)
                order_id = first_order[0].id if first_order else "UNLINKED"

            existing = self.dispute_repo.get_by_paypal_dispute_id(paypal_dispute_id)
            if existing:
                existing.status = status
                existing.reason = reason
                existing.dispute_amount_cents = cents
                existing.currency = currency
                saved = self.dispute_repo.update(existing)
            else:
                dispute = Dispute(
                    paypal_dispute_id=paypal_dispute_id,
                    order_id=order_id,
                    status=status,
                    reason=reason,
                    dispute_amount_cents=cents,
                    currency=currency,
                )
                saved = self.dispute_repo.create(dispute)

            synced_disputes.append(saved)

        self.audit.log_action(
            action="DISPUTES_SYNCED_PAYPAL",
            entity_type="dispute",
            entity_id="BULK_SYNC",
            user_id=user_id,
            new_values={"count": len(synced_disputes)},
            ip_address=ip_address,
        )

        return synced_disputes

    async def provide_evidence(
        self,
        dispute_id: str,
        payload: DisputeEvidenceRequest,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Dispute:
        dispute = self.get_dispute(dispute_id)
        if dispute.status in ("RESOLVED", "CLOSED"):
            raise PayOpsException(f"Cannot submit evidence for dispute in status '{dispute.status}'.")

        if dispute.paypal_dispute_id:
            await self.paypal.provide_dispute_evidence(
                paypal_dispute_id=dispute.paypal_dispute_id,
                note=payload.note,
                evidence_type=payload.evidence_type,
            )

        dispute.evidence_summary = payload.note
        dispute.status = "UNDER_REVIEW"
        updated = self.dispute_repo.update(dispute)

        self.audit.log_action(
            action="DISPUTE_EVIDENCE_SUBMITTED",
            entity_type="dispute",
            entity_id=updated.id,
            user_id=user_id,
            new_values={"evidence_summary": payload.note, "status": updated.status},
            ip_address=ip_address,
        )
        return updated

    async def accept_claim(
        self,
        dispute_id: str,
        note: Optional[str] = None,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Dispute:
        dispute = self.get_dispute(dispute_id)
        if dispute.status in ("RESOLVED", "CLOSED"):
            raise PayOpsException(f"Dispute is already '{dispute.status}'.")

        if dispute.paypal_dispute_id:
            await self.paypal.accept_dispute_claim(
                paypal_dispute_id=dispute.paypal_dispute_id,
                note=note,
            )

        dispute.status = "RESOLVED"
        dispute.outcome = "ACCEPTED"
        updated = self.dispute_repo.update(dispute)

        self.audit.log_action(
            action="DISPUTE_CLAIM_ACCEPTED",
            entity_type="dispute",
            entity_id=updated.id,
            user_id=user_id,
            new_values={"status": "RESOLVED", "outcome": "ACCEPTED", "note": note},
            ip_address=ip_address,
        )
        return updated

    def get_dispute(self, dispute_id: str) -> Dispute:
        dispute = self.dispute_repo.get_by_id(dispute_id)
        if not dispute:
            dispute = self.dispute_repo.get_by_paypal_dispute_id(dispute_id)
        if not dispute:
            raise EntityNotFoundError("Dispute", dispute_id)
        return dispute

    def list_disputes(
        self,
        status: Optional[str] = None,
        order_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Dispute], int]:
        return self.dispute_repo.search_disputes(
            status=status, order_id=order_id, skip=skip, limit=limit
        )

