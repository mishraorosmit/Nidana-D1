"""Add class_level column to users table.

Revision ID: 0003_add_user_class_level
Revises: 0002_diagnosis_and_sync_schema
Create Date: 2026-10-13 11:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0003_add_user_class_level"
down_revision: Union[str, None] = "0002_diagnosis_and_sync_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use batch_alter_table for SQLite compatibility
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(
            sa.Column(
                "class_level",
                sa.Integer(),
                nullable=True,
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("class_level")
