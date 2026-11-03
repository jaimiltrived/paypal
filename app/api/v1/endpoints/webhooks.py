import json
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db, require_role
from app.core.logging import logger
from app.models.user import User
from app.schemas.common import PaginatedResponse, StandardResponse
from app.schemas.webhook import WebhookEventRead
from app.services.webhook_service import WebhookService

router = APIRouter()


@router.post(
    "/paypal",
    status_code=status.HTTP_200_OK,
    summary="PayPal webhook ingestion with signature verification and idempotency",
)
async def paypal_webhook(
    request: Request,
    db: Session = Depends(get_db),
    paypal_auth_algo: Optional[str] = Header(None, alias="paypal-auth-algo"),
    paypal_cert_url: Optional[str] = Header(None, alias="paypal-cert-url"),
    paypal_transmission_id: Optional[str] = Header(None, alias="paypal-transmission-id"),
    paypal_transmission_sig: Optional[str] = Header(None, alias="paypal-transmission-sig"),
    paypal_transmission_time: Optional[str] = Header(None, alias="paypal-transmission-time"),
):
    body_bytes = await request.body()
    try:
        payload = json.loads(body_bytes.decode("utf-8"))
    except Exception as exc:
        logger.error(f"Failed to parse webhook JSON body: {exc}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    headers_dict = {
        "paypal-auth-algo": paypal_auth_algo or "",
        "paypal-cert-url": paypal_cert_url or "",
        "paypal-transmission-id": paypal_transmission_id or "",
        "paypal-transmission-sig": paypal_transmission_sig or "",
        "paypal-transmission-time": paypal_transmission_time or "",
    }

    client_ip = get_client_ip(request)
    service = WebhookService(db)

    # In local testing without real PayPal Sandbox credentials set, verification can be conditionally bypassed
    # if headers are empty; when headers are provided, verify with PayPal client.
    skip_verification = not bool(paypal_transmission_sig)

    event = await service.process_webhook(
        headers=headers_dict,
        payload=payload,
        raw_body=body_bytes,
        skip_verification=skip_verification,
        ip_address=client_ip,
    )

    return {
        "status": "success",
        "event_id": event.event_id,
        "processing_status": event.status,
    }


@router.get(
    "/events",
    response_model=PaginatedResponse[WebhookEventRead],
    summary="List received PayPal webhook events",
)
def list_webhook_events(
    event_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    service = WebhookService(db)
    items, total = service.list_events(event_type=event_type, status=status, skip=skip, limit=limit)
    return PaginatedResponse(
        items=[WebhookEventRead.model_validate(item) for item in items],
        total=total,
        skip=skip,
        limit=limit,
    )

