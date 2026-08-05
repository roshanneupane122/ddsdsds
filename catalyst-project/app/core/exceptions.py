import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

# ==========================================================
# Logger
# ==========================================================

logger = logging.getLogger(__name__)


# ==========================================================
# Standard Error Response
# ==========================================================

def error_response(
    *,
    status_code: int,
    message: str | dict | list,
    details: Any = None,
) -> JSONResponse:
    """
    Return a standardized error response.
    """

    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


# ==========================================================
# HTTP Exceptions
# ==========================================================

async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    """
    Handle HTTPExceptions raised by FastAPI.
    """

    return error_response(
        status_code=exc.status_code,
        message=exc.detail,
    )


# ==========================================================
# Validation Errors
# ==========================================================

async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """
    Handle request validation errors.
    """

    return error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Validation Error",
        details=exc.errors(),
    )


# ==========================================================
# Database Errors
# ==========================================================

async def sqlalchemy_exception_handler(
    request: Request,
    exc: SQLAlchemyError,
) -> JSONResponse:
    """
    Handle SQLAlchemy exceptions.
    """

    logger.exception("Database Error: %s", exc)

    return error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Database Error",
    )


# ==========================================================
# Unexpected Errors
# ==========================================================

async def general_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """
    Handle unexpected server exceptions.
    """

    logger.exception("Unhandled Exception: %s", exc)

    return error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Internal Server Error",
    )


# ==========================================================
# Register Exception Handlers
# ==========================================================

def register_exception_handlers(
    app: FastAPI,
) -> None:
    """
    Register all global exception handlers.
    """

    app.add_exception_handler(
        StarletteHTTPException,
        http_exception_handler,
    )

    app.add_exception_handler(
        RequestValidationError,
        validation_exception_handler,
    )

    app.add_exception_handler(
        SQLAlchemyError,
        sqlalchemy_exception_handler,
    )

    app.add_exception_handler(
        Exception,
        general_exception_handler,
    )