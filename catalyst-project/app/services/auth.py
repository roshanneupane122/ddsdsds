from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    TOKEN_TYPE,
    WWW_AUTHENTICATE_SCHEME,
    create_access_token,
    verify_password,
)
from app.crud.user import get_user_by_email
from app.models.user import User, UserRole
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
)
from app.schemas.token import Token
from app.schemas.user import UserCreate
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