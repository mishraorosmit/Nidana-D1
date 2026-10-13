"""User management service."""

import logging
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.constants import ExamTarget, PreferredLanguage, UserRole
from app.core.errors import APIErrorCode, APIException
from app.core.security import AuthenticatedUser
from app.models.attempt import Attempt
from app.models.diagnostic import DiagnosticRun, RecoveryReport
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import HypothesisBreakdown, UserCreate, UserStatsResponse, UserUpdate

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def get_or_create_from_token(self, auth_user: AuthenticatedUser) -> User:
        """Synchronize or fetch database user record corresponding to the Supabase authenticated JWT."""
        user = self.repo.get_by_id(auth_user.id)
        if not user:
            logger.info("Registering initial user record for authenticated subject %s", auth_user.id)
            user = User(
                id=auth_user.id,
                email=auth_user.email or f"{auth_user.id}@nidana.local",
                display_name=auth_user.raw_payload.get("user_metadata", {}).get("display_name"),
                role=auth_user.role,
                preferred_language=PreferredLanguage.ODIA.value,
                exam_target=ExamTarget.CHSE_CLASS_12.value,
            )
            self.repo.create(user)
        return user

    def get_by_id(self, user_id: str) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"User profile with ID '{user_id}' was not found.",
            )
        return user

    def update_profile(self, user_id: str, update_data: UserUpdate) -> User:
        user = self.get_by_id(user_id)
        if update_data.display_name is not None:
            user.display_name = update_data.display_name
        if update_data.preferred_language is not None:
            user.preferred_language = update_data.preferred_language.value
        if update_data.exam_target is not None:
            user.exam_target = update_data.exam_target.value
        if update_data.class_level is not None:
            user.class_level = update_data.class_level
        self.db.flush()
        return user

    def get_user_stats(self, auth_user: AuthenticatedUser) -> UserStatsResponse:
        """Computes authoritative performance, accuracy, and mark-recovery summary."""
        user = self.get_by_id(auth_user.id)

        attempts = self.db.query(Attempt).filter(Attempt.user_id == user.id).all()
        total_attempts = len(attempts)
        correct_attempts = sum(1 for a in attempts if a.is_correct)
        total_marks = round(sum(a.marks_obtained for a in attempts), 2)
        accuracy = (
            round((correct_attempts / total_attempts) * 100.0, 1) if total_attempts > 0 else 0.0
        )

        reports = self.db.query(RecoveryReport).filter(RecoveryReport.user_id == user.id).all()
        recoverable = round(sum(r.marks_at_risk for r in reports), 2)
        recovered = round(sum(r.marks_at_risk for r in reports if r.is_verified), 2)

        diagnostic_runs = (
            self.db.query(DiagnosticRun).filter(DiagnosticRun.user_id == user.id).all()
        )

        term_risk = 0.0
        time_risk = 0.0
        concept_risk = 0.0
        other_risk = 0.0

        for run in diagnostic_runs:
            hyp = (run.primary_hypothesis or "").upper()
            risk = run.recovery_report.marks_at_risk if run.recovery_report else 1.0
            if "LANGUAGE" in hyp or "TERMINOLOGY" in hyp:
                term_risk += risk
            elif "CARELESS" in hyp or "TIME" in hyp:
                time_risk += risk
            elif "MISCONCEPTION" in hyp or "PREREQUISITE" in hyp or "CONCEPT" in hyp:
                concept_risk += risk
            else:
                other_risk += risk

        breakdown = HypothesisBreakdown(
            english_terminology=round(term_risk, 2),
            time_pressure=round(time_risk, 2),
            concept_gaps=round(concept_risk, 2),
            other=round(other_risk, 2),
        )

        return UserStatsResponse(
            user_id=user.id,
            class_level=user.class_level,
            total_attempts=total_attempts,
            correct_attempts=correct_attempts,
            accuracy_percentage=accuracy,
            total_marks_obtained=total_marks,
            recoverable_marks=recoverable,
            recovered_marks=recovered,
            breakdown=breakdown,
        )
