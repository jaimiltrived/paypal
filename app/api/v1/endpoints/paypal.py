from typing import Any, Dict
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.integrations.paypal.client import get_paypal_client
from app.models.user import User
from app.schemas.common import StandardResponse

router = APIRouter()


@router.get("/status", summary="Get PayPal Sandbox connection and telemetry status")
async def get_paypal_status(
    current_user: User = Depends(get_current_user),
) -> StandardResponse[Dict[str, Any]]:
    """Check PayPal Sandbox REST API configuration and live connectivity status."""
    client = get_paypal_client()
    status_data = await client.test_connection()
    return StandardResponse(
        message="PayPal Sandbox telemetry retrieved.",
        data=status_data,
    )


@router.post("/test-connection", summary="Test live OAuth handshake with PayPal Sandbox")
async def test_paypal_connection(
    current_user: User = Depends(get_current_user),
) -> StandardResponse[Dict[str, Any]]:
    """Trigger an active OAuth 2.0 client credentials token exchange with PayPal Sandbox."""
    client = get_paypal_client()
    # Force token refresh to test live connectivity
    client._cached_token = None
    client._token_expires_at = 0.0
    status_data = await client.test_connection()
    return StandardResponse(
        message="PayPal Sandbox connection test completed.",
        data=status_data,
    )
