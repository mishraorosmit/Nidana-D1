"""Attempt schemas for submission and authoritative score reporting."""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import AttemptLifecycle


class AttemptStartRequest(BaseModel):
    """Payload to initiate a question/variant attempt."""

    question_id: Optional[str] = Field(default=None, description="Base question ID")
    variant_id: Optional[str] = Field(default=None, description="Optional variant ID")

    model_config = ConfigDict(extra="forbid")


class AnswerSubmitRequest(BaseModel):
    """Payload submitted by the student when answering a question.

    SECURITY INVARIANT: Client MUST NOT supply is_correct or marks_obtained.
    Correctness and score are strictly calculated server-side.
    """

    submitted_response: Any = Field(description="Learner response representation, e.g. {'selected_option': 'B'}")
    time_taken_seconds: Optional[int] = Field(default=None, ge=0)
    learning_signals: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Telemetry signals (e.g. answer_changes, confidence_rating, language_toggled)",
    )

    model_config = ConfigDict(extra="forbid")


class AttemptResponse(BaseModel):
    """Authoritative attempt state returned to the student."""

    id: str
    user_id: str
    question_id: Optional[str]
    variant_id: Optional[str]
    lifecycle_state: AttemptLifecycle
    submitted_response: Optional[Any]
    is_correct: Optional[bool]
    marks_obtained: Optional[float]
    started_at: datetime
    submitted_at: Optional[datetime]
    time_taken_seconds: Optional[int]
    learning_signals: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)
