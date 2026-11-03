from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.refund import Refund
from app.repositories.base import BaseRepository


class RefundRepository(BaseRepository[Refund]):
    def __init__(self, db: Session):
        super().__init__(Refund, db)

    def get_by_paypal_refund_id(self, paypal_refund_id: str) -> Optional[Refund]:
        return self.db.query(Refund).filter(Refund.paypal_refund_id == paypal_refund_id).first()

    def list_by_order_id(self, order_id: str) -> List[Refund]:
        return self.db.query(Refund).filter(Refund.order_id == order_id).all()

    def search_refunds(
        self,
        order_id: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Refund], int]:
        query = self.db.query(Refund)
        if order_id:
            query = query.filter(Refund.order_id == order_id)
        if status:
            query = query.filter(Refund.status == status.upper())

        total = query.count()
        items = query.order_by(Refund.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

