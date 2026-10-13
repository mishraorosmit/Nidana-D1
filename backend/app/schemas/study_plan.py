"""StudyPlan and StudyPlanTask schemas."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import ExamTarget, StudyPlanStatus, TaskStatus


class StudyPlanTaskBase(BaseModel):
    title: str = Field(max_length=255)
    reason: str
    evidence_source: Optional[str] = None
    target_weakness: Optional[str] = None
    due_date: Optional[datetime] = None
    status: TaskStatus = TaskStatus.PENDING
    concept_id: Optional[str] = None
    follow_up_question_id: Optional[str] = None


class StudyPlanTaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None

    model_config = ConfigDict(extra="forbid")


class StudyPlanTaskRead(StudyPlanTaskBase):
    id: str
    study_plan_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudyPlanBase(BaseModel):
    title: str = Field(max_length=255)
    target_exam: ExamTarget = ExamTarget.CHSE_CLASS_12
    status: StudyPlanStatus = StudyPlanStatus.ACTIVE


class StudyPlanRead(StudyPlanBase):
    id: str
    user_id: str
    created_at: datetime
    tasks: List[StudyPlanTaskRead] = []

    model_config = ConfigDict(from_attributes=True)
