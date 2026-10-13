"""Questions endpoints with strict answer key protection."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.api.deps import get_question_service
from app.core.constants import QuestionDifficulty, UserRole
from app.core.security import require_role
from app.schemas.question import (
    QuestionCreate,
    QuestionPublic,
    QuestionVariantCreate,
    QuestionVariantWithAnswer,
    QuestionWithAnswer,
)
from app.services.question_service import QuestionService

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.get(
    "",
    response_model=List[QuestionPublic],
    status_code=status.HTTP_200_OK,
    summary="List questions for practice/tests",
    description="Returns public question representations without correct answers or explanations.",
)
def list_questions(
    chapter_id: Optional[str] = Query(default=None),
    concept_id: Optional[str] = Query(default=None),
    difficulty: Optional[QuestionDifficulty] = Query(default=None),
    class_level: Optional[int] = Query(default=None, description="Class level filter (9, 10, or 12)"),
    subject_id: Optional[str] = Query(default=None, description="Subject ID filter"),
    language: Optional[str] = Query(default=None, description="Language filter ('odia', 'english', 'bilingual')"),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    service: QuestionService = Depends(get_question_service),
) -> List[QuestionPublic]:
    diff_val = difficulty.value if difficulty else None
    return service.list_public_questions(
        chapter_id=chapter_id,
        concept_id=concept_id,
        difficulty=diff_val,
        class_level=class_level,
        subject_id=subject_id,
        language=language,
        offset=offset,
        limit=limit,
    )


@router.get(
    "/{question_id}",
    response_model=QuestionPublic,
    status_code=status.HTTP_200_OK,
    summary="Get single active-test question",
    description="Returns public question item. Correct answer remains strictly concealed.",
)
def get_question(
    question_id: str, service: QuestionService = Depends(get_question_service)
) -> QuestionPublic:
    return service.get_public_question(question_id)


@router.post(
    "",
    response_model=QuestionWithAnswer,
    status_code=status.HTTP_201_CREATED,
    summary="Author a new question (Educators/Admins only)",
    dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.EDUCATOR))],
)
def create_question(
    payload: QuestionCreate, service: QuestionService = Depends(get_question_service)
) -> QuestionWithAnswer:
    return service.create_question(payload)


@router.post(
    "/{question_id}/variants",
    response_model=QuestionVariantWithAnswer,
    status_code=status.HTTP_201_CREATED,
    summary="Create a targeted variant (Educators/Admins only)",
    dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.EDUCATOR))],
)
def create_variant(
    question_id: str,
    payload: QuestionVariantCreate,
    service: QuestionService = Depends(get_question_service),
) -> QuestionVariantWithAnswer:
    # Ensure URL id matches payload base_question_id
    payload.base_question_id = question_id
    return service.create_variant(payload)
