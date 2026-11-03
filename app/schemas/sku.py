from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class SKUCreate(BaseModel):
    sku_code: str = Field(min_length=2, max_length=50, description="Unique SKU code (e.g. SKU-PROD-001)")
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)
    price_cents: int = Field(gt=0, description="Price in integer cents (e.g. 1999 = $19.99)")
    currency: str = Field(default="USD", min_length=3, max_length=3)
    stock_quantity: int = Field(default=0, ge=0)


class SKUUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)
    price_cents: Optional[int] = Field(default=None, gt=0)
    currency: Optional[str] = Field(default=None, min_length=3, max_length=3)
    stock_quantity: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None


class SKURead(BaseSchema):
    id: str
    sku_code: str
    name: str
    description: Optional[str] = None
    price_cents: int
    currency: str
    stock_quantity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

