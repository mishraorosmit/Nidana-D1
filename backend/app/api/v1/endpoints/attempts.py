"""Attempt endpoints enforcing learner ownership and trusted server-side grading."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.api.deps import get_attempt_service, get_user_service
from app.core.security import AuthenticatedUser, get_current_user
from app.schemas.attempt import AnswerSubmitRequest, AttemptResponse, AttemptStartRequest
from app.services.attempt_service import AttemptService
from app.services.user_service import UserService

router = APIRouter(prefix="/attempts", tags=["Attempts"])


@router.post(
    "",
    response_model=AttemptResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a question attempt",
    description="Initializes an active attempt on the server tied to the authenticated learner.",
)
def start_attempt(
    payload: AttemptStartRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    attempt_service: AttemptService = Depends(get_attempt_service),
) -> AttemptResponse:
    # Ensure user record exists in local db
    user_service.get_or_create_from_token(current_user)
    attempt = attempt_service.start_attempt(user=current_user, payload=payload)
    return AttemptResponse.model_validate(attempt)


@router.post(
    "/{attempt_id}/submit",
    response_model=AttemptResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit answer for authoritative grading",
    description="Submits the learner's response. The backend deterministically computes correctness and marks.",
)
def submit_answer(
    attempt_id: str,
    payload: AnswerSubmitRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    attempt_service: AttemptService = Depends(get_attempt_service),
) -> AttemptResponse:
    attempt = attempt_service.submit_answer(
        attempt_id=attempt_id, user=current_user, payload=payload
    )
    return AttemptResponse.model_validate(attempt)


@router.get(
    "/{attempt_id}",
    response_model=AttemptResponse,
    status_code=status.HTTP_200_OK,
    summary="Get attempt details",
    description="Fetches attempt state with strict ownership verification.",
)
def get_attempt(
    attempt_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    attempt_service: AttemptService = Depends(get_attempt_service),
) -> AttemptResponse:
    attempt = attempt_service.get_attempt(attempt_id=attempt_id, user=current_user)
    return AttemptResponse.model_validate(attempt)


@router.get(
    "",
    response_model=List[AttemptResponse],
    status_code=status.HTTP_200_OK,
    summary="List current user's attempts",
    description="Returns attempt history owned exclusively by the authenticated learner.",
)
def list_attempts(
    lifecycle_state: Optional[str] = Query(None, description="Filter by lifecycle state ('in_progress', 'submitted')"),
    question_id: Optional[str] = Query(None, description="Filter by question ID"),
    is_correct: Optional[bool] = Query(None, description="Filter by correctness (true/false)"),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: AuthenticatedUser = Depends(get_current_user),
    attempt_service: AttemptService = Depends(get_attempt_service),
) -> List[AttemptResponse]:
    attempts = attempt_service.list_user_attempts(
        user=current_user,
        lifecycle_state=lifecycle_state,
        question_id=question_id,
        is_correct=is_correct,
        offset=offset,
        limit=limit,
    )
    return [AttemptResponse.model_validate(a) for a in attempts]
