from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db
from app.models.user import User
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.order import OrderCaptureResponse, OrderCreate, OrderRead
from app.services.order_service import OrderService

router = APIRouter()


@router.post(
    "",
    response_model=StandardResponse[OrderRead],
    summary="Create order in PayPal Sandbox and PayOps database",
)
async def create_order(
    payload: OrderCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    client_ip = get_client_ip(request)
    order, approval_url = await service.create_order(
        payload=payload,
        user_id=current_user.id,
        ip_address=client_ip,
    )
    order_read = OrderRead.model_validate(order)
    order_read.approval_url = approval_url

    return StandardResponse(
        message="Order created successfully in PayPal Sandbox.",
        data=order_read,
    )


@router.get(
    "",
    response_model=PaginatedResponse[OrderRead],
    summary="List orders with status filter and pagination",
)
def list_orders(
    status: Optional[str] = Query(None, description="Filter by status (CREATED, APPROVED, COMPLETED, etc.)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    # Non-admin users only see their own orders
    user_filter = None
    if current_user.role and current_user.role.name not in ("admin", "operator", "auditor"):
        user_filter = current_user.id

    items, total = service.list_orders(status=status, user_id=user_filter, skip=skip, limit=limit)
    return PaginatedResponse(
        items=[OrderRead.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{order_id}",
    response_model=StandardResponse[OrderRead],
    summary="Get order details by PayOps ID or PayPal Order ID",
)
def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    order = service.get_order_by_id(order_id)
    return StandardResponse(data=OrderRead.model_validate(order))


@router.post(
    "/{order_id}/capture",
    response_model=StandardResponse[OrderCaptureResponse],
    summary="Capture an approved PayPal order",
)
async def capture_order(
    order_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    client_ip = get_client_ip(request)
    captured_order = await service.capture_order(
        order_id=order_id,
        user_id=current_user.id,
        ip_address=client_ip,
    )
    return StandardResponse(
        message="Order payment captured successfully.",
        data=OrderCaptureResponse(
            order_id=captured_order.id,
            paypal_order_id=captured_order.paypal_order_id or "",
            status=captured_order.status,
            capture_id=captured_order.capture_id,
            amount_cents=captured_order.amount_cents,
            currency=captured_order.currency,
        ),
    )

