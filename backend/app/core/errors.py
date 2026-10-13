"""Centralized API error definitions, machine-readable codes, and exception handlers."""

import logging
from enum import Enum
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class APIErrorCode(str, Enum):
    """Stable, machine-readable error codes for client consumption."""

    AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    INVALID_TOKEN = "INVALID_TOKEN"
    FORBIDDEN = "FORBIDDEN"
    OWNERSHIP_VIOLATION = "OWNERSHIP_VIOLATION"
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    RESOURCE_CONFLICT = "RESOURCE_CONFLICT"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INVALID_CLASS_LEVEL = "INVALID_CLASS_LEVEL"
    INVALID_STATUS = "INVALID_STATUS"
    INVALID_QUESTION = "INVALID_QUESTION"
    ATTEMPT_ALREADY_SUBMITTED = "ATTEMPT_ALREADY_SUBMITTED"
    UNAUTHORIZED_ANSWER_ACCESS = "UNAUTHORIZED_ANSWER_ACCESS"
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"


class APIException(Exception):
    """Base application exception with standardized code, safe message, and status."""

    def __init__(
        self,
        status_code: int = 500,
        error_code: Optional[APIErrorCode] = None,
        message: str = "",
        details: Optional[Any] = None,
        code: Optional[APIErrorCode] = None,
    ):
        self.status_code = status_code
        self.error_code = error_code or code or APIErrorCode.INTERNAL_SERVER_ERROR
        self.message = message
        self.details = details
        super().__init__(message)


def build_error_payload(
    code: str, message: str, details: Optional[Any] = None
) -> Dict[str, Any]:
    """Uniform error response structure."""
    payload: Dict[str, Any] = {
        "error": {
            "code": code,
            "message": message,
            "details": details,
        }
    }
    return payload


async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """Handle custom APIException instances."""
    code_val = exc.error_code.value if hasattr(exc.error_code, "value") else str(exc.error_code)
    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_payload(
            code=code_val,
            message=exc.message,
            details=exc.details,
        ),
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle FastAPI/Pydantic request validation errors."""
    clean_errors = []
    for err in exc.errors():
        clean_errors.append(
            {
                "loc": [str(x) for x in err.get("loc", [])],
                "msg": err.get("msg", "Validation error"),
                "type": err.get("type", "value_error"),
            }
        )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=build_error_payload(
            code=APIErrorCode.VALIDATION_ERROR.value,
            message="Request validation failed. Verify input parameters.",
            details=clean_errors,
        ),
    )


async def starlette_http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Handle standard HTTPExceptions safely."""
    code_map = {
        401: APIErrorCode.AUTHENTICATION_REQUIRED.value,
        403: APIErrorCode.FORBIDDEN.value,
        404: APIErrorCode.RESOURCE_NOT_FOUND.value,
        409: APIErrorCode.RESOURCE_CONFLICT.value,
        422: APIErrorCode.VALIDATION_ERROR.value,
    }
    code = code_map.get(exc.status_code, APIErrorCode.INTERNAL_SERVER_ERROR.value)
    return JSONResponse(
        status_code=exc.status_code,
        content=build_error_payload(
            code=code,
            message=str(exc.detail) if exc.detail else "HTTP error occurred",
            details=None,
        ),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all unhandled exceptions: logs safely without leaking stack traces or credentials."""
    logger.error(
        "Unhandled server error at %s %s: %s",
        request.method,
        request.url.path,
        str(exc),
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=build_error_payload(
            code=APIErrorCode.INTERNAL_SERVER_ERROR.value,
            message="An internal server error occurred. Please try again later.",
            details=None,
        ),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all centralized exception handlers onto the FastAPI application."""
    app.add_exception_handler(APIException, api_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, starlette_http_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
