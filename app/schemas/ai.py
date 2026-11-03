from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema
from app.schemas.invoice import InvoiceRead


class ExtractedLineItem(BaseModel):
    name: str = Field(description="Description or item name")
    quantity: int = Field(default=1, gt=0)
    unit_price_cents: int = Field(gt=0, description="Unit price in integer cents")
    line_total_cents: int = Field(gt=0, description="Total line amount in integer cents")


class DocumentExtractionResult(BaseModel):
    vendor_name: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    currency: str = Field(default="USD", min_length=3, max_length=3)
    line_items: List[ExtractedLineItem] = Field(default_factory=list)
    subtotal_cents: int = Field(default=0, ge=0)
    tax_amount_cents: int = Field(default=0, ge=0)
    total_amount_cents: int = Field(ge=0, description="Total amount in integer cents")
    is_arithmetic_valid: bool = Field(default=True, description="True if line items + tax match total")
    confidence_score: float = Field(default=0.85, ge=0.0, le=1.0)
    notes: Optional[str] = None


class DocumentExtractionRequest(BaseModel):
    image_base64: Optional[str] = Field(default=None, description="Base64-encoded image string")
    document_text: Optional[str] = Field(default=None, description="Raw OCR or digital document text")


class AIModelInfo(BaseModel):
    name: str
    size_bytes: Optional[int] = None
    modified_at: Optional[str] = None


class AIHealthStatus(BaseModel):
    ollama_connected: bool
    base_url: str
    active_text_model: str
    active_vision_model: str
    available_models: List[str] = Field(default_factory=list)

