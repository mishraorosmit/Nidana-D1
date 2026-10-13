"""Attempt service enforcing server-side authoritative grading and ownership checks."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional
from sqlalchemy.orm import Session

from app.core.constants import AttemptLifecycle
from app.core.errors import APIErrorCode, APIException
from app.core.security import AuthenticatedUser, enforce_ownership
from app.models.attempt import Attempt
from app.repositories.attempt_repo import AttemptRepository
from app.repositories.question_repo import QuestionRepository
from app.schemas.attempt import AnswerSubmitRequest, AttemptStartRequest

logger = logging.getLogger(__name__)


def evaluate_correctness(submitted_value: Any, correct_answer: Any) -> bool:
    """Evaluate whether student response matches the authoritative answer key.

    Supports string keys ("A"), dictionary responses ({"selected_option": "A"}),
    and list representations without trusting client claims.
    """
    if isinstance(submitted_value, dict) and "selected_option" in submitted_value:
        submitted_val = submitted_value["selected_option"]
    else:
        submitted_val = submitted_value

    if isinstance(correct_answer, dict) and "selected_option" in correct_answer:
        correct_val = correct_answer["selected_option"]
    else:
        correct_val = correct_answer

    if submitted_val is None or correct_val is None:
        return False

    if isinstance(correct_val, list) and isinstance(submitted_val, list):
        return sorted([str(x).strip().upper() for x in submitted_val]) == sorted(
            [str(x).strip().upper() for x in correct_val]
        )

    return str(submitted_val).strip().upper() == str(correct_val).strip().upper()


class AttemptService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AttemptRepository(db)
        self.question_repo = QuestionRepository(db)

    def start_attempt(
        self, user: AuthenticatedUser, payload: AttemptStartRequest
    ) -> Attempt:
        """Create a new active question attempt initialized on the server."""
        if not payload.question_id and not payload.variant_id:
            raise APIException(
                status_code=422,
                error_code=APIErrorCode.VALIDATION_ERROR,
                message="Either question_id or variant_id must be provided to start an attempt.",
            )

        if payload.question_id:
            q = self.question_repo.get_by_id(payload.question_id)
            if not q:
                raise APIException(
                    status_code=404,
                    error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                    message=f"Question '{payload.question_id}' not found.",
                )

        if payload.variant_id:
            v = self.question_repo.get_variant_by_id(payload.variant_id)
            if not v:
                raise APIException(
                    status_code=404,
                    error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                    message=f"Variant '{payload.variant_id}' not found.",
                )

        attempt = Attempt(
            id=str(uuid.uuid4()),
            user_id=user.id,
            question_id=payload.question_id,
            variant_id=payload.variant_id,
            lifecycle_state=AttemptLifecycle.IN_PROGRESS.value,
            started_at=datetime.now(timezone.utc),
            learning_signals={},
        )
        return self.repo.create(attempt)

    def submit_answer(
        self,
        attempt_id: str,
        user: AuthenticatedUser,
        payload: AnswerSubmitRequest,
    ) -> Attempt:
        """Evaluate submission authoritatively on the server and close attempt."""
        attempt = self.repo.get_by_id(attempt_id)
        if not attempt:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Attempt '{attempt_id}' was not found.",
            )

        # Enforce that caller owns this attempt
        enforce_ownership(attempt.user_id, user)

        if attempt.lifecycle_state == AttemptLifecycle.SUBMITTED.value:
            # Safe retry check: if the submitted payload matches the already-evaluated response, return idempotently
            if attempt.submitted_response == payload.submitted_response:
                return attempt
            raise APIException(
                status_code=400,
                error_code=APIErrorCode.ATTEMPT_ALREADY_SUBMITTED,
                message="This attempt has already been submitted and evaluated.",
            )

        # Determine authoritative answer key
        is_correct = False
        marks_obtained = 0.0

        if attempt.variant_id:
            variant = self.question_repo.get_variant_by_id(attempt.variant_id)
            if variant:
                is_correct = evaluate_correctness(
                    payload.submitted_response, variant.correct_answer
                )
                base_q = self.question_repo.get_by_id(variant.base_question_id)
                max_marks = base_q.marks if base_q else 4.0
                neg_marks = base_q.negative_marks if base_q else 1.0
                marks_obtained = max_marks if is_correct else -neg_marks
        elif attempt.question_id:
            question = self.question_repo.get_by_id(attempt.question_id)
            if question:
                is_correct = evaluate_correctness(
                    payload.submitted_response, question.correct_answer
                )
                marks_obtained = question.marks if is_correct else -question.negative_marks

        attempt.submitted_response = payload.submitted_response
        attempt.is_correct = is_correct
        attempt.marks_obtained = marks_obtained
        attempt.lifecycle_state = AttemptLifecycle.SUBMITTED.value
        attempt.submitted_at = datetime.now(timezone.utc)
        if payload.time_taken_seconds is not None:
            attempt.time_taken_seconds = payload.time_taken_seconds
        if payload.learning_signals:
            attempt.learning_signals = payload.learning_signals

        self.db.flush()
        logger.info(
            "Attempt %s graded authoritatively: user=%s, is_correct=%s, marks=%.2f",
            attempt_id,
            user.id,
            is_correct,
            marks_obtained,
        )
        return attempt

    def get_attempt(self, attempt_id: str, user: AuthenticatedUser) -> Attempt:
        """Fetch attempt and enforce caller ownership boundary."""
        attempt = self.repo.get_by_id(attempt_id)
        if not attempt:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Attempt '{attempt_id}' was not found.",
            )
        enforce_ownership(attempt.user_id, user)
        return attempt

    def list_user_attempts(
        self,
        user: AuthenticatedUser,
        lifecycle_state: Optional[str] = None,
        question_id: Optional[str] = None,
        is_correct: Optional[bool] = None,
        offset: int = 0,
        limit: int = 50,
    ) -> List[Attempt]:
        return self.repo.list_by_user(
            user_id=user.id,
            lifecycle_state=lifecycle_state,
            question_id=question_id,
            is_correct=is_correct,
            offset=offset,
            limit=limit,
        )
