from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Refund(Base, TimestampMixin):
    __tablename__ = "refunds"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False, index=True)
    paypal_refund_id = Column(String(100), unique=True, nullable=True, index=True)

    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(String(30), nullable=False, default="PENDING", index=True)
    reason = Column(String(255), nullable=True)

    initiated_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    order = relationship("Order", back_populates="refunds")

