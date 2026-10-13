from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_user_service
from app.core.security import AuthenticatedUser, get_current_user
from app.schemas.mock_test import (
    MockResultResponse,
    MockSessionResponse,
    MockSessionSummary,
    MockStartRequest,
    MockSubmitRequest,
)
from app.services.mock_service import MockService
from app.services.user_service import UserService

router = APIRouter(prefix="/mock", tags=["Mini-Mock"])


def get_mock_service(db: Session = Depends(get_db)) -> MockService:
    return MockService(db)


@router.post(
    "/start",
    response_model=MockSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Start a 5-question mini-mock",
    description="Returns 5 curriculum questions for the specified class. Answer keys are strictly omitted.",
)
def start_mini_mock(
    payload: MockStartRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    mock_service: MockService = Depends(get_mock_service),
) -> MockSessionResponse:
    user_service.get_or_create_from_token(current_user)
    return mock_service.start_mini_mock(user=current_user, payload=payload)


@router.get(
    "/sessions",
    response_model=List[MockSessionSummary],
    status_code=status.HTTP_200_OK,
    summary="List caller's mock test sessions",
    description="Returns pagination-supported history of active and completed mock assessments.",
)
def list_mock_sessions(
    status: Optional[str] = Query(None, description="Filter by session status ('in_progress', 'submitted')"),
    class_level: Optional[int] = Query(None, ge=1, le=12, description="Filter by class level"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: AuthenticatedUser = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    mock_service: MockService = Depends(get_mock_service),
) -> List[MockSessionSummary]:
    user_service.get_or_create_from_token(current_user)
    return mock_service.list_user_mock_sessions(
        user=current_user,
        status=status,
        class_level=class_level,
        offset=offset,
        limit=limit,
    )


@router.get(
    "/{session_id}/active",
    response_model=MockSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve active in-progress mini-mock session",
    description="Allows resuming an ongoing mock assessment. Answer keys remain concealed.",
)
def get_active_mock_session(
    session_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    mock_service: MockService = Depends(get_mock_service),
) -> MockSessionResponse:
    return mock_service.get_active_mock_session(session_id=session_id, user=current_user)


@router.post(
    "/{session_id}/submit",
    response_model=MockResultResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit mini-mock for authoritative server grading",
    description="Calculates scores, records individual attempts, and initiates diagnostics for incorrect answers.",
)
def submit_mini_mock(
    session_id: str,
    payload: MockSubmitRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    mock_service: MockService = Depends(get_mock_service),
) -> MockResultResponse:
    return mock_service.submit_mini_mock(session_id=session_id, user=current_user, payload=payload)


@router.get(
    "/{session_id}",
    response_model=MockResultResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve submitted mini-mock result",
    description="Returns the graded outcome and diagnostic triggers for a previously submitted mini-mock session.",
)
def get_mini_mock_session(
    session_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    mock_service: MockService = Depends(get_mock_service),
) -> MockResultResponse:
    return mock_service.get_mini_mock_result(session_id=session_id, user=current_user)
