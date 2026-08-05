from fastapi import APIRouter, status

from app.api.dependencies import DBSession
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
)
from app.schemas.token import Token
from app.schemas.user import UserRead
from app.services.auth import (
    login_user,
    register_user,
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