import asyncio
import time
from typing import Any, Optional
import httpx

from app.core.config import settings
from app.core.exceptions import PayPalIntegrationError
from app.core.logging import logger
from app.utils.money import cents_to_paypal_string


class PayPalClient:
    """Async client for interacting with PayPal REST API (Sandbox mode)."""

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        base_url: Optional[str] = None,
        webhook_id: Optional[str] = None,
    ):
        self.client_id = client_id if client_id is not None else settings.PAYPAL_CLIENT_ID
        self.client_secret = client_secret if client_secret is not None else settings.PAYPAL_CLIENT_SECRET
        self.base_url = (base_url or settings.paypal_api_base_url).rstrip("/")
        self.webhook_id = webhook_id if webhook_id is not None else settings.PAYPAL_WEBHOOK_ID

        self._cached_token: Optional[str] = None
        self._token_expires_at: float = 0.0
        self._lock = asyncio.Lock()

    async def _get_access_token(self) -> str:
        """Fetch or return cached OAuth 2.0 Bearer token."""
        # 60s buffer before expiration
        if self._cached_token and time.time() < (self._token_expires_at - 60):
            return self._cached_token

        async with self._lock:
            # Double-check inside lock
            if self._cached_token and time.time() < (self._token_expires_at - 60):
                return self._cached_token

            if not self.client_id or not self.client_secret:
                raise PayPalIntegrationError(
                    message="PayPal client credentials are not configured.",
                    status_code=500,
                )

            token_url = f"{self.base_url}/v1/oauth2/token"
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    response = await client.post(
                        token_url,
                        data={"grant_type": "client_credentials"},
                        auth=(self.client_id, self.client_secret),
                        headers={"Accept": "application/json", "Accept-Language": "en_US"},
                    )
            except httpx.RequestError as exc:
                logger.error(f"Network error requesting PayPal OAuth token: {exc}")
                raise PayPalIntegrationError(f"PayPal OAuth connection failed: {exc}") from exc

            if response.status_code != 200:
                logger.error(f"PayPal OAuth failure: {response.status_code} - {response.text}")
                raise PayPalIntegrationError(
                    f"PayPal authentication failed with status {response.status_code}",
                    status_code=502,
                    details=response.text,
                )

            data = response.json()
            self._cached_token = data.get("access_token")
            expires_in = data.get("expires_in", 32400)
            self._token_expires_at = time.time() + float(expires_in)
            logger.info("Successfully acquired/refreshed PayPal OAuth token.")
            return self._cached_token

    async def _request(
        self,
        method: str,
        path: str,
        json_data: Optional[dict[str, Any]] = None,
        headers: Optional[dict[str, str]] = None,
    ) -> dict[str, Any]:
        """Perform authenticated HTTP request to PayPal Sandbox API."""
        token = await self._get_access_token()
        url = f"{self.base_url}{path}"
        req_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if headers:
            req_headers.update(headers)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    json=json_data,
                    headers=req_headers,
                )
        except httpx.RequestError as exc:
            logger.error(f"PayPal request error ({method} {path}): {exc}")
            raise PayPalIntegrationError(f"PayPal communication error: {exc}") from exc

        if response.status_code not in (200, 201, 204):
            error_data = None
            try:
                error_data = response.json()
            except Exception:
                error_data = response.text
            logger.error(f"PayPal API error ({method} {path}) -> {response.status_code}: {error_data}")
            raise PayPalIntegrationError(
                message=f"PayPal API error: HTTP {response.status_code}",
                status_code=response.status_code,
                details=error_data,
            )

        if response.status_code == 204:
            return {}

        return response.json()

    async def create_order(
        self,
        amount_cents: int,
        currency: str = "USD",
        description: Optional[str] = None,
        custom_id: Optional[str] = None,
        return_url: str = "https://example.com/return",
        cancel_url: str = "https://example.com/cancel",
    ) -> dict[str, Any]:
        """Create a PayPal order with intent=CAPTURE."""
        amount_str = cents_to_paypal_string(amount_cents)
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "amount": {
                        "currency_code": currency,
                        "value": amount_str,
                    },
                    "description": description or "PayOps Order",
                    "custom_id": custom_id or "",
                }
            ],
            "application_context": {
                "return_url": return_url,
                "cancel_url": cancel_url,
                "user_action": "PAY_NOW",
            },
        }
        return await self._request("POST", "/v2/checkout/orders", json_data=payload)

    async def get_order_details(self, paypal_order_id: str) -> dict[str, Any]:
        """Fetch status and details of an existing order."""
        return await self._request("GET", f"/v2/checkout/orders/{paypal_order_id}")

    async def capture_order(self, paypal_order_id: str) -> dict[str, Any]:
        """Capture payment for an approved PayPal order."""
        return await self._request(
            "POST",
            f"/v2/checkout/orders/{paypal_order_id}/capture",
            headers={"Content-Type": "application/json"},
        )

    async def refund_capture(
        self,
        capture_id: str,
        amount_cents: Optional[int] = None,
        currency: str = "USD",
        reason: Optional[str] = None,
    ) -> dict[str, Any]:
        """Issue a full or partial refund on a completed capture."""
        payload: dict[str, Any] = {}
        if amount_cents is not None:
            payload["amount"] = {
                "value": cents_to_paypal_string(amount_cents),
                "currency_code": currency,
            }
        if reason:
            payload["note_to_payer"] = reason

        return await self._request(
            "POST",
            f"/v2/payments/captures/{capture_id}/refund",
            json_data=payload if payload else None,
        )

    async def get_refund_details(self, paypal_refund_id: str) -> dict[str, Any]:
        """Retrieve details of a refund."""
        return await self._request("GET", f"/v2/payments/refunds/{paypal_refund_id}")

    async def list_disputes(self, dispute_state: Optional[str] = None) -> dict[str, Any]:
        """Query PayPal Sandbox customer disputes."""
        path = "/v1/customer/disputes"
        if dispute_state:
            path += f"?dispute_state={dispute_state}"
        return await self._request("GET", path)

    async def get_dispute_details(self, paypal_dispute_id: str) -> dict[str, Any]:
        """Fetch details of a dispute from PayPal Sandbox."""
        return await self._request("GET", f"/v1/customer/disputes/{paypal_dispute_id}")

    async def accept_dispute_claim(
        self, paypal_dispute_id: str, note: Optional[str] = None
    ) -> dict[str, Any]:
        """Accept customer dispute claim in PayPal Sandbox."""
        payload = {}
        if note:
            payload["note"] = note
        return await self._request(
            "POST",
            f"/v1/customer/disputes/{paypal_dispute_id}/accept-claim",
            json_data=payload if payload else None,
        )

    async def provide_dispute_evidence(
        self,
        paypal_dispute_id: str,
        note: str,
        evidence_type: str = "OTHER",
    ) -> dict[str, Any]:
        """Submit supporting evidence for a PayPal dispute."""
        payload = {
            "evidence_type": evidence_type,
            "notes": note,
        }
        return await self._request(
            "POST",
            f"/v1/customer/disputes/{paypal_dispute_id}/provide-evidence",
            json_data=payload,
        )

    async def verify_webhook_signature(
        self,
        transmission_id: str,
        transmission_time: str,
        cert_url: str,
        auth_algo: str,
        transmission_sig: str,
        webhook_event_payload: dict[str, Any],
        webhook_id: Optional[str] = None,
    ) -> bool:
        """Verify inbound PayPal webhook signature against PayPal Sandbox API."""
        active_webhook_id = webhook_id or self.webhook_id
        if not active_webhook_id:
            logger.warning("No PAYPAL_WEBHOOK_ID configured; webhook verification skipped in non-strict mode.")
            return False

        payload = {
            "transmission_id": transmission_id,
            "transmission_time": transmission_time,
            "cert_url": cert_url,
            "auth_algo": auth_algo,
            "transmission_sig": transmission_sig,
            "webhook_id": active_webhook_id,
            "webhook_event": webhook_event_payload,
        }

        try:
            result = await self._request(
                "POST",
                "/v1/notifications/verify-webhook-signature",
                json_data=payload,
            )
            verification_status = result.get("verification_status")
            return verification_status == "SUCCESS"
        except Exception as exc:
            logger.error(f"Error calling verify-webhook-signature: {exc}")
            return False


_paypal_client_instance: Optional[PayPalClient] = None


def get_paypal_client() -> PayPalClient:
    global _paypal_client_instance
    if _paypal_client_instance is None:
        _paypal_client_instance = PayPalClient()
    return _paypal_client_instance

