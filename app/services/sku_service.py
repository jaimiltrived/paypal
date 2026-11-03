from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.core.exceptions import ConflictError, EntityNotFoundError, PayOpsException
from app.models.sku import SKU
from app.repositories.sku_repo import SKURepository
from app.schemas.sku import SKUCreate, SKUUpdate
from app.services.audit_service import AuditService


class SKUService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = SKURepository(db)
        self.audit = AuditService(db)

    def create_sku(
        self,
        payload: SKUCreate,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> SKU:
        sku_code = payload.sku_code.upper().strip()
        existing = self.repo.get_by_code(sku_code)
        if existing:
            raise ConflictError(f"SKU with code '{sku_code}' already exists.")

        if payload.price_cents <= 0:
            raise PayOpsException("SKU price must be strictly greater than 0 cents.")

        sku = SKU(
            sku_code=sku_code,
            name=payload.name.strip(),
            description=payload.description,
            price_cents=payload.price_cents,
            currency=payload.currency.upper(),
            stock_quantity=payload.stock_quantity,
            is_active=True,
        )
        created = self.repo.create(sku)

        self.audit.log_action(
            action="SKU_CREATED",
            entity_type="sku",
            entity_id=created.id,
            user_id=user_id,
            new_values={
                "sku_code": created.sku_code,
                "price_cents": created.price_cents,
                "stock_quantity": created.stock_quantity,
            },
            ip_address=ip_address,
        )
        return created

    def update_sku(
        self,
        sku_id: str,
        payload: SKUUpdate,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> SKU:
        sku = self.get_sku(sku_id)
        old_values = {
            "name": sku.name,
            "price_cents": sku.price_cents,
            "stock_quantity": sku.stock_quantity,
            "is_active": sku.is_active,
        }

        if payload.name is not None:
            sku.name = payload.name.strip()
        if payload.description is not None:
            sku.description = payload.description
        if payload.price_cents is not None:
            if payload.price_cents <= 0:
                raise PayOpsException("SKU price must be strictly greater than 0 cents.")
            sku.price_cents = payload.price_cents
        if payload.currency is not None:
            sku.currency = payload.currency.upper()
        if payload.stock_quantity is not None:
            sku.stock_quantity = payload.stock_quantity
        if payload.is_active is not None:
            sku.is_active = payload.is_active

        updated = self.repo.update(sku)

        self.audit.log_action(
            action="SKU_UPDATED",
            entity_type="sku",
            entity_id=updated.id,
            user_id=user_id,
            old_values=old_values,
            new_values={
                "name": updated.name,
                "price_cents": updated.price_cents,
                "stock_quantity": updated.stock_quantity,
                "is_active": updated.is_active,
            },
            ip_address=ip_address,
        )
        return updated

    def get_sku(self, sku_id: str) -> SKU:
        sku = self.repo.get_by_id(sku_id)
        if not sku:
            sku = self.repo.get_by_code(sku_id)
        if not sku:
            raise EntityNotFoundError("SKU", sku_id)
        return sku

    def search_skus(
        self,
        query: Optional[str] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[SKU], int]:
        return self.repo.search_skus(query_str=query, is_active=is_active, skip=skip, limit=limit)

