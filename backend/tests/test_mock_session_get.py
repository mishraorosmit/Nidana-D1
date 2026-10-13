"""Tests for mini-mock session result retrieval and ownership protection."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.seed_demo_data import seed_demo_data


@pytest.fixture(autouse=True)
def seed_test_database(db_session: Session):
    """Seed demo questions before each test."""
    seed_demo_data(db_session)


def test_get_mini_mock_session_not_found(client: TestClient, learner_auth_headers: dict):
    """Test retrieving non-existent or unsubmitted mini-mock session returns 404."""
    response = client.get("/api/v1/mock/mock_nonexistent_session", headers=learner_auth_headers)
    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "RESOURCE_NOT_FOUND"


def test_submit_and_get_mini_mock_session(client: TestClient, learner_auth_headers: dict):
    """Test submitting a 5-question mini-mock and then retrieving the exact results via GET."""
    # 1. Start mini mock
    start_resp = client.post(
        "/api/v1/mock/start",
        headers=learner_auth_headers,
        json={"class_level": 10},
    )
    assert start_resp.status_code == 200
    mock_data = start_resp.json()
    session_id = mock_data["session_id"]
    questions = mock_data["questions"]
    assert len(questions) == 5

    # 2. Submit answers
    answers = [
        {"question_id": q["id"], "selected_option": "A", "time_taken_seconds": 25}
        for q in questions
    ]
    submit_resp = client.post(
        f"/api/v1/mock/{session_id}/submit",
        headers=learner_auth_headers,
        json={"answers": answers},
    )
    assert submit_resp.status_code == 200
    submit_data = submit_resp.json()

    # 3. Retrieve session via GET
    get_resp = client.get(f"/api/v1/mock/{session_id}", headers=learner_auth_headers)
    assert get_resp.status_code == 200
    get_data = get_resp.json()

    # Assert exact match between submit response and GET response
    assert get_data["session_id"] == session_id
    assert get_data["total_score"] == submit_data["total_score"]
    assert get_data["max_possible_score"] == submit_data["max_possible_score"]
    assert get_data["correct_count"] == submit_data["correct_count"]
    assert get_data["incorrect_count"] == submit_data["incorrect_count"]
    assert len(get_data["results"]) == 5


def test_get_mini_mock_session_ownership_enforcement(
    client: TestClient, learner_auth_headers: dict, other_learner_auth_headers: dict
):
    """Test that another user cannot view results of a learner's mini-mock session."""
    # 1. Learner starts and submits
    start_resp = client.post(
        "/api/v1/mock/start",
        headers=learner_auth_headers,
        json={"class_level": 10},
    )
    session_id = start_resp.json()["session_id"]
    questions = start_resp.json()["questions"]

    client.post(
        f"/api/v1/mock/{session_id}/submit",
        headers=learner_auth_headers,
        json={"answers": [{"question_id": questions[0]["id"], "selected_option": "A"}]},
    )

    # 2. Different learner attempts to retrieve this session
    foreign_resp = client.get(f"/api/v1/mock/{session_id}", headers=other_learner_auth_headers)
    assert foreign_resp.status_code == 403
    assert foreign_resp.json()["error"]["code"] == "OWNERSHIP_VIOLATION"
