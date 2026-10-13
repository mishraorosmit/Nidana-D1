"""User request and response schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.constants import ExamTarget, PreferredLanguage, UserRole


class UserBase(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=100)
    preferred_language: PreferredLanguage = Field(default=PreferredLanguage.ODIA)
    exam_target: ExamTarget = Field(default=ExamTarget.CHSE_CLASS_12)
    class_level: Optional[int] = Field(default=None, description="Class level (9, 10, or 12)")

    @field_validator("class_level")
    @classmethod
    def validate_class_level(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v not in [9, 10, 12]:
            raise ValueError("Class level must be 9, 10, or 12.")
        return v


class UserCreate(UserBase):
    id: str = Field(description="Supabase Auth UUID")
    email: EmailStr
    role: UserRole = Field(default=UserRole.LEARNER)


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=100)
    preferred_language: Optional[PreferredLanguage] = None
    exam_target: Optional[ExamTarget] = None
    class_level: Optional[int] = Field(default=None, description="Class level (9, 10, or 12)")

    @field_validator("class_level")
    @classmethod
    def validate_class_level(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v not in [9, 10, 12]:
            raise ValueError("Class level must be 9, 10, or 12.")
        return v

    model_config = ConfigDict(extra="forbid")


class UserPublic(UserBase):
    id: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HypothesisBreakdown(BaseModel):
    """Marks-at-risk breakdown by diagnosed category for student report."""

    english_terminology: float = Field(default=0.0, description="Marks at risk due to language/terminology friction")
    time_pressure: float = Field(default=0.0, description="Marks at risk due to careless execution or time pressure")
    concept_gaps: float = Field(default=0.0, description="Marks at risk due to concept or prerequisite gaps")
    other: float = Field(default=0.0, description="Marks at risk due to other procedural causes")


class UserStatsResponse(BaseModel):
    """Authoritative performance and mark-recovery summary for the learner."""

    user_id: str
    class_level: Optional[int] = None
    total_attempts: int
    correct_attempts: int
    accuracy_percentage: float
    total_marks_obtained: float
    recoverable_marks: float
    recovered_marks: float
    breakdown: HypothesisBreakdown

    model_config = ConfigDict(from_attributes=True)
