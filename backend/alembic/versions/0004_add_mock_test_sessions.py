"""Add mock_test_sessions table for assessment lifecycle.

Revision ID: 0004_add_mock_test_sessions
Revises: 0003_add_user_class_level
Create Date: 2026-10-13 12:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0004_add_mock_test_sessions"
down_revision: Union[str, None] = "0003_add_user_class_level"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "mock_test_sessions",
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("user_id", sa.String(length=50), nullable=False),
        sa.Column("class_level", sa.Integer(), nullable=False),
        sa.Column("subject_id", sa.String(length=50), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="in_progress"),
        sa.Column("total_questions", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("total_marks", sa.Float(), nullable=False),
        sa.Column("question_ids", sa.JSON(), nullable=False),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("correct_count", sa.Integer(), nullable=True),
        sa.Column("incorrect_count", sa.Integer(), nullable=True),
        sa.Column("unanswered_count", sa.Integer(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["subject_id"], ["subjects.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_mock_sessions_user_status", "mock_test_sessions", ["user_id", "status"])
    op.create_index("ix_mock_sessions_started_at", "mock_test_sessions", ["started_at"])


def downgrade() -> None:
    op.drop_index("ix_mock_sessions_started_at", table_name="mock_test_sessions")
    op.drop_index("ix_mock_sessions_user_status", table_name="mock_test_sessions")
    op.drop_table("mock_test_sessions")
