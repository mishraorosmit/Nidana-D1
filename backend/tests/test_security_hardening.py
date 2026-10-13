"""Comprehensive security hardening tests.

Verifies:
1. Unauthorized requests fail with 401 and machine-readable error codes.
2. Cross-user data isolation and strict record ownership enforcement (403 OWNERSHIP_VIOLATION).
3. Client input validation rejects untrusted/extra fields (is_correct, marks_obtained, role escalation) with 422.
4. Role-based endpoint guards (ADMIN, EDUCATOR vs LEARNER).
5. Active assessment answer key and grading logic concealment across public endpoints.
6. Structured logging redaction of Bearer tokens, credentials, and sensitive headers.
"""

import json
import logging
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.constants import AttemptLifecycle, TaskStatus, UserRole
from app.core.errors import APIErrorCode
from app.core.logging import RedactingFormatter
from app.db.seed_demo_data import seed_demo_data
from app.models import Attempt, RecoveryReport, StudyPlan, StudyPlanTask, User
from tests.conftest import make_test_jwt


@pytest.fixture(autouse=True)
def seed_test_db(db_session: Session):
    seed_demo_data(db_session)
    # Ensure learner-123 and learner-456 exist for foreign key compliance
    for uid, email in [("learner-123", "learner@test.com"), ("learner-456", "other@test.com")]:
        if not db_session.query(User).filter_by(id=uid).first():
            u = User(id=uid, email=email, role=UserRole.LEARNER.value)
            db_session.add(u)
    db_session.commit()


# ============================================================================
# 1. Unauthorized Access Tests
# ============================================================================


def test_unauthenticated_requests_blocked(client: TestClient):
    """Protected routes must reject requests lacking Authorization Bearer token with 401."""
    protected_endpoints = [
        ("GET", "/api/v1/me"),
        ("PATCH", "/api/v1/me"),
        ("GET", "/api/v1/me/stats"),
        ("POST", "/api/v1/attempts"),
        ("GET", "/api/v1/attempts"),
        ("POST", "/api/v1/mock/start"),
        ("GET", "/api/v1/study-plans/me"),
        ("POST", "/api/v1/sync/batch"),
        ("POST", "/api/v1/rag/reindex"),
    ]
    for method, path in protected_endpoints:
        if method == "GET":
            resp = client.get(path)
        elif method == "POST":
            resp = client.post(path, json={})
        elif method == "PATCH":
            resp = client.patch(path, json={})

        assert resp.status_code == 401, f"{method} {path} returned {resp.status_code}"
        data = resp.json()
        assert data["error"]["code"] == APIErrorCode.AUTHENTICATION_REQUIRED.value


