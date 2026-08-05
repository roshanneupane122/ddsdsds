from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)

from app.models.user import UserRole


# Base Schema
class UserBase(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Full name of the user",
        examples=["Aarav Sharma"],
    )

    email: EmailStr = Field(
        ...,
        description="Unique email address",
        examples=["aarav.sharma@example.com"],
    )



# Create Schema
class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Plain text password (will be hashed before storing)",
        examples=["SecureP@ssw0rd123"],
    )



# Update Schema
class UserUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200,
        description="Updated full name",
    )

    email: Optional[EmailStr] = Field(
        default=None,
        description="Updated email address",
    )

    password: Optional[str] = Field(
        default=None,
        min_length=8,
        max_length=128,
        description="Updated password",
    )

    role: Optional[UserRole] = Field(
        default=None,
        description="Updated user role (Admin only)",
    )


# Response Schema
class UserRead(UserBase):
    user_id: str = Field(
        ...,
        description="Unique UUID of the user",
    )

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Internal DB Schema (For Auth / CRUD Layer)
class UserInDB(UserRead):
    password_hash: str = Field(
        ...,
        description="Bcrypt hashed password string stored in database",
    )


# Login Schema
class UserLogin(BaseModel):
    email: EmailStr = Field(
        ...,
        description="Registered user email",
        examples=["anu.sharma@example.com"],
    )

    password: str = Field(
        ...,
        description="User password",
        examples=["SecureP@ssw0rd123"],
    )


# Schema for User Patch 

class UserSelfUpdate(BaseModel):
    """
    Schema for updating the authenticated user's profile.
    
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="User's full name",
    )

    email: Optional[EmailStr] = Field(
        default=None,
        description="User email address",
    )

    password: Optional[str] = Field(
        default=None,
        min_length=8,
        max_length=128,
        description="New password",
    )