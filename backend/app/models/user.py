"""User domain model representing learner and educator profiles."""

from typing import List, Optional
from sqlalchemy import Boolean, CheckConstraint, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import ExamTarget, PreferredLanguage, UserRole
from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """User account entity. Maps to authenticated identities while keeping PII minimal."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # Supabase Auth sub / UUID
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default=UserRole.LEARNER.value, index=True)
    preferred_language: Mapped[str] = mapped_column(
        String(20), default=PreferredLanguage.ODIA.value, nullable=False
    )
    exam_target: Mapped[str] = mapped_column(
        String(50), default=ExamTarget.CHSE_CLASS_12.value, nullable=False
    )
    class_level: Mapped[Optional[int]] = mapped_column(
        Integer,
        CheckConstraint("class_level IN (9, 10, 12)", name="ck_users_class_level"),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    attempts: Mapped[List["Attempt"]] = relationship(
        "Attempt", back_populates="user", cascade="all, delete-orphan"
    )
    study_plans: Mapped[List["StudyPlan"]] = relationship(
        "StudyPlan", back_populates="user", cascade="all, delete-orphan"
    )
    mock_sessions: Mapped[List["MockTestSession"]] = relationship(
        "MockTestSession", back_populates="user", cascade="all, delete-orphan"
    )
