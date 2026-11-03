from typing import Any, Optional


class PayOpsException(Exception):
    """Base exception for PayOps AI domain errors."""

    def __init__(self, message: str, status_code: int = 400, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class EntityNotFoundError(PayOpsException):
    def __init__(self, entity_name: str, identifier: Any):
        super().__init__(
            message=f"{entity_name} with identifier '{identifier}' was not found.",
            status_code=404,
        )


class AuthenticationError(PayOpsException):
    def __init__(self, message: str = "Invalid authentication credentials."):
        super().__init__(message=message, status_code=401)


class AuthorizationError(PayOpsException):
    def __init__(self, message: str = "Operation not permitted for this role."):
        super().__init__(message=message, status_code=403)


class ConflictError(PayOpsException):
    def __init__(self, message: str):
        super().__init__(message=message, status_code=409)


class SensitiveActionRequiredError(PayOpsException):
    def __init__(self, action_id: str, message: str = "Sensitive action requires explicit confirmation."):
        super().__init__(
            message=message,
            status_code=202,
            details={"pending_action_id": action_id},
        )


class PayPalIntegrationError(PayOpsException):
    def __init__(self, message: str, status_code: int = 502, details: Optional[Any] = None):
        super().__init__(message=message, status_code=status_code, details=details)


class WebhookVerificationError(PayOpsException):
    def __init__(self, message: str = "PayPal webhook signature verification failed."):
        super().__init__(message=message, status_code=400)

