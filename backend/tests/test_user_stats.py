"""Tests for user class level profile update and authoritative stats aggregation."""

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.seed_demo_data import seed_demo_data
from app.models.attempt import Attempt
from app.models.diagnostic import DiagnosticRun, RecoveryReport


@pytest.fixture(autouse=True)
def seed_test_database(db_session: Session):
    """Seed demo curriculum and questions before each test."""
    seed_demo_data(db_session)


def test_update_profile_class_level_valid(client: TestClient, learner_auth_headers: dict):
    """Test updating user profile with valid class levels (9, 10, 12)."""
    response = client.patch(
        "/api/v1/me",
        headers=learner_auth_headers,
        json={"class_level": 10, "display_name": "Rohan Das"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["class_level"] == 10
    assert data["display_name"] == "Rohan Das"

    # Update to class 12
    response2 = client.patch(
        "/api/v1/me",
        headers=learner_auth_headers,
        json={"class_level": 12},
    )
    assert response2.status_code == 200
    assert response2.json()["class_level"] == 12


def test_update_profile_class_level_invalid(client: TestClient, learner_auth_headers: dict):
    """Test updating user profile with invalid class level (e.g., 11) is rejected with 422."""
    response = client.patch(
        "/api/v1/me",
        headers=learner_auth_headers,
        json={"class_level": 11},
    )
    assert response.status_code == 422


def test_get_user_stats_empty(client: TestClient, learner_auth_headers: dict):
    """Test getting stats for a fresh learner returns 0 attempts and clean breakdown."""
    response = client.get("/api/v1/me/stats", headers=learner_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_attempts"] == 0
    assert data["correct_attempts"] == 0
    assert data["accuracy_percentage"] == 0.0
    assert data["total_marks_obtained"] == 0.0
    assert data["recoverable_marks"] == 0.0
    assert data["recovered_marks"] == 0.0
    assert data["breakdown"]["english_terminology"] == 0.0
    assert data["breakdown"]["concept_gaps"] == 0.0


def test_get_user_stats_with_attempts_and_recovery(
    client: TestClient, learner_auth_headers: dict, db_session: Session
):
    """Test that learner stats authoritatively aggregate attempts, diagnostic runs, and verified reports."""
    # Ensure learner profile exists
    client.patch("/api/v1/me", headers=learner_auth_headers, json={"class_level": 10})

    # Fetch user_id from profile
    profile = client.get("/api/v1/me", headers=learner_auth_headers).json()
    user_id = profile["id"]

    now = datetime.now(timezone.utc)

    # Seed attempts using seeded questions from demo data
    att1 = Attempt(
        id="att_test_stats_1",
        user_id=user_id,
        question_id="q_c10_rxn_01",
        lifecycle_state="submitted",
        submitted_response={"selected_option": "B"},
        is_correct=False,
        marks_obtained=-1.0,
        started_at=now,
        submitted_at=now,
        time_taken_seconds=45,
    )
    att2 = Attempt(
        id="att_test_stats_2",
        user_id=user_id,
        question_id="q_c10_rxn_02",
        lifecycle_state="submitted",
        submitted_response={"selected_option": "C"},
        is_correct=True,
        marks_obtained=4.0,
        started_at=now,
        submitted_at=now,
        time_taken_seconds=30,
    )
    db_session.add_all([att1, att2])
    db_session.flush()

    # Seed a diagnostic run and recovery report
    diag = DiagnosticRun(
        id="diag_test_stats_1",
        attempt_id=att1.id,
        user_id=user_id,
        status="COMPLETED",
        primary_hypothesis="MISCONCEPTION",
        confidence_score=0.85,
        hypotheses_data=[],
        selected_probe_ids=[],
        evidence_refs=[],
        recovery_eligible=True,
    )
    db_session.add(diag)
    db_session.flush()

    report = RecoveryReport(
        id="rep_test_stats_1",
        diagnostic_run_id=diag.id,
        attempt_id=att1.id,
        user_id=user_id,
        marks_at_risk=4.0,
        identified_cause="Chemical formula valency confusion",
        targeted_repair="Review valency balancing rules",
        is_verified=True,
    )
    db_session.add(report)
    db_session.commit()

    # Query stats endpoint
    response = client.get("/api/v1/me/stats", headers=learner_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_attempts"] == 2
    assert data["correct_attempts"] == 1
    assert data["accuracy_percentage"] == 50.0
    assert data["total_marks_obtained"] == 3.0
    assert data["recoverable_marks"] == 4.0
    assert data["recovered_marks"] == 4.0
    assert data["breakdown"]["concept_gaps"] == 4.0
