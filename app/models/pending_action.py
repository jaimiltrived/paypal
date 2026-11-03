from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid


class PendingAction(Base, TimestampMixin):
    __tablename__ = "pending_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    action_type = Column(String(50), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=False, index=True)
    payload_json = Column(Text, nullable=False)

    status = Column(String(30), nullable=False, default="PENDING", index=True)

    proposed_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    confirmed_by_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    resolved_at = Column(DateTime, nullable=True)

