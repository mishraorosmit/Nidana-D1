"""Mock test session domain model for timed mini-mocks and diagnostic triggering."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class MockTestSession(Base, TimestampMixin):
    """Authoritative record of a 5-question mini-mock assessment session."""

    __tablename__ = "mock_test_sessions"
    __table_args__ = (
        Index("ix_mock_sessions_user_status", "user_id", "status"),
        Index("ix_mock_sessions_started_at", "started_at"),
    )

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g., "mock_..."
    user_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    class_level: Mapped[int] = mapped_column(Integer, nullable=False)
    subject_id: Mapped[Optional[str]] = mapped_column(
        String(50), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(30), default="in_progress", nullable=False, index=True)

    total_questions: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    total_marks: Mapped[float] = mapped_column(Float, nullable=False)

    # Stored list of assigned question IDs for this session
    question_ids: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Scored results (populated authoritatively upon submission)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    correct_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    incorrect_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    unanswered_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mock_sessions")

    @property
    def session_id(self) -> str:
        return self.id
