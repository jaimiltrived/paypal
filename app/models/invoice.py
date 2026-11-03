from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=True, index=True)

    status = Column(String(30), nullable=False, default="DRAFT", index=True)
    currency = Column(String(3), nullable=False, default="USD")
    total_amount_cents = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=True)
    issued_date = Column(DateTime, nullable=True)
    metadata_json = Column(Text, nullable=True)

    order = relationship("Order", back_populates="invoices")

