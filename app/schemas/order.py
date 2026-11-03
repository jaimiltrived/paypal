from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class OrderCreate(BaseModel):
    amount_cents: int = Field(gt=0, description="Order total in integer cents (e.g. 1500 = $15.00)")
    currency: str = Field(default="USD", min_length=3, max_length=3)
    description: Optional[str] = Field(default=None, max_length=255)
    custom_id: Optional[str] = Field(default=None, max_length=100)
    return_url: Optional[str] = "https://example.com/return"
    cancel_url: Optional[str] = "https://example.com/cancel"


class OrderCaptureResponse(BaseModel):
    order_id: str
    paypal_order_id: str
    status: str
    capture_id: Optional[str] = None
    amount_cents: int
    currency: str


class OrderRead(BaseSchema):
    id: str
    user_id: Optional[str] = None
    paypal_order_id: Optional[str] = None
    status: str
    currency: str
    amount_cents: int
    description: Optional[str] = None
    custom_id: Optional[str] = None
    payer_email: Optional[str] = None
    capture_id: Optional[str] = None
    approval_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

