"""User and profile endpoints."""

from fastapi import APIRouter, Depends, status
from app.api.deps import get_user_service
from app.core.security import AuthenticatedUser, get_current_user
from app.schemas.user import UserPublic, UserStatsResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/me", tags=["Users"])


@router.get(
    "",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the profile of the caller validated against the Supabase Auth token.",
)
def get_current_profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
) -> UserPublic:
    user = user_service.get_or_create_from_token(current_user)
    return UserPublic.model_validate(user)


@router.patch(
    "",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Update current user preferences",
    description="Allows updating display name, preferred language, exam target, and class level.",
)
def update_profile(
    payload: UserUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
) -> UserPublic:
    # Ensure user exists in local db
    user_service.get_or_create_from_token(current_user)
    updated = user_service.update_profile(current_user.id, payload)
    return UserPublic.model_validate(updated)


@router.get(
    "/stats",
    response_model=UserStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authoritative learner recovery and performance metrics",
    description="Aggregates attempts, accuracy, marks obtained, recoverable marks, and misconception breakdown.",
)
def get_user_stats(
    current_user: AuthenticatedUser = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
) -> UserStatsResponse:
    user_service.get_or_create_from_token(current_user)
    return user_service.get_user_stats(current_user)
