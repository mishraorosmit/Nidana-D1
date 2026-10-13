"""Test configuration, fixtures, and in-memory test database."""

import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Generator

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure backend root is on Python sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set environment before loading application config
os.environ["APP_ENV"] = "development"
os.environ["SQLITE_DATABASE_URL"] = "sqlite:///:memory:"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["CHROMA_PERSIST_DIRECTORY"] = "./data/test_chroma"
os.environ["SUPABASE_JWT_SECRET"] = "test-secret-key-32-chars-long-test-only!!"
os.environ["SUPABASE_JWT_AUDIENCE"] = "authenticated"
os.environ["SUPABASE_JWT_ALGORITHM"] = "HS256"

from app.core.config import get_settings
from app.core.constants import UserRole
from app.db.base import Base
from app.db.session import get_db
from app.main import create_app

# In-memory SQLite engine for fast, isolated test execution
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all tables in memory once for the test session."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Provide a transactional database session rolled back after each test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Provide a TestClient with database session overridden."""
    app = create_app()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def make_test_jwt(
    user_id: str = "test-learner-1",
    email: str = "learner1@example.com",
    role: str = UserRole.LEARNER.value,
    expired: bool = False,
    invalid_secret: bool = False,
    aud: str = "authenticated",
) -> str:
    """Helper to synthesize valid or invalid Supabase JWTs for tests."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    exp = now - timedelta(hours=1) if expired else now + timedelta(hours=1)

    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "aud": aud,
        "exp": int(exp.timestamp()),
        "app_metadata": {"role": role, "provider": "email"},
        "user_metadata": {"display_name": f"Test User {user_id}"},
    }

    secret = "wrong-secret-signature-key-12345" if invalid_secret else settings.SUPABASE_JWT_SECRET
    return jwt.encode(payload, secret, algorithm="HS256")


@pytest.fixture
def learner_token() -> str:
    return make_test_jwt(user_id="learner-123", email="learner@test.com", role=UserRole.LEARNER.value)


@pytest.fixture
def other_learner_token() -> str:
    return make_test_jwt(user_id="learner-456", email="other@test.com", role=UserRole.LEARNER.value)


@pytest.fixture
def educator_token() -> str:
    return make_test_jwt(user_id="educator-001", email="teacher@test.com", role=UserRole.EDUCATOR.value)


@pytest.fixture
def admin_token() -> str:
    return make_test_jwt(user_id="admin-999", email="admin@test.com", role=UserRole.ADMIN.value)


@pytest.fixture
def learner_auth_headers(learner_token: str) -> dict:
    return {"Authorization": f"Bearer {learner_token}"}


@pytest.fixture
def admin_auth_headers(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def educator_auth_headers(educator_token: str) -> dict:
    return {"Authorization": f"Bearer {educator_token}"}


@pytest.fixture
def other_learner_auth_headers(other_learner_token: str) -> dict:
    return {"Authorization": f"Bearer {other_learner_token}"}

