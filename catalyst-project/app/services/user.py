from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.crud.user import (
    create_user,
    delete_user,
    email_exists,
    get_user_by_email,
    get_user_by_id,
    get_users,
    update_user,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate,UserSelfUpdate


# ==========================================================
# Internal Helper
# ==========================================================

async def _get_existing_user(
    db: AsyncSession,
    user_id: str,
) -> User:
    """
    Retrieve a user by ID.

    Raises:
        HTTPException(404): If the user does not exist.
    """
    db_user = await get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return db_user


# ==========================================================
# Register User
# ==========================================================

async def create_new_user(
    db: AsyncSession,
    *,
    user_in: UserCreate,
) -> User:
    """
    Register a new user.

    Business Rules:
    - Email must be unique.
    - Password is hashed before storing.
    """

    if await email_exists(db=db, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    password_hash = hash_password(user_in.password)

    return await create_user(
        db=db,
        user_in=user_in,
        password_hash=password_hash,
    )


# ==========================================================
# Get User By ID
# ==========================================================

async def get_user(
    db: AsyncSession,
    *,
    user_id: str,
) -> User:
    """
    Retrieve a user by UUID.
    """
    return await _get_existing_user(
        db=db,
        user_id=user_id,
    )


# ==========================================================
# Get User By Email
# ==========================================================

async def get_user_by_email_service(
    db: AsyncSession,
    *,
    email: str,
) -> User:
    """
    Retrieve a user by email address.
    """

    db_user = await get_user_by_email(
        db=db,
        email=email,
    )

    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return db_user


# ==========================================================
# List Users
# ==========================================================

async def list_users(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 20,
) -> Sequence[User]:
    """
    Retrieve paginated users.
    """
    return await get_users(
        db=db,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# Update User
# ==========================================================

async def update_existing_user(
    db: AsyncSession,
    *,
    user_id: str,
    user_in: UserUpdate,
) -> User:
    """
    Update an existing user.

    Business Rules:
    - User must exist.
    - Email must remain unique.
    - Password is hashed before updating.
    """

    db_user = await _get_existing_user(
        db=db,
        user_id=user_id,
    )

    if (
        user_in.email is not None
        and user_in.email != db_user.email
    ):
        if await email_exists(
            db=db,
            email=user_in.email,
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered.",
            )

    update_data = user_in.model_dump(
        exclude_unset=True,
        exclude={"password"},
    )

    if user_in.password is not None:
        update_data["password_hash"] = hash_password(
            user_in.password
        )

    return await update_user(
        db=db,
        db_user=db_user,
        update_data=update_data,
    )


# ==========================================================
# Delete User
# ==========================================================

async def remove_user(
    db: AsyncSession,
    *,
    user_id: str,
) -> User:
    """
    Delete an existing user.
    """

    db_user = await _get_existing_user(
        db=db,
        user_id=user_id,
    )

    await delete_user(
        db=db,
        db_user=db_user,
    )

    return db_user

# ==========================================================
# Get Current User
# ==========================================================

async def get_current_user_profile(
    *,
    current_user: User,
) -> User:
    """
    Return the authenticated user's profile.
    """

    return current_user

# ==========================================================
# Update Current User
# ==========================================================

async def update_current_user(
    db: AsyncSession,
    *,
    current_user: User,
    user_in: UserSelfUpdate,
) -> User:
    """
    Update the authenticated user's profile.
    """

    if (
        user_in.email is not None
        and user_in.email != current_user.email
    ):
        if await email_exists(
            db=db,
            email=user_in.email,
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered.",
            )

    update_data = user_in.model_dump(
        exclude_unset=True,
        exclude={"password"},
    )

    if user_in.password is not None:
        update_data["password_hash"] = hash_password(
            user_in.password
        )

    return await update_user(
        db=db,
        db_user=current_user,
        update_data=update_data,
    )