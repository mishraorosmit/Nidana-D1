"""Comprehensive tests for the server-side assessment data lifecycle in NIDANA.

Covers:
- Question retrieval with curriculum & language filtering and answer key concealment
- Mock test creation, persistence, resumption, and status transitions
- Server-authoritative grading, question validation, and duplicate/retry idempotency
- Mock session history listing with pagination and cross-user isolation
- Single attempt lifecycle, filtering, and idempotent resubmission protection
- Mark-recovery evidence persistence, report listing, and authoritative verification
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.seed_demo_data import seed_demo_data
from app.models.mock_session import MockTestSession


@pytest.fixture(autouse=True)
def seed_test_database(db_session: Session):
    """Seed demo questions and chapters before each test."""
    seed_demo_data(db_session)


def test_question_retrieval_filtering_and_language_support(
    client: TestClient, learner_auth_headers: dict
):
    """Verify question retrieval filtering by class, subject, language, and pagination."""
    # 1. Filter by class 10
    resp_c10 = client.get(
        "/api/v1/questions?class_level=10",
        headers=learner_auth_headers,
    )
    assert resp_c10.status_code == 200
    questions_c10 = resp_c10.json()
    assert len(questions_c10) >= 5
    for q in questions_c10:
        assert "correct_answer" not in q
        assert "explanation_en" not in q

    # 2. Filter by subject
    resp_subj = client.get(
        "/api/v1/questions?class_level=10&subject_id=sub_science",
        headers=learner_auth_headers,
    )
    assert resp_subj.status_code == 200
    questions_subj = resp_subj.json()
    assert len(questions_subj) >= 1

    # 3. Filter by language (bilingual)
    resp_lang = client.get(
        "/api/v1/questions?language=bilingual&limit=3",
        headers=learner_auth_headers,
    )
    assert resp_lang.status_code == 200
    questions_bilingual = resp_lang.json()
    assert len(questions_bilingual) <= 3
    for q in questions_bilingual:
        # All questions must conceal privileged answer keys
        assert "correct_answer" not in q
        assert "stem_en" in q
        assert "stem_or" in q

    # 4. Pagination offset
    resp_p1 = client.get("/api/v1/questions?limit=2&offset=0", headers=learner_auth_headers)
    resp_p2 = client.get("/api/v1/questions?limit=2&offset=2", headers=learner_auth_headers)
    assert resp_p1.status_code == 200 and resp_p2.status_code == 200
    p1_ids = [q["id"] for q in resp_p1.json()]
    p2_ids = [q["id"] for q in resp_p2.json()]
    assert set(p1_ids).isdisjoint(set(p2_ids))


def test_mock_test_session_lifecycle_and_active_resumption(
    client: TestClient, learner_auth_headers: dict, db_session: Session
):
    """Verify mock session creation, persistence, resumption, and pre-submission error handling."""
    # 1. Start a mock session
    start_resp = client.post(
        "/api/v1/mock/start",
        json={"class_level": 10, "language": "bilingual"},
        headers=learner_auth_headers,
    )
    assert start_resp.status_code == 200
    mock_data = start_resp.json()
    session_id = mock_data["session_id"]
    assert mock_data["status"] == "in_progress"
    assert mock_data["total_questions"] == 5

    # 2. Verify database persistence of MockTestSession
    db_session.expire_all()
    session_rec = db_session.query(MockTestSession).filter_by(id=session_id).first()
    assert session_rec is not None
    assert session_rec.status == "in_progress"
    assert session_rec.user_id == "learner-123"
    assert len(session_rec.question_ids) == 5

    # 3. Retrieve active in-progress session
    active_resp = client.get(
        f"/api/v1/mock/{session_id}/active",
        headers=learner_auth_headers,
    )
    assert active_resp.status_code == 200
    active_data = active_resp.json()
    assert active_data["session_id"] == session_id
    assert active_data["status"] == "in_progress"
    assert len(active_data["questions"]) == 5
    for q in active_data["questions"]:
        assert "correct_answer" not in q

    # 4. Attempting to get graded result before submission returns 400
    result_pre_resp = client.get(
        f"/api/v1/mock/{session_id}",
        headers=learner_auth_headers,
    )
    assert result_pre_resp.status_code == 400
    assert result_pre_resp.json()["error"]["code"] == "INVALID_STATUS"


def test_mock_test_submission_and_server_side_grading(
    client: TestClient, learner_auth_headers: dict, db_session: Session
):
    """Verify authoritative scoring on submission and update of session records."""
    start_resp = client.post(
        "/api/v1/mock/start",
        json={"class_level": 10, "language": "bilingual"},
        headers=learner_auth_headers,
    )
    mock_data = start_resp.json()
    session_id = mock_data["session_id"]
    questions = mock_data["questions"]

    # Submit 1 correct, 1 incorrect, 3 unanswered
    answers = [
        {"question_id": questions[0]["id"], "selected_option": "A", "time_taken_seconds": 25},
        {"question_id": questions[1]["id"], "selected_option": "B", "time_taken_seconds": 35},
    ]

    submit_resp = client.post(
        f"/api/v1/mock/{session_id}/submit",
        json={"answers": answers},
        headers=learner_auth_headers,
    )
    assert submit_resp.status_code == 200
    result = submit_resp.json()
    assert result["session_id"] == session_id
    assert result["correct_count"] == 1
    assert result["incorrect_count"] == 1
    assert result["unanswered_count"] == 3
    # Correct = 4.0, Incorrect = -1.0 => Total = 3.0
    assert result["total_score"] == 3.0

    # Verify session record in DB is updated to 'submitted'
    db_session.expire_all()
    session_rec = db_session.query(MockTestSession).filter_by(id=session_id).first()
    assert session_rec.status == "submitted"
    assert session_rec.score == 3.0
    assert session_rec.correct_count == 1
    assert session_rec.incorrect_count == 1
    assert session_rec.unanswered_count == 3
    assert session_rec.submitted_at is not None

    # Verify calling /{session_id}/active now fails because session is submitted
    active_after = client.get(
        f"/api/v1/mock/{session_id}/active",
        headers=learner_auth_headers,
    )
    assert active_after.status_code == 400
    assert active_after.json()["error"]["code"] == "INVALID_STATUS"


def test_mock_submission_rejects_unassigned_question(
    client: TestClient, learner_auth_headers: dict
):
    """Verify that submitting an answer for a question not assigned in the session is rejected."""
    start_resp = client.post(
        "/api/v1/mock/start",
        json={"class_level": 10, "language": "bilingual"},
        headers=learner_auth_headers,
    )
    session_id = start_resp.json()["session_id"]

    submit_resp = client.post(
        f"/api/v1/mock/{session_id}/submit",
        json={"answers": [{"question_id": "non_existent_or_unassigned_q", "selected_option": "A"}]},
        headers=learner_auth_headers,
    )
    assert submit_resp.status_code == 400
    assert submit_resp.json()["error"]["code"] == "INVALID_QUESTION"


def test_mock_submission_safe_retry_idempotency(
    client: TestClient, learner_auth_headers: dict
):
    """Verify that repeated submit requests on the same mock session are safe and idempotent."""
    start_resp = client.post(
        "/api/v1/mock/start",
        json={"class_level": 10, "language": "bilingual"},
        headers=learner_auth_headers,
    )
    mock_data = start_resp.json()
    session_id = mock_data["session_id"]
    questions = mock_data["questions"]

    payload = {
        "answers": [
            {"question_id": questions[0]["id"], "selected_option": "A"},
        ]
    }

    # First submission
    sub1 = client.post(f"/api/v1/mock/{session_id}/submit", json=payload, headers=learner_auth_headers)
    assert sub1.status_code == 200
    res1 = sub1.json()

    # Second submission (network retry)
    sub2 = client.post(f"/api/v1/mock/{session_id}/submit", json=payload, headers=learner_auth_headers)
    assert sub2.status_code == 200
    res2 = sub2.json()

    assert res1["session_id"] == res2["session_id"]
    assert res1["total_score"] == res2["total_score"]
    assert res1["correct_count"] == res2["correct_count"]
    assert res1["results"] == res2["results"]


def test_mock_session_history_and_cross_user_isolation(
    client: TestClient, learner_auth_headers: dict, other_learner_auth_headers: dict
):
    """Verify listing mock sessions, pagination, and strict ownership boundary."""
    # Learner 1 starts two mock sessions
    s1 = client.post("/api/v1/mock/start", json={"class_level": 10}, headers=learner_auth_headers).json()
    s2 = client.post("/api/v1/mock/start", json={"class_level": 10}, headers=learner_auth_headers).json()

    # Learner 1 lists sessions
    list_resp = client.get("/api/v1/mock/sessions", headers=learner_auth_headers)
    assert list_resp.status_code == 200
    sessions = list_resp.json()
    s_ids = [s["session_id"] for s in sessions]
    assert s1["session_id"] in s_ids
    assert s2["session_id"] in s_ids

    # Learner 2 lists sessions - must NOT see Learner 1's sessions
    other_list_resp = client.get("/api/v1/mock/sessions", headers=other_learner_auth_headers)
    assert other_list_resp.status_code == 200
    other_sessions = other_list_resp.json()
    other_s_ids = [s["session_id"] for s in other_sessions]
    assert s1["session_id"] not in other_s_ids
    assert s2["session_id"] not in other_s_ids

    # Learner 2 cannot access Learner 1's active session
    cross_active = client.get(
        f"/api/v1/mock/{s1['session_id']}/active",
        headers=other_learner_auth_headers,
    )
    assert cross_active.status_code == 403


def test_single_attempt_lifecycle_filters_and_safe_retries(
    client: TestClient, learner_auth_headers: dict
):
    """Verify single question attempt creation, history filtering, and safe retry idempotency."""
    # 1. Start attempt
    start_resp = client.post(
        "/api/v1/attempts",
        json={"question_id": "q_c10_rxn_01"},
        headers=learner_auth_headers,
    )
    assert start_resp.status_code == 201
    att = start_resp.json()
    attempt_id = att["id"]
    assert att["lifecycle_state"] == "in_progress"

    # 2. Filter attempts by in_progress
    in_prog_resp = client.get(
        "/api/v1/attempts?lifecycle_state=in_progress",
        headers=learner_auth_headers,
    )
    assert in_prog_resp.status_code == 200
    in_prog_ids = [a["id"] for a in in_prog_resp.json()]
    assert attempt_id in in_prog_ids

    # 3. Submit attempt
    sub_resp = client.post(
        f"/api/v1/attempts/{attempt_id}/submit",
        json={"submitted_response": {"selected_option": "A"}, "time_taken_seconds": 15},
        headers=learner_auth_headers,
    )
    assert sub_resp.status_code == 200
    graded = sub_resp.json()
    assert graded["lifecycle_state"] == "submitted"
    assert graded["is_correct"] is True
    assert graded["marks_obtained"] == 4.0

    # 4. Safe retry with identical payload returns attempt idempotently
    retry_resp = client.post(
        f"/api/v1/attempts/{attempt_id}/submit",
        json={"submitted_response": {"selected_option": "A"}, "time_taken_seconds": 15},
        headers=learner_auth_headers,
    )
    assert retry_resp.status_code == 200
    assert retry_resp.json()["id"] == attempt_id

    # 5. Resubmitting with a different response fails with 400 ATTEMPT_ALREADY_SUBMITTED
    tamper_resp = client.post(
        f"/api/v1/attempts/{attempt_id}/submit",
        json={"submitted_response": {"selected_option": "B"}},
        headers=learner_auth_headers,
    )
    assert tamper_resp.status_code == 400
    assert tamper_resp.json()["error"]["code"] == "ATTEMPT_ALREADY_SUBMITTED"

    # 6. Filter attempts by submitted & is_correct=true
    sub_filtered = client.get(
        "/api/v1/attempts?lifecycle_state=submitted&is_correct=true",
        headers=learner_auth_headers,
    )
    assert sub_filtered.status_code == 200
    filtered_ids = [a["id"] for a in sub_filtered.json()]
    assert attempt_id in filtered_ids


def test_recovery_evidence_persistence_and_authoritative_verification(
    client: TestClient, learner_auth_headers: dict, other_learner_auth_headers: dict, db_session: Session
):
    """Verify mark-recovery diagnosis run, report persistence, and follow-up attempt verification."""
    # 1. Create incorrect attempt to trigger diagnosis
    att_resp = client.post(
        "/api/v1/attempts",
        json={"question_id": "q_c10_rxn_01"},
        headers=learner_auth_headers,
    )
    att_id = att_resp.json()["id"]

    client.post(
        f"/api/v1/attempts/{att_id}/submit",
        json={"submitted_response": {"selected_option": "B"}},  # Incorrect (correct is A)
        headers=learner_auth_headers,
    )

    # 2. Run diagnosis pipeline
    diag_resp = client.post(
        f"/api/v1/diagnosis/run/{att_id}",
        headers=learner_auth_headers,
    )
    assert diag_resp.status_code == 200
    diag_data = diag_resp.json()
    report_id = diag_data["recovery_report_id"]
    assert report_id is not None
    assert diag_data["status"] == "COMPLETED"

    # 3. List learner's recovery reports
    list_reports_resp = client.get(
        "/api/v1/diagnosis/reports",
        headers=learner_auth_headers,
    )
    assert list_reports_resp.status_code == 200
    reports = list_reports_resp.json()
    report_ids = [r["report_id"] for r in reports]
    assert report_id in report_ids

    # 4. Create and authoritatively solve a follow-up attempt
    follow_up_resp = client.post(
        "/api/v1/attempts",
        json={"question_id": "q_c10_rxn_01"},
        headers=learner_auth_headers,
    )
    follow_up_id = follow_up_resp.json()["id"]

    client.post(
        f"/api/v1/attempts/{follow_up_id}/submit",
        json={"submitted_response": {"selected_option": "A"}},  # Correct
        headers=learner_auth_headers,
    )

    # 5. Verify recovery using authoritative follow_up_attempt_id
    verify_resp = client.post(
        f"/api/v1/diagnosis/reports/{report_id}/verify",
        json={"follow_up_attempt_id": follow_up_id},
        headers=learner_auth_headers,
    )
    assert verify_resp.status_code == 200
    verify_data = verify_resp.json()
    assert verify_data["is_verified"] is True
    assert verify_data["status"] == "RECOVERED"
    assert verify_data["verified_at"] is not None

    # 6. Idempotent retry of verification succeeds
    retry_verify = client.post(
        f"/api/v1/diagnosis/reports/{report_id}/verify",
        json={"follow_up_attempt_id": follow_up_id},
        headers=learner_auth_headers,
    )
    assert retry_verify.status_code == 200
    assert retry_verify.json()["is_verified"] is True

    # 7. Cross-user isolation: Other learner cannot verify or access Learner 1's report
    cross_verify = client.post(
        f"/api/v1/diagnosis/reports/{report_id}/verify",
        json={"is_mastery_correct": True},
        headers=other_learner_auth_headers,
    )
    assert cross_verify.status_code == 403
