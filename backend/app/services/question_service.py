"""Question service managing question retrieval and active-test answer concealment."""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.errors import APIErrorCode, APIException
from app.models.question import Question, QuestionVariant
from app.repositories.chapter_repo import ChapterRepository
from app.repositories.concept_repo import ConceptRepository
from app.repositories.question_repo import QuestionRepository
from app.schemas.question import (
    QuestionCreate,
    QuestionPublic,
    QuestionVariantCreate,
    QuestionVariantPublic,
    QuestionVariantWithAnswer,
    QuestionWithAnswer,
)


class QuestionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = QuestionRepository(db)
        self.chapter_repo = ChapterRepository(db)
        self.concept_repo = ConceptRepository(db)

    def list_public_questions(
        self,
        chapter_id: Optional[str] = None,
        concept_id: Optional[str] = None,
        difficulty: Optional[str] = None,
        class_level: Optional[int] = None,
        subject_id: Optional[str] = None,
        language: Optional[str] = None,
        offset: int = 0,
        limit: int = 50,
    ) -> List[QuestionPublic]:
        """Fetch questions for student test-taking.

        Guarantees that correct answers and explanations are stripped at the Pydantic boundary.
        """
        questions = self.repo.list_by_filter(
            chapter_id=chapter_id,
            concept_id=concept_id,
            difficulty=difficulty,
            class_level=class_level,
            subject_id=subject_id,
            language=language,
            offset=offset,
            limit=limit,
        )
        return [QuestionPublic.model_validate(q) for q in questions]

    def get_public_question(self, question_id: str) -> QuestionPublic:
        """Fetch a single question for an active test without answer key."""
        question = self.repo.get_by_id(question_id)
        if not question:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Question '{question_id}' not found.",
            )
        return QuestionPublic.model_validate(question)

    def get_question_with_answer(self, question_id: str) -> Question:
        """Internal/privileged retrieval returning the full Question model including correct_answer."""
        question = self.repo.get_by_id(question_id)
        if not question:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Question '{question_id}' not found.",
            )
        return question

    def create_question(self, payload: QuestionCreate) -> QuestionWithAnswer:
        if self.repo.get_by_id(payload.id):
            raise APIException(
                status_code=409,
                error_code=APIErrorCode.RESOURCE_CONFLICT,
                message=f"Question with ID '{payload.id}' already exists.",
            )
        if not self.chapter_repo.get_by_id(payload.chapter_id):
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Chapter '{payload.chapter_id}' does not exist.",
            )
        if not self.concept_repo.get_by_id(payload.concept_id):
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Concept '{payload.concept_id}' does not exist.",
            )

        data = payload.model_dump()
        # Convert options Pydantic objects to dicts for JSON storage
        data["options"] = [opt.model_dump() if hasattr(opt, "model_dump") else opt for opt in payload.options]
        question = Question(**data)
        saved = self.repo.create(question)
        return QuestionWithAnswer.model_validate(saved)

    def get_variant_with_answer(self, variant_id: str) -> QuestionVariant:
        variant = self.repo.get_variant_by_id(variant_id)
        if not variant:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Question variant '{variant_id}' not found.",
            )
        return variant

    def create_variant(self, payload: QuestionVariantCreate) -> QuestionVariantWithAnswer:
        if self.repo.get_variant_by_id(payload.id):
            raise APIException(
                status_code=409,
                error_code=APIErrorCode.RESOURCE_CONFLICT,
                message=f"Variant with ID '{payload.id}' already exists.",
            )
        self.get_question_with_answer(payload.base_question_id)
        data = payload.model_dump()
        if payload.options:
            data["options"] = [opt.model_dump() if hasattr(opt, "model_dump") else opt for opt in payload.options]
        variant = QuestionVariant(**data)
        saved = self.repo.create_variant(variant)
        return QuestionVariantWithAnswer.model_validate(saved)
