from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.logging import logger
from app.middleware.error_handler import register_error_handlers
from app.middleware.request_logger import RequestLoggingMiddleware
from app.models import *  # Ensure all models are registered with Base metadata
from app.services.auth_service import AuthService


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and seed roles
    logger.info("Starting PayOps AI Backend...")
    Base.metadata.create_all(bind=engine)

    # Initialize default roles
    db = SessionLocal()
    try:
        auth_service = AuthService(db)
        auth_service.ensure_default_roles()
        logger.info("Database initialized and system roles verified.")
    finally:
        db.close()

    yield

    # Shutdown
    logger.info("Shutting down PayOps AI Backend.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="0.1.0",
        description="PayOps AI - High-Security Payment Operations Backend",
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # CORS Configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request ID and Latency Middleware
    app.add_middleware(RequestLoggingMiddleware)

    # Centralized Error Handlers
    register_error_handlers(app)

    # Mount API V1
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return app




app = create_app()
