from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Dispute(Base, TimestampMixin):
    __tablename__ = "disputes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    paypal_dispute_id = Column(String(100), unique=True, nullable=True, index=True)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False, index=True)

    status = Column(String(30), nullable=False, default="OPEN", index=True)
    reason = Column(String(100), nullable=True)
    dispute_amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    outcome = Column(String(50), nullable=True)
    evidence_summary = Column(Text, nullable=True)

    order = relationship("Order", back_populates="disputes")

