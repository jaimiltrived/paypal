from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.sku import SKUCreate, SKURead, SKUUpdate
from app.services.sku_service import SKUService

router = APIRouter()


@router.post(
    "",
    response_model=StandardResponse[SKURead],
    summary="Create a new SKU item",
)
def create_sku(
    payload: SKUCreate,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = SKUService(db)
    client_ip = get_client_ip(request)
    sku = service.create_sku(payload, user_id=current_user.id, ip_address=client_ip)
    return StandardResponse(
        message="SKU created successfully.",
        data=SKURead.model_validate(sku),
    )


@router.get(
    "",
    response_model=PaginatedResponse[SKURead],
    summary="List SKUs with search query and active filter",
)
def list_skus(
    q: Optional[str] = Query(None, description="Search term for name or SKU code"),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = SKUService(db)
    items, total = service.search_skus(query=q, is_active=is_active, skip=skip, limit=limit)
    return PaginatedResponse(
        items=[SKURead.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{sku_id}",
    response_model=StandardResponse[SKURead],
    summary="Get SKU details by ID or SKU Code",
)
def get_sku(
    sku_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = SKUService(db)
    sku = service.get_sku(sku_id)
    return StandardResponse(data=SKURead.model_validate(sku))


@router.put(
    "/{sku_id}",
    response_model=StandardResponse[SKURead],
    summary="Update SKU properties, inventory, or pricing",
)
def update_sku(
    sku_id: str,
    payload: SKUUpdate,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = SKUService(db)
    client_ip = get_client_ip(request)
    updated = service.update_sku(sku_id, payload, user_id=current_user.id, ip_address=client_ip)
    return StandardResponse(
        message="SKU updated successfully.",
        data=SKURead.model_validate(updated),
    )

