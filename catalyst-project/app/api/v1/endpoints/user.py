from fastapi import APIRouter, Query, status

from app.api.dependencies import DBSession
from app.schemas.user import (
    UserRead,
    UserUpdate,
    UserSelfUpdate
)
from app.services.user import (
    get_user,
    list_users,
    update_existing_user,
    get_current_user_profile,
    update_current_user,
    remove_user,
)
from app.api.dependencies import AdminUser
# from app.services.auth import register_user

from app.api.dependencies import CurrentUser

router = APIRouter()

@router.get(
    "/",
    response_model=list[UserRead],
)
async def read_users(
    db: DBSession,
    current_user:AdminUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    return await list_users(
        db=db,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{user_id}",
    response_model=UserRead,
)
async def read_user(
    user_id: str,
    db: DBSession,
    current_user:AdminUser,
):
    return await get_user(
        db=db,
        user_id=user_id,
    )


@router.patch(
    "/{user_id}",
    response_model=UserRead,
)
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: DBSession,
    current_user:AdminUser,
):
    return await update_existing_user(
        db=db,
        user_id=user_id,
        user_in=user_in,
    )


@router.delete(
    "/{user_id}",
    response_model=UserRead,
)
async def delete_user(
    user_id: str,
    db: DBSession,
    current_user:AdminUser
):
    return await remove_user(
        db=db,
        user_id=user_id,
    )

@router.get(
    "/me",
    response_model=UserRead,
)
async def read_current_user(
    current_user: CurrentUser,
):
    """
    Retrieve the authenticated user's profile.
    """

    return await get_current_user_profile(
        current_user=current_user,
    )

@router.patch(
    "/me",
    response_model=UserRead,
)
async def update_me(
    user_in: UserSelfUpdate,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Update the authenticated user's profile.
    """

    return await update_current_user(
        db=db,
        current_user=current_user,
        user_in=user_in,
    )
