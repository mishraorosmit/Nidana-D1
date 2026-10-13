from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_user_service
from app.core.errors import APIErrorCode, APIException
from app.core.security import AuthenticatedUser, enforce_ownership, get_current_user
from app.models import DiagnosticRun, RecoveryReport
from app.schemas.diagnosis import (
    DiagnosticProbeSummary,
    DiagnosticRunResponse,
    RecoveryReportResponse,
    RecoveryVerifyRequest,
    RecoveryVerifyResponse,
)
from app.services.user_service import UserService
from app.why_engine.service import WhyEngineService

router = APIRouter(prefix="/diagnosis", tags=["WHY Engine & Mark Recovery"])


def get_why_engine(db: Session = Depends(get_db)) -> WhyEngineService:
    return WhyEngineService(db)


@router.post(
    "/run/{attempt_id}",
    response_model=DiagnosticRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute WHY Engine diagnosis on an attempt",
)
def execute_diagnosis(
    attempt_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    engine: WhyEngineService = Depends(get_why_engine),
) -> DiagnosticRunResponse:
    user_service.get_or_create_from_token(current_user)
    run = engine.diagnose_attempt(attempt_id=attempt_id, user=current_user)
    return DiagnosticRunResponse(
        run_id=run.id,
        attempt_id=run.attempt_id,
        status=run.status,
        primary_hypothesis=run.primary_hypothesis,
        confidence_score=run.confidence_score,
        hypotheses=run.hypotheses_data,
        selected_probes=[
            DiagnosticProbeSummary(
                id=p.id,
                type=p.probe_type,
                prompt=p.prompt_stem,
                options=p.options,
            )
            for p in run.probes
        ],
        evidence_refs=run.evidence_refs,
        trace_summary=run.trace_summary,
        recovery_eligible=run.recovery_eligible,
        recovery_report_id=run.recovery_report.id if run.recovery_report else None,
    )


@router.get(
    "/reports",
    response_model=List[RecoveryReportResponse],
    status_code=status.HTTP_200_OK,
    summary="List Mark Recovery Reports",
)
def list_recovery_reports(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: AuthenticatedUser = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
    engine: WhyEngineService = Depends(get_why_engine),
) -> List[RecoveryReportResponse]:
    user_service.get_or_create_from_token(current_user)
    reports = engine.list_user_reports(user=current_user, offset=offset, limit=limit)
    return [
        RecoveryReportResponse(
            report_id=r.id,
            diagnostic_run_id=r.diagnostic_run_id,
            attempt_id=r.attempt_id,
            marks_at_risk=r.marks_at_risk,
            identified_cause=r.identified_cause,
            targeted_repair=r.targeted_repair,
            mastery_check_details=r.mastery_check_details,
            is_verified=r.is_verified,
            verified_at=r.verified_at,
        )
        for r in reports
    ]


@router.get(
    "/reports/{report_id}",
    response_model=RecoveryReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Mark Recovery Report",
)
def get_recovery_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> RecoveryReportResponse:
    report = db.query(RecoveryReport).filter_by(id=report_id).first()
    if not report:
        raise APIException(
            status_code=status.HTTP_404_NOT_FOUND,
            error_code=APIErrorCode.RESOURCE_NOT_FOUND,
            message=f"Recovery report '{report_id}' not found.",
        )
    enforce_ownership(report.user_id, current_user)
    return RecoveryReportResponse(
        report_id=report.id,
        diagnostic_run_id=report.diagnostic_run_id,
        attempt_id=report.attempt_id,
        marks_at_risk=report.marks_at_risk,
        identified_cause=report.identified_cause,
        targeted_repair=report.targeted_repair,
        mastery_check_details=report.mastery_check_details,
        is_verified=report.is_verified,
        verified_at=report.verified_at,
    )


@router.post(
    "/reports/{report_id}/verify",
    response_model=RecoveryVerifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Mark Recovery outcome",
)
def verify_mark_recovery(
    report_id: str,
    payload: RecoveryVerifyRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    engine: WhyEngineService = Depends(get_why_engine),
) -> RecoveryVerifyResponse:
    report = engine.verify_recovery(
        report_id=report_id,
        user=current_user,
        is_mastery_correct=payload.is_mastery_correct,
        follow_up_attempt_id=payload.follow_up_attempt_id,
        submitted_response=payload.submitted_response,
    )
    return RecoveryVerifyResponse(
        report_id=report.id,
        is_verified=report.is_verified,
        verified_at=report.verified_at,
        status="RECOVERED" if report.is_verified else "UNVERIFIED",
    )
