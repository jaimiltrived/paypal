from sqlalchemy import Column, String, Text, DateTime
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(100), unique=True, nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(100), nullable=True)
    summary = Column(String(255), nullable=True)
    payload_json = Column(Text, nullable=False)

    status = Column(String(30), nullable=False, default="RECEIVED", index=True)
    error_message = Column(Text, nullable=True)
    processed_at = Column(DateTime, nullable=True)

