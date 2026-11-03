from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.order import Order
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self, db: Session):
        super().__init__(Order, db)

    def get_by_paypal_order_id(self, paypal_order_id: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.paypal_order_id == paypal_order_id).first()

    def get_by_capture_id(self, capture_id: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.capture_id == capture_id).first()

    def search_orders(
        self,
        status: Optional[str] = None,
        user_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Order], int]:
        query = self.db.query(Order)
        if status:
            query = query.filter(Order.status == status.upper())
        if user_id:
            query = query.filter(Order.user_id == user_id)

        total = query.count()
        items = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

