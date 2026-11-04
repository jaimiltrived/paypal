from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Payout(Base, TimestampMixin):
    __tablename__ = "payouts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    payout_batch_id = Column(String(100), unique=True, nullable=True, index=True)
    payout_item_id = Column(String(100), unique=True, nullable=True, index=True)

    recipient_email = Column(String(255), nullable=False, index=True)
    recipient_name = Column(String(100), nullable=True)

    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    status = Column(String(30), nullable=False, default="SUCCESS", index=True)
    note = Column(String(255), nullable=True)

    user = relationship("User")