def test_invalid_and_expired_tokens_blocked(client: TestClient):
    """Invalid signatures and expired tokens must be rejected with 401."""
    # Expired token
    expired_token = make_test_jwt(expired=True)
    resp = client.get("/api/v1/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == APIErrorCode.TOKEN_EXPIRED.value

    # Tampered / Invalid signature token
    tampered_token = make_test_jwt(invalid_secret=True)
    resp = client.get("/api/v1/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == APIErrorCode.INVALID_TOKEN.value

    # Token with missing subject
    invalid_sub_jwt = make_test_jwt(user_id="")
    resp = client.get("/api/v1/me", headers={"Authorization": f"Bearer {invalid_sub_jwt}"})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == APIErrorCode.INVALID_TOKEN.value


# ============================================================================
# 2. Cross-User Record Ownership Enforcement Tests
# ============================================================================


def test_cross_user_attempt_isolation(
    client: TestClient, learner_auth_headers: dict, other_learner_auth_headers: dict
):
    """Learner B must NOT view or submit to Learner A's attempt (403 OWNERSHIP_VIOLATION)."""
    # 1. Learner A starts an attempt on a valid seeded question
    start_resp = client.post(
        "/api/v1/attempts",
        json={"question_id": "q_c10_rxn_01"},
        headers=learner_auth_headers,
    )
    assert start_resp.status_code == 201
    attempt_id = start_resp.json()["id"]

    # 2. Learner B attempts to read Learner A's attempt
    get_resp = client.get(f"/api/v1/attempts/{attempt_id}", headers=other_learner_auth_headers)
    assert get_resp.status_code == 403
    assert get_resp.json()["error"]["code"] == APIErrorCode.OWNERSHIP_VIOLATION.value

    # 3. Learner B attempts to submit an answer to Learner A's attempt
    submit_resp = client.post(
        f"/api/v1/attempts/{attempt_id}/submit",
        json={"submitted_response": {"selected_option": "B"}},
        headers=other_learner_auth_headers,
    )
    assert submit_resp.status_code == 403
    assert submit_resp.json()["error"]["code"] == APIErrorCode.OWNERSHIP_VIOLATION.value

    # 4. Learner A can view and submit successfully
    a_resp = client.get(f"/api/v1/attempts/{attempt_id}", headers=learner_auth_headers)
    assert a_resp.status_code == 200


def test_cross_user_mini_mock_isolation(
    client: TestClient, learner_auth_headers: dict, other_learner_auth_headers: dict
):
    """Learner B must NOT view or hijack Learner A's mini-mock session results (403)."""
    # 1. Learner A starts mini-mock
    start_resp = client.post(
        "/api/v1/mock/start",
        json={"class_level": 10},
        headers=learner_auth_headers,
    )
    assert start_resp.status_code == 200
    mock_data = start_resp.json()
    session_id = mock_data["session_id"]
    answers = [
        {"question_id": q["id"], "selected_option": "B", "time_taken_seconds": 30}
        for q in mock_data["questions"]
    ]

    # 2. Learner A submits
    sub_resp = client.post(
        f"/api/v1/mock/{session_id}/submit",
        json={"answers": answers},
        headers=learner_auth_headers,
    )
    assert sub_resp.status_code == 200

    # 3. Learner B tries to retrieve Learner A's session results
    get_resp = client.get(f"/api/v1/mock/{session_id}", headers=other_learner_auth_headers)
    assert get_resp.status_code == 403
    assert get_resp.json()["error"]["code"] == APIErrorCode.OWNERSHIP_VIOLATION.value

    # 4. Learner B tries to submit to Learner A's session
    b_sub_resp = client.post(
        f"/api/v1/mock/{session_id}/submit",
        json={"answers": answers},
        headers=other_learner_auth_headers,
    )
    assert b_sub_resp.status_code == 403
    assert b_sub_resp.json()["error"]["code"] == APIErrorCode.OWNERSHIP_VIOLATION.value


def test_cross_user_diagnosis_and_recovery_isolation(
    client: TestClient,
    db_session: Session,
    learner_auth_headers: dict,
    other_learner_auth_headers: dict,
):
    """Learner B cannot run diagnosis or access/verify recovery reports of Learner A."""
    from app.models import DiagnosticRun

    # Seed an attempt belonging to learner-123
    attempt = Attempt(
        id="att_sec_test_01",
        user_id="learner-123",
        question_id="q_c10_rxn_01",
        lifecycle_state=AttemptLifecycle.SUBMITTED.value,
        submitted_response={"selected_option": "A"},
        is_correct=False,
        marks_obtained=-1.0,
        started_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
    )
    db_session.add(attempt)

    # Seed diagnostic run
    run = DiagnosticRun(
        id="diag_sec_test_01",
        attempt_id=attempt.id,
        user_id="learner-123",
        status="COMPLETED",
    )
    db_session.add(run)

    # Seed a recovery report belonging to learner-123
    report = RecoveryReport(
        id="rep_sec_test_01",
        diagnostic_run_id=run.id,
        attempt_id=attempt.id,
        user_id="learner-123",
        marks_at_risk=5.0,
        identified_cause="Concept Gap",
        targeted_repair="Review oxidation",
        mastery_check_details={"question_id": "q_c10_rxn_01"},
        is_verified=False,
    )
    db_session.add(report)
    db_session.commit()

    # 1. Learner B tries to diagnose Learner A's attempt
    diag_resp = client.post(
        f"/api/v1/diagnosis/run/{attempt.id}",
        headers=other_learner_auth_headers,
    )
    assert diag_resp.status_code == 403
    assert diag_resp.json()["error"]["code"] == APIErrorCode.OWNERSHIP_VIOLATION.value

    # 2. Learner B tries to get Learner A's recovery report
    rep_resp = client.get(
        f"/api/v1/diagnosis/reports/{report.id}",
        headers=other_learner_auth_headers,
    )
    assert rep_resp.status_code == 403
    assert rep_resp.json()["error"]["code"] == APIErrorCode.OWNERSHIP_VIOLATION.value

    # 3. Learner B tries to verify recovery on Learner A's report
    verify_resp = client.post(
        f"/api/v1/diagnosis/reports/{report.id}/verify",
        json={"is_mastery_correct": True},
        headers=other_learner_auth_headers,
    )
    assert verify_resp.status_code == 403
    assert verify_resp.json()["error"]["code"] == APIErrorCode.OWNERSHIP_VIOLATION.value

    # 4. Non-existent report returns 404
    non_existent_resp = client.get(
        "/api/v1/diagnosis/reports/rep_non_existent_999",
        headers=learner_auth_headers,
    )
    assert non_existent_resp.status_code == 404
    assert non_existent_resp.json()["error"]["code"] == APIErrorCode.RESOURCE_NOT_FOUND.value


def test_cross_user_study_plan_isolation(
    client: TestClient,
    db_session: Session,
    learner_auth_headers: dict,
    other_learner_auth_headers: dict,
):
    """Learner B cannot modify tasks in Learner A's study plan."""
    plan = StudyPlan(
        id="sp_sec_test_01",
        user_id="learner-123",
        title="Class 10 Revision",
        created_at=datetime.now(timezone.utc),
    )
    db_session.add(plan)
    task = StudyPlanTask(
        id="task_sec_test_01",
        study_plan_id=plan.id,
        title="Revise Redox",
        reason="Marks lost in mock",
        status=TaskStatus.PENDING.value,
        created_at=datetime.now(timezone.utc),
    )
    db_session.add(task)
    db_session.commit()

    # Learner B tries to mark Learner A's task completed
    patch_resp = client.patch(
        f"/api/v1/study-plans/tasks/{task.id}",
        json={"status": "completed"},
        headers=other_learner_auth_headers,
    )
    assert patch_resp.status_code == 403
    assert patch_resp.json()["error"]["code"] == APIErrorCode.OWNERSHIP_VIOLATION.value


# ============================================================================
# 3. Input Validation & Privilege Escalation Prevention (extra="forbid")
# ============================================================================


def test_client_cannot_tamper_scores_or_correctness(
    client: TestClient, learner_auth_headers: dict
):
    """Submissions supplying client-fabricated is_correct or marks_obtained are rejected with 422."""
    start_resp = client.post(
        "/api/v1/attempts",
        json={"question_id": "q_c10_rxn_01"},
        headers=learner_auth_headers,
    )
    attempt_id = start_resp.json()["id"]

    # Client maliciously attempts to self-score with 100 marks and is_correct=True
    tampered_payload = {
        "submitted_response": {"selected_option": "B"},
        "is_correct": True,
        "marks_obtained": 100.0,
    }
    submit_resp = client.post(
        f"/api/v1/attempts/{attempt_id}/submit",
        json=tampered_payload,
        headers=learner_auth_headers,
    )
    assert submit_resp.status_code == 422
    assert submit_resp.json()["error"]["code"] == APIErrorCode.VALIDATION_ERROR.value


def test_client_cannot_escalate_role_via_profile_update(
    client: TestClient, learner_auth_headers: dict
):
    """User profile update attempting to escalate role to admin is rejected with 422."""
    tampered_update = {
        "display_name": "Hacker Learner",
        "role": "admin",
        "is_active": True,
    }
    resp = client.patch(
        "/api/v1/me",
        json=tampered_update,
        headers=learner_auth_headers,
    )
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == APIErrorCode.VALIDATION_ERROR.value


def test_mock_request_extra_fields_rejected(
    client: TestClient, learner_auth_headers: dict
):
    """Extra fields in mock start and submit requests are rejected with 422."""
    # Extra field in MockStartRequest
    resp1 = client.post(
        "/api/v1/mock/start",
        json={"class_level": 10, "cheat_mode": True},
        headers=learner_auth_headers,
    )
    assert resp1.status_code == 422
    assert resp1.json()["error"]["code"] == APIErrorCode.VALIDATION_ERROR.value

    # Extra field in MockAnswerSubmission
    resp2 = client.post(
        "/api/v1/mock/session_fake_123/submit",
        json={
            "answers": [
                {
                    "question_id": "q_c10_rxn_01",
                    "selected_option": "B",
                    "is_correct": True,  # Untrusted client score
                }
            ]
        },
        headers=learner_auth_headers,
    )
    assert resp2.status_code == 422
    assert resp2.json()["error"]["code"] == APIErrorCode.VALIDATION_ERROR.value


# ============================================================================
# 4. Role-Based Privilege Protection Tests
# ============================================================================


def test_role_enforcement_on_authoring_and_reindex(
    client: TestClient,
    learner_auth_headers: dict,
    educator_auth_headers: dict,
    admin_auth_headers: dict,
):
    """Learners cannot create questions or trigger RAG re-indexing (403 FORBIDDEN)."""
    question_payload = {
        "id": "q_new_sec_test",
        "chapter_id": "chap_c10_chem_rxn",
        "concept_id": "cpt_c10_redox",
        "type": "single_choice",
        "difficulty": "medium",
        "marks": 4.0,
        "negative_marks": 1.0,
        "expected_time_seconds": 120,
        "language": "bilingual",
        "stem_en": "What is the oxidation state?",
        "options": [
            {"id": "A", "text_en": "+1"},
            {"id": "B", "text_en": "+2"},
        ],
        "correct_answer": {"selected_option": "B"},
        "approval_state": "approved",
        "version": "1.0.0",
    }

    # 1. Learner attempts question creation -> 403
    q_learner_resp = client.post(
        "/api/v1/questions",
        json=question_payload,
        headers=learner_auth_headers,
    )
    assert q_learner_resp.status_code == 403
    assert q_learner_resp.json()["error"]["code"] == APIErrorCode.FORBIDDEN.value

    # 2. Educator creates question -> 201
    q_educator_resp = client.post(
        "/api/v1/questions",
        json=question_payload,
        headers=educator_auth_headers,
    )
    assert q_educator_resp.status_code == 201

    # 3. Learner attempts RAG reindex -> 403
    rag_learner_resp = client.post(
        "/api/v1/rag/reindex",
        headers=learner_auth_headers,
    )
    assert rag_learner_resp.status_code == 403
    assert rag_learner_resp.json()["error"]["code"] == APIErrorCode.FORBIDDEN.value

    # 4. Admin performs RAG reindex -> 200
    rag_admin_resp = client.post(
        "/api/v1/rag/reindex",
        headers=admin_auth_headers,
    )
    assert rag_admin_resp.status_code == 200


# ============================================================================
# 5. Answer Key Concealment During Active Assessments
# ============================================================================


def test_active_assessment_conceals_answer_keys(
    client: TestClient, learner_auth_headers: dict
):
    """Answer keys, correct options, and explanations are NEVER returned in active assessments."""
    # 1. Mini-mock start
    start_resp = client.post(
        "/api/v1/mock/start",
        json={"class_level": 10},
        headers=learner_auth_headers,
    )
    assert start_resp.status_code == 200
    mock_questions = start_resp.json()["questions"]
    for q in mock_questions:
        assert "correct_answer" not in q
        assert "explanation_en" not in q
        assert "explanation_or" not in q
        assert "distractor_metadata" not in q

    # 2. Public questions list
    list_resp = client.get("/api/v1/questions?limit=10")
    assert list_resp.status_code == 200
    for q in list_resp.json():
        assert "correct_answer" not in q
        assert "explanation_en" not in q
        assert "explanation_or" not in q
        assert "distractor_metadata" not in q

    # 3. Single question get
    q_resp = client.get("/api/v1/questions/q_c10_rxn_01")
    assert q_resp.status_code == 200
    single_q = q_resp.json()
    assert "correct_answer" not in single_q
    assert "explanation_en" not in single_q
    assert "explanation_or" not in single_q
    assert "distractor_metadata" not in single_q

    # 4. Offline content pack questions
    pack_resp = client.get("/api/v1/sync/packs/pack_c10_sci_v1")
    assert pack_resp.status_code == 200
    pack_questions = pack_resp.json()["questions"]
    for q in pack_questions:
        assert "correct_answer" not in q
        assert "explanation_en" not in q
        assert "explanation_or" not in q


# ============================================================================
# 6. Sensitive Data Redaction in Logging
# ============================================================================


def test_logging_redacts_credentials_and_secrets():
    """RedactingFormatter must redact Bearer tokens, cookies, passwords, and sensitive keys."""
    formatter = RedactingFormatter()

    record1 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="test.py",
        lineno=1,
        msg="User authenticated with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secretpayload",
        args=(),
        exc_info=None,
    )
    formatted1 = json.loads(formatter.format(record1))
    assert "[REDACTED]" in formatted1["message"]
    assert "secretpayload" not in formatted1["message"]

    record2 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="test.py",
        lineno=2,
        msg='Request headers: Authorization: Bearer secret123, Cookie: session=abc456',
        args=(),
        exc_info=None,
    )
    formatted2 = json.loads(formatter.format(record2))
    assert "secret123" not in formatted2["message"]
    assert "abc456" not in formatted2["message"]
    assert "[REDACTED]" in formatted2["message"]
