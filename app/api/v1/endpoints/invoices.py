from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.invoice import InvoiceCreate, InvoicePayRequest, InvoiceRead
from app.services.invoice_service import InvoiceService

router = APIRouter()


@router.post(
    "",
    response_model=StandardResponse[InvoiceRead],
    summary="Create a new draft invoice with line items",
)
def create_invoice(
    payload: InvoiceCreate,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    client_ip = get_client_ip(request)
    invoice = service.create_invoice(payload, user_id=current_user.id, ip_address=client_ip)
    return StandardResponse(
        message="Invoice created successfully.",
        data=InvoiceRead.model_validate(invoice),
    )


@router.get(
    "",
    response_model=PaginatedResponse[InvoiceRead],
    summary="List invoices with status and order filtering",
)
def list_invoices(
    status: Optional[str] = Query(None, description="Filter by status (DRAFT, SENT, PAID, CANCELLED)"),
    order_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    user_filter = None
    if current_user.role and current_user.role.name not in ("admin", "operator", "auditor"):
        user_filter = current_user.id

    items, total = service.search_invoices(
        status=status, user_id=user_filter, order_id=order_id, skip=skip, limit=limit
    )
    return PaginatedResponse(
        items=[InvoiceRead.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{invoice_id}",
    response_model=StandardResponse[InvoiceRead],
    summary="Get invoice details by ID or Invoice Number",
)
def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    invoice = service.get_invoice(invoice_id)
    return StandardResponse(data=InvoiceRead.model_validate(invoice))


@router.post(
    "/{invoice_id}/send",
    response_model=StandardResponse[InvoiceRead],
    summary="Issue and send invoice",
)
def send_invoice(
    invoice_id: str,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    client_ip = get_client_ip(request)
    invoice = service.send_invoice(invoice_id, user_id=current_user.id, ip_address=client_ip)
    return StandardResponse(
        message="Invoice sent successfully.",
        data=InvoiceRead.model_validate(invoice),
    )


@router.post(
    "/{invoice_id}/pay",
    response_model=StandardResponse[InvoiceRead],
    summary="Record invoice payment and deduct inventory",
)
def pay_invoice(
    invoice_id: str,
    payload: InvoicePayRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    client_ip = get_client_ip(request)
    invoice = service.pay_invoice(
        invoice_id=invoice_id,
        payload=payload,
        user_id=current_user.id,
        ip_address=client_ip,
    )
    return StandardResponse(
        message="Invoice payment recorded successfully.",
        data=InvoiceRead.model_validate(invoice),
    )


@router.post(
    "/{invoice_id}/cancel",
    response_model=StandardResponse[InvoiceRead],
    summary="Cancel an unpaid invoice",
)
def cancel_invoice(
    invoice_id: str,
    request: Request,
    reason: Optional[str] = Query(None),
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    service = InvoiceService(db)
    client_ip = get_client_ip(request)
    invoice = service.cancel_invoice(
        invoice_id=invoice_id,
        reason=reason,
        user_id=current_user.id,
        ip_address=client_ip,
    )
    return StandardResponse(
        message="Invoice cancelled.",
        data=InvoiceRead.model_validate(invoice),
    )

