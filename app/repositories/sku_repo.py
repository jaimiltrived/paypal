from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.sku import SKU
from app.repositories.base import BaseRepository


class SKURepository(BaseRepository[SKU]):
    def __init__(self, db: Session):
        super().__init__(SKU, db)

    def get_by_code(self, sku_code: str) -> Optional[SKU]:
        return self.db.query(SKU).filter(SKU.sku_code == sku_code.upper().strip()).first()

    def search_skus(
        self,
        query_str: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[SKU], int]:
        query = self.db.query(SKU)
        if query_str:
            q = f"%{query_str.strip()}%"
            query = query.filter((SKU.name.ilike(q)) | (SKU.sku_code.ilike(q)))
        if is_active is not None:
            query = query.filter(SKU.is_active == is_active)

        total = query.count()
        items = query.order_by(SKU.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

