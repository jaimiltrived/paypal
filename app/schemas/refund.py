from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class RefundCreate(BaseModel):
    order_id: str
    amount_cents: Optional[int] = Field(
        default=None,
        gt=0,
        description="Amount to refund in integer cents. If omitted, full order amount is refunded.",
    )
    reason: Optional[str] = Field(default=None, max_length=255)


class RefundRead(BaseSchema):
    id: str
    order_id: str
    paypal_refund_id: Optional[str] = None
    amount_cents: int
    currency: str
    status: str
    reason: Optional[str] = None
    initiated_by_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class RefundResult(BaseModel):
    refund_id: Optional[str] = None
    pending_action_id: Optional[str] = None
    status: str
    message: str
    amount_cents: int

