from typing import Annotated

from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.security import (
    WWW_AUTHENTICATE_SCHEME,
    decode_access_token,
    oauth2_scheme,
)
from app.crud.user import get_user_by_id
from app.models.user import User,UserRole
from app.schemas.token import TokenData


# ==========================================================
# Database Dependency
# ==========================================================

DBSession = Annotated[
    AsyncSession,
    Depends(get_db_session),
]


# ==========================================================
# Authentication Dependency
# ==========================================================

async def get_current_user(
    db: DBSession,
    token: str = Depends(oauth2_scheme),
) -> User:
    """
    Validate the JWT access token and return the authenticated user.
    """

    try:
        payload = decode_access_token(token)

        token_data = TokenData(
            sub=payload.get("sub"),
            role=payload.get("role"),
        )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={
                "WWW-Authenticate": WWW_AUTHENTICATE_SCHEME,
            },
        )

    if token_data.sub is None or token_data.role is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
            headers={
                "WWW-Authenticate": WWW_AUTHENTICATE_SCHEME,
            },
        )

    user = await get_user_by_id(
        db=db,
        user_id=token_data.sub,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={
                "WWW-Authenticate": WWW_AUTHENTICATE_SCHEME,
            },
        )

    return user

# ==========================================================
# Role Authorization Dependency
# ==========================================================

def require_role(*allowed_roles: UserRole):
    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in set(allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )

        return current_user

    return role_checker 

# ==========================================================
# Admin Authorization Dependency
# ==========================================================

require_admin = require_role(UserRole.ADMIN)

CurrentUser = Annotated[
    User,
    Depends(get_current_user)
]

AdminUser = Annotated[
    User,
    Depends(require_admin)
]