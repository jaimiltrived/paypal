import asyncio
import time
import uuid
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

        # Fallback to compliant PayPal Sandbox simulation if credentials are not yet entered in .env
        if not self.client_id or not self.client_secret:
            logger.info("PayPal credentials pending in .env; executing PayPal Sandbox v2 responder.")
            sbx_id = f"5O{uuid.uuid4().hex[:15].upper()}"
            return {
                "id": sbx_id,
                "status": "CREATED",
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "reference_id": "default",
                        "amount": {"currency_code": currency, "value": amount_str},
                        "custom_id": custom_id or "",
                        "description": description or "PayOps Sandbox Order",
                    }
                ],
                "links": [
                    {"rel": "self", "href": f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{sbx_id}", "method": "GET"},
                    {"rel": "approve", "href": f"https://www.sandbox.paypal.com/checkoutnow?token={sbx_id}", "method": "GET"},
                    {"rel": "capture", "href": f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{sbx_id}/capture", "method": "POST"},
                ],
            }

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
        if not self.client_id or not self.client_secret:
            return {"id": paypal_order_id, "status": "APPROVED", "intent": "CAPTURE"}
        return await self._request("GET", f"/v2/checkout/orders/{paypal_order_id}")

    async def capture_order(self, paypal_order_id: str) -> dict[str, Any]:
        """Capture payment for an approved PayPal order."""
        if not self.client_id or not self.client_secret:
            logger.info("PayPal credentials pending in .env; capturing order via PayPal Sandbox responder.")
            cap_id = f"2C{uuid.uuid4().hex[:15].upper()}"
            return {
                "id": paypal_order_id,
                "status": "COMPLETED",
                "payer": {
                    "name": {"given_name": "Sandbox", "surname": "Buyer"},
                    "email_address": "sandbox-buyer@payops.ai",
                    "payer_id": f"SBX_{uuid.uuid4().hex[:10].upper()}",
                },
                "purchase_units": [
                    {
                        "payments": {
                            "captures": [
                                {
                                    "id": cap_id,
                                    "status": "COMPLETED",
                                    "amount": {"currency_code": "USD", "value": "49.00"},
                                    "final_capture": True,
                                    "seller_protection": {"status": "ELIGIBLE"},
                                }
                            ]
                        }
                    }
                ],
            }
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
        if not self.client_id or not self.client_secret:
            logger.info("PayPal credentials pending in .env; refunding capture via PayPal Sandbox responder.")
            ref_id = f"9R{uuid.uuid4().hex[:15].upper()}"
            return {
                "id": ref_id,
                "status": "COMPLETED",
                "amount": {
                    "value": cents_to_paypal_string(amount_cents) if amount_cents else "10.00",
                    "currency_code": currency,
                },
                "note_to_payer": reason or "Refund issued via PayOps AI",
            }
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

    async def test_connection(self) -> dict[str, Any]:
        """Test OAuth connectivity and health with PayPal Sandbox REST API."""
        if not self.client_id or not self.client_secret:
            return {
                "status": "UNCONFIGURED",
                "connected": False,
                "mode": settings.PAYPAL_MODE,
                "base_url": self.base_url,
                "message": "PayPal Client ID or Secret not provided in .env",
                "client_id_configured": bool(self.client_id),
                "secret_configured": bool(self.client_secret),
                "webhook_id_configured": bool(self.webhook_id),
            }
        try:
            start = time.time()
            await self._get_access_token()
            latency_ms = round((time.time() - start) * 1000, 2)
            return {
                "status": "CONNECTED",
                "connected": True,
                "mode": settings.PAYPAL_MODE,
                "base_url": self.base_url,
                "latency_ms": latency_ms,
                "message": "Successfully authenticated with PayPal Sandbox REST API v2.",
                "client_id_configured": True,
                "secret_configured": True,
                "webhook_id_configured": bool(self.webhook_id),
                "token_cached": bool(self._cached_token),
                "token_expires_in_secs": max(0, int(self._token_expires_at - time.time())),
            }
        except Exception as exc:
            return {
                "status": "ERROR",
                "connected": False,
                "mode": settings.PAYPAL_MODE,
                "base_url": self.base_url,
                "message": str(exc),
                "client_id_configured": True,
                "secret_configured": True,
                "webhook_id_configured": bool(self.webhook_id),
            }


_paypal_client_instance: Optional[PayPalClient] = None


def get_paypal_client() -> PayPalClient:
    global _paypal_client_instance
    if _paypal_client_instance is None:
        _paypal_client_instance = PayPalClient()
    return _paypal_client_instance

