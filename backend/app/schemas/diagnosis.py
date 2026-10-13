"""Pydantic request and response schemas for WHY Engine diagnosis and mark recovery."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DiagnosticProbeSummary(BaseModel):
    """Summary of a diagnostic probe presented to verify student misconception."""

    id: str
    type: str
    prompt: str
    options: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(extra="forbid")


class DiagnosticRunResponse(BaseModel):
    """Outcome of a WHY Engine diagnosis execution."""

    run_id: str
    attempt_id: str
    status: str
    primary_hypothesis: Optional[str] = None
    confidence_score: Optional[float] = None
    hypotheses: List[Dict[str, Any]] = Field(default_factory=list)
    selected_probes: List[DiagnosticProbeSummary] = Field(default_factory=list)
    evidence_refs: List[Dict[str, Any]] = Field(default_factory=list)
    trace_summary: Optional[str] = None
    recovery_eligible: bool = True
    recovery_report_id: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class RecoveryReportResponse(BaseModel):
    """Mark Recovery Report summarizing diagnosed weakness, targeted repair, and mastery verification."""

    report_id: str
    diagnostic_run_id: str
    attempt_id: str
    marks_at_risk: float
    identified_cause: str
    targeted_repair: str
    mastery_check_details: Dict[str, Any] = Field(default_factory=dict)
    is_verified: bool
    verified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class RecoveryVerifyRequest(BaseModel):
    """Learner payload to verify mark recovery outcome."""

    is_mastery_correct: Optional[bool] = Field(
        default=None, description="Direct mastery check result (backward compatible)"
    )
    follow_up_attempt_id: Optional[str] = Field(
        default=None, description="Authoritatively graded follow-up attempt demonstrating recovery"
    )
    submitted_response: Optional[Dict[str, Any]] = Field(
        default=None, description="Direct learner response to the mastery check probe"
    )

    model_config = ConfigDict(extra="forbid")


class RecoveryVerifyResponse(BaseModel):
    """Result of mark recovery verification."""

    report_id: str
    is_verified: bool
    verified_at: Optional[datetime] = None
    status: str  # "RECOVERED" or "UNVERIFIED"

    model_config = ConfigDict(extra="forbid")
