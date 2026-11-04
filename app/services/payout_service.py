import uuid
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.exceptions import EntityNotFoundError, PayOpsException
from app.models.payout import Payout
from app.schemas.payout import PayoutCreate, PayoutMetrics
from app.services.audit_service import AuditService


class PayoutService:
    def __init__(self, db: Session):
        self.db = db
        self.audit_service = AuditService(db)

    def create_payout(
        self,
        payload: PayoutCreate,
        user_id: str,
        ip_address: Optional[str] = None,
    ) -> Payout:
        if payload.amount_cents <= 0:
            raise PayOpsException("Payout amount must be greater than zero.", status_code=400)

        batch_id = f"BATCH-2026-{uuid.uuid4().hex[:8].upper()}"
        item_id = f"ITEM-{uuid.uuid4().hex[:12].upper()}"

        payout = Payout(
            user_id=user_id,
            payout_batch_id=batch_id,
            payout_item_id=item_id,
            recipient_email=payload.recipient_email.lower().strip(),
            recipient_name=payload.recipient_name,
            amount_cents=payload.amount_cents,
            currency=payload.currency.upper(),
            status="SUCCESS",
            note=payload.note or "Partner disbursement",
        )
        self.db.add(payout)
        self.db.commit()
        self.db.refresh(payout)

        self.audit_service.log_action(
            action="PAYOUT_DISBURSED",
            entity_type="payout",
            entity_id=payout.id,
            user_id=user_id,
            new_values={
                "batch_id": payout.payout_batch_id,
                "recipient_email": payout.recipient_email,
                "amount_cents": payout.amount_cents,
                "currency": payout.currency,
                "status": payout.status,
            },
            ip_address=ip_address,
        )

        return payout

    def list_payouts(
        self,
        status: Optional[str] = None,
        recipient_email: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Payout], int]:
        query = self.db.query(Payout)

        if status and status.upper() != "ALL":
            query = query.filter(Payout.status == status.upper())

        if recipient_email:
            query = query.filter(Payout.recipient_email.ilike(f"%{recipient_email}%"))

        total = query.count()
        items = query.order_by(Payout.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def get_payout(self, payout_id: str) -> Payout:
        payout = (
            self.db.query(Payout)
            .filter((Payout.id == payout_id) | (Payout.payout_batch_id == payout_id))
            .first()
        )
        if not payout:
            raise EntityNotFoundError("Payout", payout_id)
        return payout

    def get_metrics(self) -> PayoutMetrics:
        total_cents = (
            self.db.query(func.coalesce(func.sum(Payout.amount_cents), 0))
            .filter(Payout.status == "SUCCESS")
            .scalar()
            or 0
        )
        total_count = self.db.query(Payout).count()
        succ_count = self.db.query(Payout).filter(Payout.status == "SUCCESS").count()
        pending_count = self.db.query(Payout).filter(Payout.status == "PENDING").count()

        return PayoutMetrics(
            total_payouts_cents=int(total_cents),
            payout_count=total_count,
            successful_count=succ_count,
            pending_count=pending_count,
        )
