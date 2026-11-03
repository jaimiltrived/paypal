from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.refund import RefundCreate, RefundRead, RefundResult
from app.services.refund_service import RefundService

router = APIRouter()


@router.post(
    "",
    response_model=StandardResponse[RefundResult],
    summary="Issue full or partial refund (requires sensitive confirmation for large amounts)",
)
async def create_refund(
    payload: RefundCreate,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = RefundService(db)
    client_ip = get_client_ip(request)
    result = await service.issue_refund(
        payload=payload,
        user_id=current_user.id,
        bypass_confirmation=False,
        ip_address=client_ip,
    )
    return StandardResponse(
        message=result.message,
        data=result,
    )


@router.get(
    "",
    response_model=PaginatedResponse[RefundRead],
    summary="List refunds with pagination and order_id filter",
)
def list_refunds(
    order_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RefundService(db)
    items, total = service.list_refunds(order_id=order_id, status=status, skip=skip, limit=limit)
    return PaginatedResponse(
        items=[RefundRead.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{refund_id}",
    response_model=StandardResponse[RefundRead],
    summary="Get refund details by ID or PayPal Refund ID",
)
def get_refund(
    refund_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RefundService(db)
    refund = service.get_refund(refund_id)
    return StandardResponse(data=RefundRead.model_validate(refund))

