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


# ==========================================================
# Forgot Password Request Schema
# ==========================================================

class ForgotPasswordRequest(BaseModel):
    """
    Request body for requesting password reset.
    """

    email: EmailStr = Field(
        ...,
        description="Registered email address to receive reset link",
        examples=["user@gmail.com"],
    )


# ==========================================================
# Reset Password Request Schema
# ==========================================================

class ResetPasswordRequest(BaseModel):
    """
    Request body for completing password reset.
    """

    token: str = Field(
        ...,
        description="Password reset token received via email",
        examples=["abc123xyztoken"],
    )

    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="New password",
        examples=["NewStrongPassword123"],
    )


# ==========================================================
# Generic Message Response Schema
# ==========================================================

class MessageResponse(BaseModel):
    """
    Standard JSON response message.
    """

    message: str = Field(..., examples=["Action completed successfully."])