from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import PayOpsException
from app.core.logging import logger


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(PayOpsException)
    async def payops_exception_handler(request: Request, exc: PayOpsException):
        logger.warning(f"Domain exception on {request.method} {request.url.path}: {exc.message}")
        content = {
            "success": False,
            "error": {
                "code": exc.__class__.__name__,
                "message": exc.message,
                "details": exc.details,
            },
        }
        return JSONResponse(status_code=exc.status_code, content=content)

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        content = {
            "success": False,
            "error": {
                "code": "HTTPException",
                "message": exc.detail if isinstance(exc.detail, str) else "HTTP Error",
                "details": exc.detail if not isinstance(exc.detail, str) else None,
            },
        }
        return JSONResponse(status_code=exc.status_code, content=content)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Validation failure on {request.method} {request.url.path}: {exc.errors()}")
        content = {
            "success": False,
            "error": {
                "code": "ValidationError",
                "message": "Invalid request parameters or payload.",
                "details": exc.errors(),
            },
        }
        return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=content)

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
        content = {
            "success": False,
            "error": {
                "code": "InternalServerError",
                "message": "An unexpected server error occurred.",
            },
        }
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=content)

