from sqlalchemy import Column, String, Integer, Boolean
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid


class SKU(Base, TimestampMixin):
    __tablename__ = "skus"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sku_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    price_cents = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")
    stock_quantity = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
