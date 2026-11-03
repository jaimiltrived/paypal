from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.invoice import Invoice
from app.repositories.base import BaseRepository


class InvoiceRepository(BaseRepository[Invoice]):
    def __init__(self, db: Session):
        super().__init__(Invoice, db)

    def get_by_number(self, invoice_number: str) -> Optional[Invoice]:
        return self.db.query(Invoice).filter(Invoice.invoice_number == invoice_number.upper().strip()).first()

    def generate_invoice_number(self) -> str:
        current_year = datetime.now(timezone.utc).year
        count = self.db.query(Invoice).count() + 1
        return f"INV-{current_year}-{count:05d}"

    def search_invoices(
        self,
        status: Optional[str] = None,
        user_id: Optional[str] = None,
        order_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Invoice], int]:
        query = self.db.query(Invoice)
        if status:
            query = query.filter(Invoice.status == status.upper())
        if user_id:
            query = query.filter(Invoice.user_id == user_id)
        if order_id:
            query = query.filter(Invoice.order_id == order_id)

        total = query.count()
        items = query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

