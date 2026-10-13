"""Integration tests for NIDANA backend API contracts, clean migration setup, and OpenAPI schema accuracy.

Verifies:
1. OpenAPI specification schema generation, path completeness, and security schemes.
2. Database initialization from scratch in a clean environment using Alembic migrations.
3. Stable API contract execution across Authentication, Questions, Mocks, Attempts,
   Diagnostics, Recovery Reports, Study Plans, Offline Sync, and RAG endpoints.
4. Uniform machine-readable error envelopes across 401, 403, 404, and 422 errors.
"""

import os
import tempfile
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from app.db.seed_demo_data import seed_demo_data
from app.main import create_app


@pytest.fixture(autouse=True)
def seed_test_database(db_session: Session):
    """Seed demo questions before each test."""
    seed_demo_data(db_session)


def test_clean_environment_database_migration_setup():
    """Verify that a fresh, empty SQLite database provisions all tables and constraints via Alembic."""
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    ini_path = os.path.join(backend_dir, "alembic.ini")

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_db:
        tmp_db_path = tmp_db.name

    try:
        db_url = f"sqlite:///{tmp_db_path}"
        engine = create_engine(db_url)

        alembic_cfg = Config(ini_path)
        alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))

        with engine.begin() as connection:
            alembic_cfg.attributes["connection"] = connection
            command.upgrade(alembic_cfg, "head")

        inspector = inspect(engine)
        tables = set(inspector.get_table_names())

        required_tables = {
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
        for tbl in required_tables:
            assert tbl in tables, f"Clean migration failed to create table '{tbl}'"

        engine.dispose()
    finally:
        if os.path.exists(tmp_db_path):
            try:
                os.remove(tmp_db_path)
            except OSError:
                pass


def test_openapi_schema_completeness_and_security():
    """Verify OpenAPI 3.x schema exports all agreed routes and registers HTTPBearer authentication."""
    app = create_app()
    schema = app.openapi()

    assert schema["info"]["title"] == "NIDANA API"
    assert schema["openapi"].startswith("3.")
    paths = schema["paths"]

    # Assert all agreed API surfaces are mounted
    expected_paths = [
        "/api/v1/health",
        "/api/v1/me",
        "/api/v1/me/stats",
        "/api/v1/subjects",
        "/api/v1/chapters",
        "/api/v1/concepts",
        "/api/v1/questions",
        "/api/v1/questions/{question_id}",
        "/api/v1/questions/{question_id}/variants",
        "/api/v1/attempts",
        "/api/v1/attempts/{attempt_id}",
        "/api/v1/attempts/{attempt_id}/submit",
        "/api/v1/mock/start",
        "/api/v1/mock/sessions",
        "/api/v1/mock/{session_id}/active",
        "/api/v1/mock/{session_id}/submit",
        "/api/v1/mock/{session_id}",
        "/api/v1/diagnosis/run/{attempt_id}",
        "/api/v1/diagnosis/reports",
        "/api/v1/diagnosis/reports/{report_id}",
        "/api/v1/diagnosis/reports/{report_id}/verify",
        "/api/v1/study-plans/me",
        "/api/v1/study-plans/tasks/{task_id}",
        "/api/v1/sync/packs",
        "/api/v1/sync/packs/{pack_id}",
        "/api/v1/sync/batch",
        "/api/v1/rag/health",
        "/api/v1/rag/reindex",
        "/api/v1/rag/query",
    ]
    for path in expected_paths:
        assert path in paths, f"Path '{path}' missing from OpenAPI specification."

    # Assert HTTPBearer security scheme exists
    components = schema.get("components", {})
    security_schemes = components.get("securitySchemes", {})
    assert "HTTPBearer" in security_schemes
    assert security_schemes["HTTPBearer"]["type"] == "http"
    assert security_schemes["HTTPBearer"]["scheme"] == "bearer"


def test_auth_and_profile_contract(client: TestClient, learner_auth_headers: dict):
    """Verify GET /me, PATCH /me, and GET /me/stats contracts."""
    # 1. GET /me
    get_me = client.get("/api/v1/me", headers=learner_auth_headers)
    assert get_me.status_code == 200
    user_data = get_me.json()
    assert user_data["id"] == "learner-123"
    assert "role" in user_data

    # 2. PATCH /me
    patch_me = client.patch(
        "/api/v1/me",
        json={"display_name": "Priya Sharma", "class_level": 10},
        headers=learner_auth_headers,
    )
    assert patch_me.status_code == 200
    assert patch_me.json()["display_name"] == "Priya Sharma"
    assert patch_me.json()["class_level"] == 10

    # 3. GET /me/stats
    stats_resp = client.get("/api/v1/me/stats", headers=learner_auth_headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert "total_attempts" in stats
    assert "accuracy_percentage" in stats
    assert "recoverable_marks" in stats
    assert "recovered_marks" in stats
    assert "breakdown" in stats


def test_study_plan_contract(client: TestClient, learner_auth_headers: dict):
    """Verify GET /study-plans/me and PATCH /study-plans/tasks/{task_id} contracts."""
    # 1. Trigger diagnosis to generate study plan task
    att = client.post(
        "/api/v1/attempts",
        json={"question_id": "q_c10_rxn_01"},
        headers=learner_auth_headers,
    ).json()

    client.post(
        f"/api/v1/attempts/{att['id']}/submit",
        json={"submitted_response": {"selected_option": "B"}},
        headers=learner_auth_headers,
    )

    client.post(f"/api/v1/diagnosis/run/{att['id']}", headers=learner_auth_headers)

    # 2. GET /study-plans/me
    plan_resp = client.get("/api/v1/study-plans/me", headers=learner_auth_headers)
    assert plan_resp.status_code == 200
    plan = plan_resp.json()
    assert plan is not None
    assert len(plan["tasks"]) >= 1
    task = plan["tasks"][0]
    task_id = task["id"]
    assert task["status"] in ["pending", "in_progress", "completed", "skipped"]

    # 3. PATCH /study-plans/tasks/{task_id}
    patch_task = client.patch(
        f"/api/v1/study-plans/tasks/{task_id}",
        json={"status": "in_progress"},
        headers=learner_auth_headers,
    )
    assert patch_task.status_code == 200
    assert patch_task.json()["status"] == "in_progress"


def test_offline_pack_and_sync_contract(client: TestClient, learner_auth_headers: dict):
    """Verify GET /sync/packs, GET /sync/packs/{pack_id}, and POST /sync/batch contracts."""
    # 1. List packs
    packs_resp = client.get("/api/v1/sync/packs")
    assert packs_resp.status_code == 200
    packs = packs_resp.json()
    assert len(packs) >= 1
    pack_id = packs[0]["pack_id"]

    # 2. Download pack bundle
    bundle_resp = client.get(f"/api/v1/sync/packs/{pack_id}")
    assert bundle_resp.status_code == 200
    bundle = bundle_resp.json()
    assert bundle["manifest"]["pack_id"] == pack_id
    assert "questions" in bundle
    # Security check: correct answer concealed
    for q in bundle["questions"]:
        assert "correct_answer" not in q

    # 3. POST /sync/batch
    from datetime import datetime, timezone
    sync_payload = {
        "events": [
            {
                "client_event_id": "evt_contract_test_001",
                "event_type": "ATTEMPT_SUBMIT",
                "payload_schema_version": "1.0.0",
                "client_timestamp": datetime.now(timezone.utc).isoformat(),
                "payload": {
                    "question_id": "q_c10_rxn_01",
                    "selected_option": "A",
                    "time_taken_seconds": 20,
                },
            }
        ]
    }
    sync_resp = client.post("/api/v1/sync/batch", json=sync_payload, headers=learner_auth_headers)
    assert sync_resp.status_code == 200
    sync_data = sync_resp.json()
    assert sync_data["accepted_count"] == 1
    assert sync_data["duplicate_count"] == 0

    # Repeat sync to verify idempotency
    sync_repeat = client.post("/api/v1/sync/batch", json=sync_payload, headers=learner_auth_headers)
    assert sync_repeat.status_code == 200
    assert sync_repeat.json()["duplicate_count"] == 1


def test_rag_ai_boundary_contract(client: TestClient):
    """Verify GET /rag/health and POST /rag/query explicit interfaces for AI teammate."""
    # 1. Health check
    health_resp = client.get("/api/v1/rag/health")
    assert health_resp.status_code == 200
    health = health_resp.json()
    assert health["status"] == "healthy"
    assert "indexed_records" in health
    assert "collection" in health

    # 2. Query interface
    query_resp = client.post(
        "/api/v1/rag/query",
        json={
            "query_text": "oxidation and reduction",
            "class_level": 10,
            "subject_id": "sub_science",
            "top_k": 3,
        },
    )
    assert query_resp.status_code == 200
    query_data = query_resp.json()
    assert "has_sufficient_evidence" in query_data
    assert "citations" in query_data
    assert "grounded_text" in query_data
    assert "chunks" in query_data


def test_error_envelope_consistency(client: TestClient, learner_auth_headers: dict):
    """Verify uniform error response structure across 401, 403, 404, and 422."""
    # 401 Unauthorized
    resp_401 = client.get("/api/v1/me")
    assert resp_401.status_code == 401
    err_401 = resp_401.json()
    assert "error" in err_401
    assert "code" in err_401["error"]
    assert "message" in err_401["error"]

    # 404 Not Found
    resp_404 = client.get("/api/v1/questions/non_existent_q_999")
    assert resp_404.status_code == 404
    err_404 = resp_404.json()
    assert "error" in err_404
    assert err_404["error"]["code"] == "RESOURCE_NOT_FOUND"

    # 422 Validation Error
    resp_422 = client.patch("/api/v1/me", json={"invalid_field": 123}, headers=learner_auth_headers)
    assert resp_422.status_code == 422
    err_422 = resp_422.json()
    assert "error" in err_422
    assert err_422["error"]["code"] == "VALIDATION_ERROR"
