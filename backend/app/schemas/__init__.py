"""Pydantic schemas package."""

from app.schemas.attempt import AnswerSubmitRequest, AttemptResponse, AttemptStartRequest
from app.schemas.chapter import ChapterBase, ChapterCreate, ChapterRead
from app.schemas.common import APIErrorBody, APIErrorResponse, ErrorDetail, HealthResponse
from app.schemas.concept import ConceptBase, ConceptCreate, ConceptRead
from app.schemas.content_chunk import ContentChunkBase, ContentChunkCreate, ContentChunkRead
from app.schemas.question import (
    QuestionCreate,
    QuestionOption,
    QuestionPublic,
    QuestionVariantCreate,
    QuestionVariantPublic,
    QuestionVariantWithAnswer,
    QuestionWithAnswer,
)
from app.schemas.study_plan import (
    StudyPlanBase,
    StudyPlanRead,
    StudyPlanTaskBase,
    StudyPlanTaskRead,
    StudyPlanTaskUpdate,
)
from app.schemas.subject import SubjectBase, SubjectCreate, SubjectRead
from app.schemas.user import UserBase, UserCreate, UserPublic, UserUpdate

from app.schemas.diagnosis import (
    DiagnosticProbeSummary,
    DiagnosticRunResponse,
    RecoveryReportResponse,
    RecoveryVerifyRequest,
    RecoveryVerifyResponse,
)

__all__ = [
    "HealthResponse",
    "APIErrorResponse",
    "APIErrorBody",
    "ErrorDetail",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserPublic",
    "SubjectBase",
    "SubjectCreate",
    "SubjectRead",
    "ChapterBase",
    "ChapterCreate",
    "ChapterRead",
    "ConceptBase",
    "ConceptCreate",
    "ConceptRead",
    "QuestionOption",
    "QuestionPublic",
    "QuestionVariantPublic",
    "QuestionWithAnswer",
    "QuestionVariantWithAnswer",
    "QuestionCreate",
    "QuestionVariantCreate",
    "ContentChunkBase",
    "ContentChunkCreate",
    "ContentChunkRead",
    "AttemptStartRequest",
    "AnswerSubmitRequest",
    "AttemptResponse",
    "StudyPlanBase",
    "StudyPlanRead",
    "StudyPlanTaskBase",
    "StudyPlanTaskRead",
    "StudyPlanTaskUpdate",
    "DiagnosticProbeSummary",
    "DiagnosticRunResponse",
    "RecoveryReportResponse",
    "RecoveryVerifyRequest",
    "RecoveryVerifyResponse",
]
