from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User,UserRole
from app.schemas.user import UserCreate


# Read Operations

async def get_user_by_id(
    db: AsyncSession,
    user_id: str,
) -> Optional[User]:
    """
    Retrieve a user by UUID.
    """
    result = await db.execute(
        select(User).where(User.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_user_by_email(
    db: AsyncSession,
    email: str,
) -> Optional[User]:
    """
    Retrieve a user by email address.
    """
    result = await db.execute(
        select(User).where(User.email == email)
    )
    return result.scalar_one_or_none()


async def get_users(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 20,
) -> Sequence[User]:
    """
    Retrieve users with pagination.
    """
    result = await db.execute(
        select(User)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def email_exists(
    db: AsyncSession,
    email: str,
) -> bool:
    """
    Check whether an email already exists.
    """
    result = await db.execute(
        select(User.user_id).where(User.email == email)
    )
    return result.scalar_one_or_none() is not None


# Create Operation

async def create_user(
    db: AsyncSession,
    *,
    user_in: UserCreate,
    password_hash: str,
) -> User:
    """
    Create a new user.

    NOTE:
    Commit is handled by the dependency/service layer.
    """

    db_user = User(
        name=user_in.name,
        email=user_in.email,
        role=UserRole.CITIZEN,
        password_hash=password_hash,
    )

    db.add(db_user)

    await db.flush()
    await db.refresh(db_user)

    return db_user


# Update Operation

async def update_user(
    db: AsyncSession,
    *,
    db_user: User,
    update_data: dict,
) -> User:

    for field, value in update_data.items():
        setattr(db_user, field, value)

    await db.flush()
    await db.refresh(db_user)

    return db_user


# Delete Operation

async def delete_user(
    db: AsyncSession,
    *,
    db_user: User,
) -> User:
    """
    Delete a user.

    NOTE:
    Commit is handled by the dependency/service layer.
    """

    await db.delete(db_user)
    await db.flush()

    return db_user