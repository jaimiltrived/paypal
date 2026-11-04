from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.payout import PayoutCreate, PayoutMetrics, PayoutRead
from app.services.payout_service import PayoutService

router = APIRouter()


@router.post(
    "",
    response_model=StandardResponse[PayoutRead],
    summary="Create and execute a partner disbursement / payout",
)
def create_payout(
    payload: PayoutCreate,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = PayoutService(db)
    client_ip = get_client_ip(request)
    payout = service.create_payout(
        payload=payload,
        user_id=current_user.id,
        ip_address=client_ip,
    )
    return StandardResponse(
        message="Partner disbursement successfully executed.",
        data=PayoutRead.model_validate(payout),
    )


@router.get(
    "",
    response_model=PaginatedResponse[PayoutRead],
    summary="List partner disbursements with status and recipient filtering",
)
def list_payouts(
    status: Optional[str] = Query(None, description="Filter by status (SUCCESS, PENDING, FAILED)"),
    recipient_email: Optional[str] = Query(None, description="Search by recipient email"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    service = PayoutService(db)
    items, total = service.list_payouts(
        status=status,
        recipient_email=recipient_email,
        skip=skip,
        limit=limit,
    )
    return PaginatedResponse(
        items=[PayoutRead.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/metrics",
    response_model=StandardResponse[PayoutMetrics],
    summary="Get aggregated partner disbursement volume and metrics",
)
def get_payout_metrics(
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    service = PayoutService(db)
    metrics = service.get_metrics()
    return StandardResponse(data=metrics)


@router.get(
    "/{payout_id}",
    response_model=StandardResponse[PayoutRead],
    summary="Get payout details by internal ID or batch ID",
)
def get_payout(
    payout_id: str,
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    service = PayoutService(db)
    payout = service.get_payout(payout_id)
    return StandardResponse(data=PayoutRead.model_validate(payout))

