from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.dispute import Dispute
from app.repositories.base import BaseRepository


class DisputeRepository(BaseRepository[Dispute]):
    def __init__(self, db: Session):
        super().__init__(Dispute, db)

    def get_by_paypal_dispute_id(self, paypal_dispute_id: str) -> Optional[Dispute]:
        return self.db.query(Dispute).filter(Dispute.paypal_dispute_id == paypal_dispute_id).first()

    def search_disputes(
        self,
        status: Optional[str] = None,
        order_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Dispute], int]:
        query = self.db.query(Dispute)
        if status:
            query = query.filter(Dispute.status == status.upper())
        if order_id:
            query = query.filter(Dispute.order_id == order_id)

        total = query.count()
        items = query.order_by(Dispute.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

