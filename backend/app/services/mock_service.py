"""Service layer for 5-question mini-mock orchestration and authoritative grading."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.core.constants import AttemptLifecycle, ClassLevel
from app.core.errors import APIErrorCode, APIException
from app.core.security import AuthenticatedUser, enforce_ownership
from app.models import Attempt, Chapter, DiagnosticRun, MockTestSession, Question
from app.schemas.mock_test import (
    MockAnswerSubmission,
    MockResultResponse,
    MockSessionResponse,
    MockSessionSummary,
    MockStartRequest,
    MockSubmitRequest,
    QuestionResultOutcome,
)
from app.schemas.question import QuestionPublic


class MockService:
    def __init__(self, db: Session):
        self.db = db

    def start_mini_mock(
        self, user: AuthenticatedUser, payload: MockStartRequest
    ) -> MockSessionResponse:
        """Starts a 5-question mini-mock. Conceals answer keys completely."""
        if payload.class_level not in [c.value for c in ClassLevel]:
            raise APIException(
                status_code=400,
                error_code=APIErrorCode.INVALID_CLASS_LEVEL,
                message=f"Class level {payload.class_level} is invalid. Must be 9, 10, or 12.",
            )

        query = (
            self.db.query(Question)
            .join(Chapter, Question.chapter_id == Chapter.id)
            .filter(Chapter.class_level == payload.class_level)
        )
        if payload.subject_id:
            query = query.filter(Chapter.subject_id == payload.subject_id)

        questions = query.limit(5).all()

        if len(questions) < 5:
            # Fallback to any 5 approved questions to ensure the mock is always playable
            questions = self.db.query(Question).limit(5).all()

        if not questions:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message="Insufficient questions available to construct a mini-mock.",
            )

        session_id = f"mock_{uuid.uuid4().hex[:12]}"
        public_questions = [QuestionPublic.model_validate(q) for q in questions]
        total_marks = sum(q.marks for q in questions)
        now = datetime.now(timezone.utc)

        # Authoritative persistence of active mock assessment session
        session = MockTestSession(
            id=session_id,
            user_id=user.id,
            class_level=payload.class_level,
            subject_id=payload.subject_id,
            status="in_progress",
            total_questions=len(public_questions),
            total_marks=total_marks,
            question_ids=[q.id for q in questions],
            started_at=now,
        )
        self.db.add(session)
        self.db.commit()

        return MockSessionResponse(
            session_id=session_id,
            class_level=payload.class_level,
            questions=public_questions,
            total_questions=len(public_questions),
            total_marks=total_marks,
            status="in_progress",
            started_at=now,
        )

    def submit_mini_mock(
        self,
        session_id: str,
        user: AuthenticatedUser,
        payload: MockSubmitRequest,
    ) -> MockResultResponse:
        """Authoritatively grades the mini-mock submission and initiates diagnostics for incorrect answers.

        Transactional, safe on retries, and validates questions against assigned session items.
        """
        now = datetime.now(timezone.utc)

        # 1. Look up session if exists
        session = self.db.query(MockTestSession).filter_by(id=session_id).first()
        if session:
            enforce_ownership(session.user_id, user)
            # Safe retry check: return existing graded outcome if already submitted
            if session.status == "submitted":
                return self.get_mini_mock_result(session_id=session_id, user=user)

        results: List[QuestionResultOutcome] = []
        diagnostic_runs: List[str] = []

        total_score = 0.0
        max_score = 0.0
        correct_count = 0
        incorrect_count = 0
        unanswered_count = 0

        # Validate that submitted questions belong to this session (if tracked)
        valid_question_ids = set(session.question_ids) if session else None
        if valid_question_ids is not None:
            for item in payload.answers:
                if item.question_id not in valid_question_ids:
                    raise APIException(
                        status_code=400,
                        error_code=APIErrorCode.INVALID_QUESTION,
                        message=f"Question '{item.question_id}' does not belong to mock session '{session_id}'.",
                    )

        try:
            for item in payload.answers:
                question = self.db.query(Question).filter_by(id=item.question_id).first()
                if not question:
                    continue

                max_score += question.marks
                correct_opt = (
                    question.correct_answer.get("selected_option")
                    if isinstance(question.correct_answer, dict)
                    else (
                        question.correct_answer
                        if isinstance(question.correct_answer, str)
                        else None
                    )
                )

                is_correct = False
                marks_awarded = 0.0

                if not item.selected_option:
                    unanswered_count += 1
                elif str(item.selected_option).strip().upper() == str(correct_opt).strip().upper():
                    is_correct = True
                    marks_awarded = question.marks
                    total_score += marks_awarded
                    correct_count += 1
                else:
                    is_correct = False
                    marks_awarded = -question.negative_marks
                    total_score += marks_awarded
                    incorrect_count += 1

                # Authoritative attempt recording (idempotent lookup or create)
                attempt_id = f"att_{session_id}_{question.id}"
                attempt = self.db.query(Attempt).filter_by(id=attempt_id).first()
                if attempt:
                    enforce_ownership(attempt.user_id, user)
                else:
                    attempt = Attempt(
                        id=attempt_id,
                        user_id=user.id,
                        question_id=question.id,
                        lifecycle_state=AttemptLifecycle.SUBMITTED.value,
                        submitted_response={"selected_option": item.selected_option},
                        is_correct=is_correct,
                        marks_obtained=marks_awarded,
                        started_at=session.started_at if session else now,
                        submitted_at=now,
                        time_taken_seconds=item.time_taken_seconds or 0,
                        learning_signals=item.learning_signals or {},
                    )
                    self.db.add(attempt)
                    self.db.flush()

                # Trigger diagnostic run if answer is incorrect and not already diagnosed
                if item.selected_option and not is_correct:
                    existing_run = self.db.query(DiagnosticRun).filter_by(attempt_id=attempt.id).first()
                    if not existing_run:
                        diag_run = DiagnosticRun(
                            id=f"diag_{uuid.uuid4().hex[:12]}",
                            attempt_id=attempt.id,
                            user_id=user.id,
                            status="PENDING",
                            primary_hypothesis="MISCONCEPTION",
                            confidence_score=0.8,
                            hypotheses_data=[
                                {
                                    "hypothesis": "MISCONCEPTION",
                                    "score": 0.8,
                                    "reason": f"Selected distractor '{item.selected_option}' instead of expected '{correct_opt}'.",
                                }
                            ],
                            selected_probe_ids=[],
                            evidence_refs=[],
                            trace_summary=f"Diagnostic initiated for question {question.id} on incorrect response {item.selected_option}.",
                            recovery_eligible=True,
                        )
                        self.db.add(diag_run)
                        self.db.flush()
                        diagnostic_runs.append(diag_run.id)
                    else:
                        diagnostic_runs.append(existing_run.id)

                results.append(
                    QuestionResultOutcome(
                        question_id=question.id,
                        attempt_id=attempt.id,
                        selected_option=item.selected_option,
                        is_correct=is_correct,
                        marks_obtained=marks_awarded,
                        correct_option=str(correct_opt or "N/A"),
                        explanation_en=question.explanation_en,
                        explanation_or=question.explanation_or,
                    )
                )

            # Update session state if session exists
            if session:
                answered_qids = {item.question_id for item in payload.answers}
                unanswered_count += len(set(session.question_ids) - answered_qids)

                session.status = "submitted"
                session.score = total_score
                session.correct_count = correct_count
                session.incorrect_count = incorrect_count
                session.unanswered_count = unanswered_count
                session.submitted_at = now

            self.db.commit()
        except Exception:
            self.db.rollback()
            raise

        return MockResultResponse(
            session_id=session_id,
            total_score=round(total_score, 2),
            max_possible_score=max_score,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            unanswered_count=unanswered_count,
            results=results,
            diagnostic_runs_triggered=diagnostic_runs,
        )

    def get_mini_mock_result(
        self,
        session_id: str,
        user: AuthenticatedUser,
    ) -> MockResultResponse:
        """Retrieves authoritative graded result of a previously submitted mini-mock session with ownership enforcement."""
        session = self.db.query(MockTestSession).filter_by(id=session_id).first()
        if session:
            enforce_ownership(session.user_id, user)
            if session.status != "submitted":
                raise APIException(
                    status_code=400,
                    error_code=APIErrorCode.INVALID_STATUS,
                    message=f"Mock session '{session_id}' has not been submitted yet.",
                )

        pattern = f"att_{session_id}_%"
        attempts = self.db.query(Attempt).filter(Attempt.id.like(pattern)).all()
        if not attempts:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Mini-mock session '{session_id}' not found or has not been submitted.",
            )

        for att in attempts:
            enforce_ownership(att.user_id, user)

        results: List[QuestionResultOutcome] = []
        diagnostic_runs: List[str] = []
        total_score = 0.0
        max_score = 0.0
        correct_count = 0
        incorrect_count = 0
        unanswered_count = 0

        for att in attempts:
            question = self.db.query(Question).filter_by(id=att.question_id).first()
            if not question:
                continue

            max_score += question.marks
            total_score += att.marks_obtained
            correct_opt = (
                question.correct_answer.get("selected_option")
                if isinstance(question.correct_answer, dict)
                else None
            )

            sel_opt = (
                att.submitted_response.get("selected_option")
                if isinstance(att.submitted_response, dict)
                else None
            )

            if not sel_opt:
                unanswered_count += 1
            elif att.is_correct:
                correct_count += 1
            else:
                incorrect_count += 1

            diag_run = self.db.query(DiagnosticRun).filter_by(attempt_id=att.id).first()
            if diag_run:
                diagnostic_runs.append(diag_run.id)

            results.append(
                QuestionResultOutcome(
                    question_id=question.id,
                    attempt_id=att.id,
                    selected_option=sel_opt,
                    is_correct=att.is_correct,
                    marks_obtained=att.marks_obtained,
                    correct_option=correct_opt or "N/A",
                    explanation_en=question.explanation_en,
                    explanation_or=question.explanation_or,
                )
            )

        return MockResultResponse(
            session_id=session_id,
            total_score=round(total_score, 2),
            max_possible_score=max_score,
            correct_count=correct_count,
            incorrect_count=incorrect_count,
            unanswered_count=unanswered_count,
            results=results,
            diagnostic_runs_triggered=diagnostic_runs,
        )

    def get_active_mock_session(
        self,
        session_id: str,
        user: AuthenticatedUser,
    ) -> MockSessionResponse:
        """Retrieves an active in-progress mini-mock session for resumption without answer keys."""
        session = self.db.query(MockTestSession).filter_by(id=session_id).first()
        if not session:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Mock session '{session_id}' not found.",
            )
        enforce_ownership(session.user_id, user)

        if session.status != "in_progress":
            raise APIException(
                status_code=400,
                error_code=APIErrorCode.INVALID_STATUS,
                message=f"Mock session '{session_id}' is already {session.status}.",
            )

        # Retrieve questions in the session's recorded order
        question_map = {
            q.id: q
            for q in self.db.query(Question)
            .filter(Question.id.in_(session.question_ids))
            .all()
        }
        ordered_questions = [
            question_map[qid]
            for qid in session.question_ids
            if qid in question_map
        ]
        public_questions = [QuestionPublic.model_validate(q) for q in ordered_questions]

        return MockSessionResponse(
            session_id=session.id,
            class_level=session.class_level,
            questions=public_questions,
            total_questions=len(public_questions),
            total_marks=session.total_marks,
            status=session.status,
            started_at=session.started_at,
        )

    def list_user_mock_sessions(
        self,
        user: AuthenticatedUser,
        status: Optional[str] = None,
        class_level: Optional[int] = None,
        offset: int = 0,
        limit: int = 20,
    ) -> List[MockSessionSummary]:
        """Lists historical and active mock assessment sessions for the authenticated user."""
        query = self.db.query(MockTestSession).filter(MockTestSession.user_id == user.id)
        if status:
            query = query.filter(MockTestSession.status == status)
        if class_level is not None:
            query = query.filter(MockTestSession.class_level == class_level)

        sessions = (
            query.order_by(MockTestSession.started_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return [
            MockSessionSummary(
                session_id=s.id,
                class_level=s.class_level,
                subject_id=s.subject_id,
                status=s.status,
                total_questions=s.total_questions,
                total_marks=s.total_marks,
                score=s.score,
                correct_count=s.correct_count,
                incorrect_count=s.incorrect_count,
                started_at=s.started_at,
                submitted_at=s.submitted_at,
            )
            for s in sessions
        ]
