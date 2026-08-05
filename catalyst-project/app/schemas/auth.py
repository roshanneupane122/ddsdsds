from pydantic import BaseModel, EmailStr, Field


# ==========================================================
# Login Request Schema
# ==========================================================

class LoginRequest(BaseModel):
    """
    Request body for user login.
    """

    email: EmailStr = Field(
        ...,
        description="Registered email address",
        examples=["ram@gmail.com"],
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password",
        examples=["StrongPassword123"],
    )


# ==========================================================
# Register Request Schema
# ==========================================================

class RegisterRequest(BaseModel):
    """
    Request body for user registration.
    """

    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Full name of the user",
        examples=["Ram Bahadur"],
    )

    email: EmailStr = Field(
        ...,
        description="Email address",
        examples=["ram@gmail.com"],
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Account password",
        examples=["StrongPassword123"],
    )