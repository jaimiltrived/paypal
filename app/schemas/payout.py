from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.common import BaseSchema


class PayoutCreate(BaseModel):
    recipient_email: EmailStr = Field(description="Recipient PayPal or bank clearing email")
    recipient_name: Optional[str] = Field(default=None, max_length=100)
    amount_cents: int = Field(gt=0, description="Disbursement total in integer cents (e.g. 5000 = $50.00)")
    currency: str = Field(default="USD", min_length=3, max_length=3)
    note: Optional[str] = Field(default=None, max_length=255)


class PayoutRead(BaseSchema):
    id: str
    user_id: Optional[str] = None
    recipient_email: str
    recipient_name: Optional[str] = None
    amount_cents: int
    currency: str
    status: str
    note: Optional[str] = None
    payout_batch_id: Optional[str] = None
    payout_item_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PayoutMetrics(BaseModel):
    total_payouts_cents: int
    payout_count: int
    successful_count: int
    pending_count: int

