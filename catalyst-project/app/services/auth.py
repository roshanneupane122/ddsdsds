import secrets
from datetime import datetime, timezone, timedelta
from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    TOKEN_TYPE,
    WWW_AUTHENTICATE_SCHEME,
    create_access_token,
    hash_password,
    verify_password,
)
from app.crud.user import get_user_by_email, get_user_by_reset_token
from app.models.user import User, UserRole
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from app.schemas.token import Token
from app.schemas.user import UserCreate
from app.services.email import send_password_reset_email
from app.services.user import create_new_user


# ==========================================================
# Login User
# ==========================================================

async def login_user(
    db: AsyncSession,
    *,
    login_in: LoginRequest,
) -> Token:
    """
    Authenticate a user and generate a JWT access token.
    """

    # Find user by email
    user = await get_user_by_email(
        db=db,
        email=login_in.email,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": WWW_AUTHENTICATE_SCHEME,
            },
        )

    # Verify password
    if not verify_password(
        login_in.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": WWW_AUTHENTICATE_SCHEME,
            },
        )

    # Generate JWT
    access_token = create_access_token(
        subject=str(user.user_id),
        role=user.role,
    )

    return Token(
        access_token=access_token,
        token_type=TOKEN_TYPE,
    )


# ==========================================================
# Register User
# ==========================================================

async def register_user(
    db: AsyncSession,
    *,
    register_in: RegisterRequest,
) -> User:
    """
    Register a new citizen account.

    Business Rules:
    - Every newly registered user is assigned the CITIZEN role.
    """

    user_in = UserCreate(
        name=register_in.name,
        email=register_in.email,
        password=register_in.password,
        role=UserRole.CITIZEN,
    )

    return await create_new_user(
        db=db,
        user_in=user_in,
    )


# ==========================================================
# Request Password Reset
# ==========================================================

async def request_password_reset(
    db: AsyncSession,
    *,
    forgot_in: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
) -> MessageResponse:
    """
    Initiates password reset by generating a secure token and emailing user.
    """
    user = await get_user_by_email(db=db, email=forgot_in.email)
    
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.RESET_TOKEN_EXPIRE_MINUTES
        )
        
        await db.commit()
        await db.refresh(user)

        background_tasks.add_task(
            send_password_reset_email,
            email_to=user.email,
            token=token,
            user_name=user.name,
        )

    return MessageResponse(
        message="If an account with that email exists, password reset instructions have been sent to your inbox."
    )


# ==========================================================
# Reset Password With Token
# ==========================================================

async def reset_password_with_token(
    db: AsyncSession,
    *,
    reset_in: ResetPasswordRequest,
) -> MessageResponse:
    """
    Validates password reset token and sets new user password.
    """
    user = await get_user_by_reset_token(db=db, token=reset_in.token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    # Check token expiration
    if user.reset_token_expires_at is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    expires_at = user.reset_token_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new link.",
        )

    # Update password and clear reset token
    user.password_hash = hash_password(reset_in.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None

    await db.commit()
    await db.refresh(user)

    return MessageResponse(
        message="Your password has been successfully reset. You can now log in with your new password."
    )