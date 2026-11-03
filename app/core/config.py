import email_validator
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Disable DNS deliverability checks so email validation is instantaneous and offline/sandbox friendly
email_validator.CHECK_DELIVERABILITY = False



class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "PayOps AI Backend"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./payops.db"

    # Security & JWT
    SECRET_KEY: str = "payops-ai-secure-jwt-key-32101a0e690743ad"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # PayPal Sandbox
    PAYPAL_MODE: Literal["sandbox", "live"] = "sandbox"
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_CLIENT_SECRET: str = ""
    PAYPAL_WEBHOOK_ID: str = ""

    # PayPal API base URLs
    @property
    def paypal_api_base_url(self) -> str:
        if self.PAYPAL_MODE == "live":
            return "https://api-m.paypal.com"
        return "https://api-m.sandbox.paypal.com"

    # Security Thresholds (Integer cents)
    SENSITIVE_REFUND_THRESHOLD_CENTS: int = Field(
        default=10000,
        description="Threshold in cents (e.g. 10000 = $100.00) requiring explicit dual confirmation.",
    )

    # Local AI Configuration (Ollama)
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    LLAMA_MODEL: str = "llama3.2:1b"
    QWEN_VL_MODEL: str = "qwen2.5-vl:3b"

    # Logging
    LOG_LEVEL: str = "INFO"


settings = Settings()
