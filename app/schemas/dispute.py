from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class DisputeEvidenceRequest(BaseModel):
    note: str = Field(min_length=5, max_length=2000, description="Evidence description or resolution rationale")
    evidence_type: str = Field(default="OTHER", description="PayPal evidence type enum")


class DisputeAcceptRequest(BaseModel):
    note: Optional[str] = Field(default=None, max_length=500)


class DisputeRead(BaseSchema):
    id: str
    paypal_dispute_id: Optional[str] = None
    order_id: str
    status: str
    reason: Optional[str] = None
    dispute_amount_cents: int
    currency: str
    outcome: Optional[str] = None
    evidence_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DisputeSyncResponse(BaseModel):
    synced_count: int
    items: List[DisputeRead]

