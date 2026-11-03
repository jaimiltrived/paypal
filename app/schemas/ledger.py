from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.common import BaseSchema


class LedgerTransaction(BaseModel):
    id: str
    transaction_type: str  # CREDIT (Order Capture) or DEBIT (Refund)
    order_id: str
    external_reference: Optional[str] = None
    amount_cents: int
    currency: str
    status: str
    description: Optional[str] = None
    timestamp: datetime


class LedgerSummaryResponse(BaseModel):
    total_sales_cents: int
    total_refunded_cents: int
    net_revenue_cents: int
    currency: str
    order_count: int
    refund_count: int


class AuditLogRead(BaseSchema):
    id: str
    user_id: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

