from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.pending_action import PendingActionRead, PendingActionResolution
from app.services.pending_action_service import PendingActionService
from app.services.refund_service import RefundService

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[PendingActionRead],
    summary="List actions requiring explicit manual confirmation",
)
def list_pending_actions(
    action_type: Optional[str] = Query(None),
    status: Optional[str] = Query("PENDING"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = PendingActionService(db)
    items, total = service.list_pending(action_type=action_type, status=status, skip=skip, limit=limit)
    return PaginatedResponse(
        items=[PendingActionRead.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.post(
    "/{action_id}/confirm",
    response_model=StandardResponse[PendingActionResolution],
    summary="Confirm and execute a sensitive financial pending action",
)
async def confirm_action(
    action_id: str,
    request: Request,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    service = PendingActionService(db)
    action = service.get_by_id(action_id)
    client_ip = get_client_ip(request)

    if action.action_type == "HIGH_VALUE_REFUND":
        refund_service = RefundService(db)
        await refund_service.confirm_pending_refund(
            action_id=action_id,
            user_id=current_user.id,
            ip_address=client_ip,
        )

    return StandardResponse(
        message="Sensitive action successfully confirmed and executed.",
        data=PendingActionResolution(
            action_id=action_id,
            status="CONFIRMED",
            message="Action executed.",
        ),
    )


@router.post(
    "/{action_id}/reject",
    response_model=StandardResponse[PendingActionResolution],
    summary="Reject a sensitive financial pending action",
)
def reject_action(
    action_id: str,
    request: Request,
    reason: Optional[str] = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    service = PendingActionService(db)
    client_ip = get_client_ip(request)
    service.reject_action(action_id=action_id, user_id=current_user.id, reason=reason, ip_address=client_ip)
    return StandardResponse(
        message="Sensitive action has been rejected.",
        data=PendingActionResolution(
            action_id=action_id,
            status="REJECTED",
            message=reason or "Action was rejected by administrator.",
        ),
    )

