from fastapi import APIRouter, BackgroundTasks, status

from app.api.dependencies import DBSession
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from app.schemas.token import Token
from app.schemas.user import UserRead
from app.services.auth import (
    login_user,
    register_user,
    request_password_reset,
    reset_password_with_token,
)

router = APIRouter()


# ==========================================================
# Register
# ==========================================================

@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register User",
)
async def register(
    register_in: RegisterRequest,
    db: DBSession,
) -> UserRead:
    """
    Register a new citizen account.
    """

    return await register_user(
        db=db,
        register_in=register_in,
    )


# ==========================================================
# Login
# ==========================================================

@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
    summary="User Login",
)
async def login(
    login_in: LoginRequest,
    db: DBSession,
) -> Token:
    """
    Authenticate a user and return a JWT access token.
    """

    return await login_user(
        db=db,
        login_in=login_in,
    )


# ==========================================================
# Forgot Password
# ==========================================================

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Forgot Password",
)
async def forgot_password(
    forgot_in: ForgotPasswordRequest,
    db: DBSession,
    background_tasks: BackgroundTasks,
) -> MessageResponse:
    """
    Request password reset email.
    """

    return await request_password_reset(
        db=db,
        forgot_in=forgot_in,
        background_tasks=background_tasks,
    )


# ==========================================================
# Reset Password
# ==========================================================

@router.post(
    "/reset-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset Password",
)
async def reset_password(
    reset_in: ResetPasswordRequest,
    db: DBSession,
) -> MessageResponse:
    """
    Complete password reset using secure token.
    """

    return await reset_password_with_token(
        db=db,
        reset_in=reset_in,
    )