"""Tests for Alembic migration execution and database schema reflection."""

import os
import tempfile
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect


def test_alembic_migration_upgrade_and_schema():
    """Verify that Alembic runs 'upgrade head' successfully and provisions all expected tables."""
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    ini_path = os.path.join(backend_dir, "alembic.ini")

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_db:
        tmp_db_path = tmp_db.name

    try:
        db_url = f"sqlite:///{tmp_db_path}"
        engine = create_engine(db_url)

        alembic_cfg = Config(ini_path)
        alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))

        # Run migration on connection
        with engine.begin() as connection:
            alembic_cfg.attributes["connection"] = connection
            command.upgrade(alembic_cfg, "head")

        # Inspect generated database
        inspector = inspect(engine)
        tables = set(inspector.get_table_names())

        expected_tables = {
            "users",
            "subjects",
            "chapters",
            "concepts",
            "questions",
            "question_variants",
            "content_chunks",
            "attempts",
            "mock_test_sessions",
            "study_plans",
            "study_plan_tasks",
            "diagnostic_runs",
            "diagnostic_probes",
            "recovery_reports",
            "sync_receipts",
            "alembic_version",
        }
        for table in expected_tables:
            assert table in tables, f"Expected table '{table}' was not created by Alembic migration."

        # Verify columns on chapters
        chapter_columns = {col["name"] for col in inspector.get_columns("chapters")}
        assert "class_level" in chapter_columns
        assert "subject_id" in chapter_columns

        # Verify columns on content_chunks
        chunk_columns = {col["name"] for col in inspector.get_columns("content_chunks")}
        assert "source_locator" in chunk_columns
        assert "checksum" in chunk_columns
        assert "class_level" in chunk_columns

        # Verify columns on users
        user_columns = {col["name"] for col in inspector.get_columns("users")}
        assert "class_level" in user_columns

        engine.dispose()
    finally:
        if os.path.exists(tmp_db_path):
            try:
                os.remove(tmp_db_path)
            except OSError:
                pass
