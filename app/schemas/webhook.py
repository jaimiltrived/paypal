from datetime import datetime
from typing import Optional
from app.schemas.common import BaseSchema


class WebhookEventRead(BaseSchema):
    id: str
    event_id: str
    event_type: str
    resource_type: Optional[str] = None
    summary: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime

