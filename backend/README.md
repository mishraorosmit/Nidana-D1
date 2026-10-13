# NIDANA Backend Service

NIDANA is an offline-first, Odia/English Mark-Loss Autopsy Learning Companion for Class 12 competitive exam preparation.

This backend service is authoritative for learner identity, permissions, question correctness, marks, persisted records, and sync acceptance. The frontend is never trusted to calculate authoritative scores or grant recovery status.

---

## 1. Directory Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── deps.py                    # Dependency injection (DB, auth, services)
│   │   └── v1/
│   │       ├── router.py              # Master v1 API router
│   │       └── endpoints/
│   │           ├── health.py          # GET /api/v1/health (safe, no secrets)
│   │           ├── users.py           # GET/PATCH /api/v1/me, GET /api/v1/me/stats
│   │           ├── subjects.py        # /api/v1/subjects
│   │           ├── chapters.py        # /api/v1/chapters (class level: 9, 10, 12)
│   │           ├── concepts.py        # /api/v1/concepts (terminology mappings)
│   │           ├── questions.py       # /api/v1/questions (answer keys concealed)
│   │           ├── attempts.py        # /api/v1/attempts (authoritative grading)
│   │           ├── mock_exam.py       # /api/v1/mock (5-question mini-mock sessions)
│   │           ├── diagnosis.py       # /api/v1/diagnosis (WHY Engine diagnosis & recovery)
│   │           ├── study_plans.py     # /api/v1/study-plans (interventions)
│   │           ├── sync.py            # /api/v1/sync (offline packs & batch sync)
│   │           └── rag.py             # /api/v1/rag (curriculum retrieval & reindex adapter)
│   ├── core/
│   │   ├── config.py                  # Pydantic-settings typed configuration
│   │   ├── constants.py               # Enums (ClassLevel, UserRole, Language, etc.)
│   │   ├── errors.py                  # Standardized error codes & exception handlers
│   │   ├── logging.py                 # Structured JSON logs with credential redaction
│   │   └── security.py                # JWT token verification & ownership enforcement
│   ├── db/
│   │   ├── base.py                    # DeclarativeBase & TimestampMixin
│   │   ├── session.py                 # SQLite WAL engine & SessionLocal lifecycle
│   │   └── seed_demo_data.py          # 25 bilingual questions & curriculum seeder
│   ├── models/                        # SQLAlchemy domain models (16 tables)
│   ├── schemas/                       # Pydantic v2 request & response contracts
│   ├── repositories/                  # Data access layer
│   ├── services/                      # Business rules & grading logic
│   ├── rag/                           # ChromaDB retrieval adapter (AI teammate integration)
│   └── why_engine/                    # LangGraph diagnostic adapter & fallback doubles
├── alembic/                           # Database migration scripts
│   ├── env.py
│   └── versions/                      # 0001 through 0004 migrations
├── tests/                             # Comprehensive test suite (66 tests)
├── alembic.ini                        # Alembic migration configuration
├── pyproject.toml                     # Python package definitions
├── requirements.txt                   # Pinned runtime dependencies
├── .env.example                       # Safe environment variable template
├── .gitignore
└── README.md
```

---

## 2. Setup and Installation

### Prerequisites
- Python 3.11+
- [uv](https://github.com/astral-sh/uv) (recommended) or standard `python -m venv`

### Quick Start with `uv`

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
uv venv .venv

# 3. Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# 4. Install dependencies
uv pip install -r requirements.txt
```

### Environment Configuration

Copy the example template to `.env`:

```bash
cp .env.example .env
```

Key environment variables:
- `APP_ENV`: `development` | `staging` | `production`
- `DATABASE_URL`: SQLAlchemy connection string (`postgresql+psycopg2://...` or `sqlite:///./nidana_dev.db`).
- `CORS_ORIGINS`: Comma-separated allowed frontend origins (e.g. `http://localhost:3000`). Wildcards (`*`) are rejected in production.
- `SUPABASE_JWT_SECRET`: Secret key used to verify Supabase Auth tokens server-side.

---

## 3. Database Migrations

Alembic manages all schema changes. Production never relies on `create_all()`.

```bash
# Apply migrations to head
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## 4. Running the Application

Start the development server with hot reload:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Interactive OpenAPI docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Alternative ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- Health check: `GET http://127.0.0.1:8000/api/v1/health`

---

## 5. Running Tests

```bash
pytest -v
```

All 66 test cases cover:
- FastAPI app startup and OpenAPI schema generation.
- Health endpoint response safety (no secrets/internals).
- Typed configuration validation (production CORS/secret guards).
- Centralized machine-readable error codes.
- Domain schema validation (enforcing Class 9, 10, 12).
- Supabase Auth JWT verification (expired, invalid, valid).
- Role-based authorization boundaries.
- Learner ownership enforcement.
- Question answer key concealment on active-test endpoints.
- Server-side authoritative grading and score computation.
- Alembic database migration execution and table reflection.

---

## 6. Core Security & Architectural Invariants

1. **Answer Keys Concealed:** Active test endpoints (`GET /api/v1/questions`) return `QuestionPublic` objects which strictly omit `correct_answer`, `explanation`, and `distractor_metadata`.
2. **Authoritative Grading:** Client submissions (`POST /api/v1/attempts/{id}/submit`) never accept client-supplied `is_correct` or `marks_obtained`. The server deterministically grades against trusted question records.
3. **Learner Ownership:** Endpoints dealing with attempts and study plans enforce caller ownership boundaries (`enforce_ownership()`), rejecting unauthorized access with 403 `OWNERSHIP_VIOLATION`.
4. **Credential Redaction:** The structured logger automatically scrubs Bearer tokens, passwords, secrets, and API keys.
