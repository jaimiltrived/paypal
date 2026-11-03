from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.dispute import (
    DisputeAcceptRequest,
    DisputeEvidenceRequest,
    DisputeRead,
    DisputeSyncResponse,
)
from app.services.dispute_service import DisputeService

router = APIRouter()


@router.post(
    "/sync",
    response_model=StandardResponse[DisputeSyncResponse],
    summary="Synchronize disputes from PayPal Sandbox",
)
async def sync_disputes(
    request: Request,
    dispute_state: Optional[str] = Query(None, description="Dispute state filter (e.g. REQUIRED_ACTION)"),
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = DisputeService(db)
    client_ip = get_client_ip(request)
    synced = await service.sync_disputes_from_paypal(
        dispute_state=dispute_state,
        user_id=current_user.id,
        ip_address=client_ip,
    )
    return StandardResponse(
        message=f"Successfully synchronized {len(synced)} disputes from PayPal Sandbox.",
        data=DisputeSyncResponse(
            synced_count=len(synced),
            items=[DisputeRead.model_validate(item) for item in synced],
        ),
    )


@router.get(
    "",
    response_model=PaginatedResponse[DisputeRead],
    summary="List disputes with status and order filtering",
)
def list_disputes(
    status: Optional[str] = Query(None),
    order_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    service = DisputeService(db)
    items, total = service.list_disputes(status=status, order_id=order_id, skip=skip, limit=limit)
    return PaginatedResponse(
        items=[DisputeRead.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{dispute_id}",
    response_model=StandardResponse[DisputeRead],
    summary="Get dispute details by ID or PayPal Dispute ID",
)
def get_dispute(
    dispute_id: str,
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    service = DisputeService(db)
    dispute = service.get_dispute(dispute_id)
    return StandardResponse(data=DisputeRead.model_validate(dispute))


@router.post(
    "/{dispute_id}/evidence",
    response_model=StandardResponse[DisputeRead],
    summary="Submit dispute evidence to PayPal Sandbox",
)
async def submit_dispute_evidence(
    dispute_id: str,
    payload: DisputeEvidenceRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = DisputeService(db)
    client_ip = get_client_ip(request)
    updated = await service.provide_evidence(
        dispute_id=dispute_id,
        payload=payload,
        user_id=current_user.id,
        ip_address=client_ip,
    )
    return StandardResponse(
        message="Dispute evidence submitted successfully.",
        data=DisputeRead.model_validate(updated),
    )


@router.post(
    "/{dispute_id}/accept",
    response_model=StandardResponse[DisputeRead],
    summary="Accept dispute claim and close liability",
)
async def accept_dispute(
    dispute_id: str,
    payload: DisputeAcceptRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = DisputeService(db)
    client_ip = get_client_ip(request)
    updated = await service.accept_claim(
        dispute_id=dispute_id,
        note=payload.note,
        user_id=current_user.id,
        ip_address=client_ip,
    )
    return StandardResponse(
        message="Dispute claim accepted successfully.",
        data=DisputeRead.model_validate(updated),
    )

