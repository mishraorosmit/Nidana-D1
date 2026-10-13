"""Service layer for WHY Engine execution, report persistence, and recovery verification."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.core.errors import APIErrorCode, APIException
from app.core.security import AuthenticatedUser, enforce_ownership
from app.models import (
    Attempt,
    Chapter,
    DiagnosticProbe,
    DiagnosticRun,
    Question,
    RecoveryReport,
    StudyPlan,
    StudyPlanTask,
)
from app.why_engine.graph import create_why_engine_graph


class WhyEngineService:
    def __init__(self, db: Session):
        self.db = db
        self.graph = create_why_engine_graph()

    def diagnose_attempt(self, attempt_id: str, user: AuthenticatedUser) -> DiagnosticRun:
        """Runs the LangGraph diagnosis pipeline and persists the diagnostic run, probes, and report."""
        attempt = self.db.query(Attempt).filter_by(id=attempt_id).first()
        if not attempt:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Attempt '{attempt_id}' not found.",
            )

        enforce_ownership(attempt.user_id, user)

        # Idempotency: Return existing completed run if already diagnosed
        existing_run = self.db.query(DiagnosticRun).filter_by(attempt_id=attempt.id).first()
        if existing_run and existing_run.status == "COMPLETED":
            return existing_run

        question = self.db.query(Question).filter_by(id=attempt.question_id).first()
        if not question:
            raise APIException(
                code=APIErrorCode.RESOURCE_NOT_FOUND,
                message="Question linked to attempt not found.",
                status_code=404,
            )

        chapter = self.db.query(Chapter).filter_by(id=question.chapter_id).first()
        class_lvl = chapter.class_level if chapter else 10
        subj_id = chapter.subject_id if chapter else None

        correct_opt = (
            question.correct_answer.get("selected_option")
            if isinstance(question.correct_answer, dict)
            else None
        )
        selected_opt = (
            attempt.submitted_response.get("selected_option")
            if isinstance(attempt.submitted_response, dict)
            else None
        )

        initial_state = {
            "attempt_id": attempt.id,
            "user_id": user.id,
            "question_id": question.id,
            "stem": question.stem_en or question.stem_or or "",
            "selected_option": selected_opt,
            "correct_option": correct_opt,
            "is_correct": bool(attempt.is_correct),
            "marks_lost": float(question.negative_marks if not attempt.is_correct else 0.0),
            "class_level": class_lvl,
            "subject_id": subj_id,
            "chapter_id": question.chapter_id,
            "retrieved_chunks": [],
            "citations": [],
            "grounded_evidence_text": "",
            "hypotheses": [],
            "selected_probes": [],
            "primary_cause": "",
            "confidence_score": 0.0,
            "is_uncertain": False,
            "recovery_report": None,
            "safe_trace_summary": "",
        }

        # Execute LangGraph state machine
        final_state = self.graph.invoke(initial_state)

        # Persist DiagnosticRun
        run_id = existing_run.id if existing_run else f"diag_{uuid.uuid4().hex[:12]}"
        run = existing_run or DiagnosticRun(id=run_id, attempt_id=attempt.id, user_id=user.id)

        run.status = "COMPLETED"
        run.primary_hypothesis = final_state.get("primary_cause", "UNKNOWN")
        run.confidence_score = final_state.get("confidence_score", 0.0)
        run.hypotheses_data = final_state.get("hypotheses", [])
        run.selected_probe_ids = [p["probe_id"] for p in final_state.get("selected_probes", [])]
        run.evidence_refs = final_state.get("citations", [])
        run.trace_summary = final_state.get("safe_trace_summary", "")
        run.recovery_eligible = not final_state.get("is_uncertain", False)

        if not existing_run:
            self.db.add(run)
        self.db.flush()

        # Persist DiagnosticProbes (max 2)
        for p_data in final_state.get("selected_probes", [])[:2]:
            probe_id = p_data["probe_id"]
            if not self.db.query(DiagnosticProbe).filter_by(id=probe_id).first():
                probe = DiagnosticProbe(
                    id=probe_id,
                    diagnostic_run_id=run.id,
                    probe_type=p_data.get("probe_type", "CONCEPT_DISAMBIGUATION"),
                    question_id=question.id,
                    prompt_stem=p_data.get("prompt_stem", ""),
                    options=p_data.get("options", []),
                    expected_discriminator={"rule": "Check understanding"},
                )
                self.db.add(probe)

        # Persist RecoveryReport
        rep_data = final_state.get("recovery_report")
        if rep_data:
            existing_report = self.db.query(RecoveryReport).filter_by(diagnostic_run_id=run.id).first()
            if not existing_report:
                report = RecoveryReport(
                    id=f"rep_{uuid.uuid4().hex[:12]}",
                    diagnostic_run_id=run.id,
                    attempt_id=attempt.id,
                    user_id=user.id,
                    marks_at_risk=rep_data.get("marks_at_risk", 1.0),
                    identified_cause=rep_data.get("identified_cause", "MISCONCEPTION"),
                    targeted_repair=rep_data.get("targeted_repair", ""),
                    mastery_check_details=rep_data.get("mastery_check_details", {}),
                    is_verified=False,
                )
                self.db.add(report)

            # Idempotently add StudyPlanTask
            plan = self.db.query(StudyPlan).filter_by(user_id=user.id).first()
            if not plan:
                plan = StudyPlan(
                    id=f"plan_{uuid.uuid4().hex[:12]}",
                    user_id=user.id,
                    title="Active Mark Recovery Plan",
                    target_exam="chse_class_12",
                )
                self.db.add(plan)
                self.db.flush()

            task_id = f"task_recov_{attempt.id}"
            if not self.db.query(StudyPlanTask).filter_by(id=task_id).first():
                task = StudyPlanTask(
                    id=task_id,
                    study_plan_id=plan.id,
                    concept_id=question.concept_id,
                    title=f"Repair {rep_data.get('identified_cause')}",
                    reason=f"Targeted repair after incorrect attempt on question {question.id}.",
                    evidence_source="Official Approved Textbook",
                    target_weakness=rep_data.get("identified_cause"),
                    status="pending",
                )
                self.db.add(task)

        self.db.commit()
        return run

    def list_user_reports(
        self, user: AuthenticatedUser, offset: int = 0, limit: int = 20
    ) -> list[RecoveryReport]:
        """Lists historical mark recovery reports for the authenticated learner."""
        return (
            self.db.query(RecoveryReport)
            .filter(RecoveryReport.user_id == user.id)
            .order_by(RecoveryReport.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def verify_recovery(
        self,
        report_id: str,
        user: AuthenticatedUser,
        is_mastery_correct: Optional[bool] = None,
        follow_up_attempt_id: Optional[str] = None,
        submitted_response: Optional[Dict[str, Any]] = None,
    ) -> RecoveryReport:
        """Verifies whether mark loss has been successfully recovered.
        
        Evaluates follow-up attempt correctness or submitted responses authoritatively
        on the server while supporting safe retry idempotency.
        """
        report = self.db.query(RecoveryReport).filter_by(id=report_id).first()
        if not report:
            raise APIException(
                status_code=404,
                error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                message=f"Recovery report '{report_id}' not found.",
            )

        enforce_ownership(report.user_id, user)

        # Idempotent retry: return report if already verified
        if report.is_verified:
            return report

        verified = False
        if follow_up_attempt_id:
            follow_up_att = self.db.query(Attempt).filter_by(id=follow_up_attempt_id).first()
            if not follow_up_att:
                raise APIException(
                    status_code=404,
                    error_code=APIErrorCode.RESOURCE_NOT_FOUND,
                    message=f"Follow-up attempt '{follow_up_attempt_id}' not found.",
                )
            enforce_ownership(follow_up_att.user_id, user)
            verified = bool(follow_up_att.is_correct)
        elif submitted_response is not None:
            mastery = report.mastery_check_details or {}
            expected = mastery.get("correct_option") or mastery.get("correct_answer")
            if expected:
                from app.services.attempt_service import evaluate_correctness
                verified = evaluate_correctness(submitted_response, expected)
            else:
                verified = bool(submitted_response.get("selected_option"))
        elif is_mastery_correct is not None:
            verified = bool(is_mastery_correct)
        else:
            raise APIException(
                status_code=422,
                error_code=APIErrorCode.VALIDATION_ERROR,
                message="Either follow_up_attempt_id, submitted_response, or is_mastery_correct must be provided.",
            )

        if verified:
            report.is_verified = True
            report.verified_at = datetime.now(timezone.utc)
            # Mark corresponding study plan task completed
            task_id = f"task_recov_{report.attempt_id}"
            task = self.db.query(StudyPlanTask).filter_by(id=task_id).first()
            if task:
                task.status = "completed"

        self.db.commit()
        return report
