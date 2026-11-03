import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.logging import logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        start_time = time.perf_counter()

        response = await call_next(request)

        process_time_ms = (time.perf_counter() - start_time) * 1000.0
        response.headers["x-request-id"] = request_id
        response.headers["x-process-time-ms"] = f"{process_time_ms:.2f}"

        logger.info(
            f"HTTP {request.method} {request.url.path} -> {response.status_code} in {process_time_ms:.2f}ms [ReqID: {request_id}]"
        )
        return response

