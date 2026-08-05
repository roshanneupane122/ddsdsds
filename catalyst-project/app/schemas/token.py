from typing import Optional

from pydantic import BaseModel, Field

from app.models.user import UserRole


# ==========================================================
# JWT Response Schema
# ==========================================================

class Token(BaseModel):
    access_token: str = Field(
        ...,
        description="JWT access token",
    )

    token_type: str = Field(
        default="bearer",
        description="Authentication scheme",
    )


# ==========================================================
# JWT Payload Schema
# ==========================================================

class TokenData(BaseModel):
    sub: Optional[str] = Field(
        default=None,
        description="User UUID stored inside JWT",
    )

    role: Optional[UserRole] = Field(
        default=None,
        description="User role stored inside JWT",
    )