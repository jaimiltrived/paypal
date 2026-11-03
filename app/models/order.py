from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    paypal_order_id = Column(String(100), unique=True, nullable=True, index=True)

    status = Column(String(30), nullable=False, default="CREATED", index=True)
    currency = Column(String(3), nullable=False, default="USD")
    amount_cents = Column(Integer, nullable=False)
    description = Column(String(255), nullable=True)
    custom_id = Column(String(100), nullable=True, index=True)

    payer_email = Column(String(255), nullable=True)
    capture_id = Column(String(100), nullable=True, index=True)

    user = relationship("User", back_populates="orders")
    refunds = relationship("Refund", back_populates="order", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="order")
    disputes = relationship("Dispute", back_populates="order")

