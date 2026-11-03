from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class InvoiceLineItem(BaseModel):
    sku_id: Optional[str] = None
    name: str = Field(min_length=1, max_length=100)
    quantity: int = Field(gt=0, default=1)
    unit_price_cents: int = Field(gt=0, description="Unit price in integer cents")


class InvoiceCreate(BaseModel):
    user_id: Optional[str] = None
    order_id: Optional[str] = None
    currency: str = Field(default="USD", min_length=3, max_length=3)
    items: List[InvoiceLineItem] = Field(min_length=1)
    due_date: Optional[datetime] = None
    notes: Optional[str] = Field(default=None, max_length=500)


class InvoicePayRequest(BaseModel):
    order_id: Optional[str] = Field(
        default=None,
        description="Optional completed Order ID used to fulfill this invoice.",
    )


class InvoiceRead(BaseSchema):
    id: str
    invoice_number: str
    user_id: Optional[str] = None
    order_id: Optional[str] = None
    status: str
    currency: str
    total_amount_cents: int
    due_date: Optional[datetime] = None
    issued_date: Optional[datetime] = None
    metadata_json: Optional[str] = None
    created_at: datetime
    updated_at: datetime

