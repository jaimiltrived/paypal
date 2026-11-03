from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_role
from app.models.user import User
from app.repositories.audit_repo import AuditRepository
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.ledger import AuditLogRead, LedgerSummaryResponse, LedgerTransaction
from app.services.ledger_service import LedgerService

router = APIRouter()


@router.get(
    "/summary",
    response_model=StandardResponse[LedgerSummaryResponse],
    summary="Get aggregated financial metrics in integer cents",
)
def get_ledger_summary(
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    service = LedgerService(db)
    summary = service.get_ledger_summary()
    return StandardResponse(data=summary)


@router.get(
    "/transactions",
    response_model=PaginatedResponse[LedgerTransaction],
    summary="Get unified double-entry style financial transaction ledger",
)
def get_ledger_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    service = LedgerService(db)
    items, total = service.get_ledger_transactions(skip=skip, limit=limit)
    return PaginatedResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/audit-logs",
    response_model=PaginatedResponse[AuditLogRead],
    summary="Query immutable financial and security audit logs",
)
def get_audit_logs(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["admin", "auditor"])),
    db: Session = Depends(get_db),
):
    repo = AuditRepository(db)
    items, total = repo.search_logs(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        user_id=user_id,
        skip=skip,
        limit=limit,
    )
    return PaginatedResponse(
        items=[AuditLogRead.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )

