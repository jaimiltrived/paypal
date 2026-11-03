from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.common import BaseSchema


class PendingActionRead(BaseSchema):
    id: str
    action_type: str
    entity_type: str
    entity_id: str
    payload_json: str
    status: str
    proposed_by_user_id: str
    confirmed_by_user_id: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None


class PendingActionResolution(BaseModel):
    action_id: str
    status: str
    message: str

