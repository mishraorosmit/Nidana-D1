# NIDANA Backend State & Repository Audit

**Date**: 2026-10-13  
**Role**: Senior Backend Engineer  
**Repository Root**: `E:\PROJECTS\Nirmit-D1\Nidana-D1`  
**Active Branch**: `backend` (tracking `origin/backend`)  
**Execution Baseline**: 66 passed tests, 0 failed, 11 warnings in ~6.5s (`pytest -v`)

---

## 1. Executive Summary & Git Inspection

A final backend audit and verification was completed to prepare NIDANA for cross-team integration across the separate Frontend and RAG/Agentic-AI tracks.

- **Git Status & History**:
  - The branch `backend` is tracking `origin/backend`.
  - Upstream merge PR #5 from `main` (incorporating full frontend assets and React codebase) was fast-forwarded into `backend` cleanly without merge conflicts or regressions.
  - Backend working tree contains hardened migrations (0003, 0004), assessment lifecycle endpoints, user stats aggregation, complete integration contract tests, and documentation.
- **Operational Reality**:
  - The backend is operating as a **local-first, deterministic REST service** built on FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, and hardened SQLite with WAL mode.
  - Test suite passes completely (**66/66 tests green**) with 100% pass rate.
  - Clean migration testing verifies all 16 database tables build deterministically from scratch via `alembic upgrade head`.

---

## 2. Repository Directory Tree & Ownership Map

The repository is structured with clear ownership domains to eliminate coordination friction and avoid overwriting teammate files:

```text
Nidana-D1/
├── .gitignore                         [SHARED] Root gitignore (system, venv, data, prompt exclusion)
├── pytest.ini                         [BACKEND-OWNED] Root pytest test discovery configuration
├── README.md                          [SHARED] Top-level project overview
├── changelog_backend.md               [BACKEND-OWNED] Authoritative backend engineering changelog
├── Backend_guide.md                   [LEGACY/REFERENCE] Historical early architecture specification
├── Feature_list.md                    [LEGACY/REFERENCE] Early feature index
├── Guardrail.md                       [LEGACY/REFERENCE] Early guardrailing guidelines
├── Tech_stack.md                      [LEGACY/REFERENCE] Historical early tech stack notes
├── Userflow.md                        [LEGACY/REFERENCE] Product workflow sketches
├── Workflow.md                        [LEGACY/REFERENCE] Team operational workflow notes
│
├── docs/                              [SHARED / BACKEND-DOCUMENTED]
│   ├── api-contracts.md               [BACKEND-OWNED] Complete OpenAPI contracts, auth, errors & envelopes
│   ├── backend-state-audit.md         [BACKEND-OWNED] This repository state & boundary audit
│   ├── offline-sync.md                [BACKEND-OWNED] Offline content pack & batch sync contract
│   └── TECH_STACK.md                  [SHARED] Locked v2 technology stack definition
│
├── backend/                           [BACKEND-OWNED]
│   ├── alembic.ini                    [BACKEND] Migration environment configuration
│   ├── pyproject.toml                 [BACKEND] Package metadata & test settings
│   ├── requirements.txt               [BACKEND] Pinned backend runtime dependencies
│   ├── .env.example                   [BACKEND] Development environment variable template (includes 5173)
│   ├── .gitignore                     [BACKEND] Backend-specific gitignore
│   ├── README.md                      [BACKEND] Backend setup, runtime, and architecture guide
│   ├── alembic/                       [BACKEND]
│   │   ├── env.py                     [BACKEND] Migration runner & metadata reflection
│   │   ├── script.py.mako             [BACKEND] Migration template
│   │   └── versions/                  [BACKEND]
│   │       ├── 0001_initial_schema.py [BACKEND] Core tables (users, curriculum, attempts, tasks)
│   │       ├── 0002_diagnosis_and_sync_schema.py [BACKEND] Diagnostic runs & sync receipts
│   │       ├── 0003_add_user_class_level.py      [BACKEND] User class_level enum column
│   │       └── 0004_add_mock_test_sessions.py    [BACKEND] Mock test session lifecycle table
│   ├── app/                           [BACKEND]
│   │   ├── main.py                    [BACKEND] FastAPI application factory & middleware
│   │   ├── api/                       [BACKEND]
│   │   │   ├── deps.py                [BACKEND] Dependency injection (DB, auth, user extraction)
│   │   │   └── v1/
│   │   │       ├── router.py          [BACKEND] Master API router registering all 10 endpoint modules
│   │   │       └── endpoints/
│   │   │           ├── attempts.py    [BACKEND] POST /attempts, POST /attempts/{id}/submit, GET /attempts
│   │   │           ├── auth.py        [BACKEND] Supabase Auth token integration hook
│   │   │           ├── chapters.py    [BACKEND] GET /chapters with class_level filtering
│   │   │           ├── concepts.py    [BACKEND] GET /concepts with terminology mappings
│   │   │           ├── diagnosis.py   [BACKEND / AI-ADAPTER] POST /diagnosis/run/{attempt_id}, GET reports
│   │   │           ├── health.py      [BACKEND] GET /health (sanitized, zero secrets)
│   │   │           ├── mock_exam.py   [BACKEND] POST /mock/start, POST /mock/{id}/submit, GET /mock/sessions
│   │   │           ├── questions.py   [BACKEND] GET /questions (answer keys concealed)
│   │   │           ├── rag.py         [BACKEND / AI-ADAPTER] POST /rag/query, POST /rag/reindex
│   │   │           ├── study_plans.py [BACKEND] GET /study-plans, PATCH tasks
│   │   │           ├── subjects.py    [BACKEND] GET /subjects
│   │   │           ├── sync.py        [BACKEND] GET /sync/packs, POST /sync/batch (idempotent ledger)
│   │   │           └── users.py       [BACKEND] GET/PATCH /me, GET /me/stats
│   │   ├── core/                      [BACKEND]
│   │   │   ├── config.py              [BACKEND] Typed Pydantic settings with CORS 5173 support
│   │   │   ├── constants.py           [BACKEND] Canonical enums (ClassLevel, ExamTarget, TaskStatus, etc.)
│   │   │   ├── errors.py              [BACKEND] Unified error envelope & AppException handlers
│   │   │   ├── logging.py             [BACKEND] Structured logger with secret & credential scrubbing
│   │   │   └── security.py            [BACKEND] JWT verification & strict ownership enforcement
│   │   ├── db/                        [BACKEND]
│   │   │   ├── base.py                [BACKEND] DeclarativeBase & TimestampMixin
│   │   │   ├── session.py             [BACKEND] SQLite engine with WAL PRAGMAs & thread-local sessions
│   │   │   └── seed_demo_data.py      [BACKEND] 25 Odia/English questions & taxonomy seeder
│   │   ├── models/                    [BACKEND]
│   │   │   ├── attempt.py             [BACKEND] Attempt relational model
│   │   │   ├── chapter.py             [BACKEND] Chapter model (class_level 9, 10, 12)
│   │   │   ├── concept.py             [BACKEND] Concept taxonomy model
│   │   │   ├── content_chunk.py       [BACKEND] Content chunk model with provenance hash
│   │   │   ├── diagnostic.py          [BACKEND] DiagnosticRun, DiagnosticProbe, RecoveryReport
│   │   │   ├── mock_session.py        [BACKEND] MockTestSession persistence model
│   │   │   ├── question.py            [BACKEND] Question & QuestionVariant models
│   │   │   ├── study_plan.py          [BACKEND] StudyPlan & StudyPlanTask models
│   │   │   ├── subject.py             [BACKEND] Subject model
│   │   │   ├── sync_receipt.py        [BACKEND] SyncReceipt idempotent deduplication ledger
│   │   │   └── user.py                [BACKEND] User profile & role model
│   │   ├── rag/                       [AI-TEAMMATE SCOPE / BACKEND-ADAPTER]
│   │   │   ├── chroma_client.py       [AI-OWNED] Local ChromaDB client adapter
│   │   │   ├── embedding.py           [AI-OWNED] Embedding generator adapter
│   │   │   └── provenance.py          [AI-OWNED] Content chunk hashing & citation verification
│   │   ├── repositories/              [BACKEND]
│   │   │   ├── attempt_repo.py        [BACKEND] Attempt queries & filtering
│   │   │   ├── base.py                [BACKEND] Base CRUD repository
│   │   │   ├── chapter_repo.py        [BACKEND] Chapter queries
│   │   │   ├── concept_repo.py        [BACKEND] Concept queries
│   │   │   ├── content_chunk_repo.py  [BACKEND] Content chunk queries
│   │   │   ├── question_repo.py       [BACKEND] Question selection & filtering
│   │   │   ├── study_plan_repo.py     [BACKEND] Study plan queries
│   │   │   ├── subject_repo.py        [BACKEND] Subject queries
│   │   │   └── user_repo.py           [BACKEND] User persistence
│   │   ├── schemas/                   [BACKEND]
│   │   │   ├── attempt.py             [BACKEND] AttemptCreate, AttemptSubmit, AttemptResponse
│   │   │   ├── chapter.py             [BACKEND] Chapter schemas
│   │   │   ├── common.py              [BACKEND] ErrorResponse, HealthResponse, Pagination
│   │   │   ├── concept.py             [BACKEND] Concept schemas
│   │   │   ├── content_chunk.py       [BACKEND] ContentChunk schemas
│   │   │   ├── diagnosis.py           [BACKEND] DiagnosticRunResponse, RecoveryReportResponse
│   │   │   ├── mock_test.py           [BACKEND] MockSessionStart, MockSessionSubmit, MockSessionResponse
│   │   │   ├── question.py            [BACKEND] QuestionPublic (concealed) vs QuestionInternal
│   │   │   ├── study_plan.py          [BACKEND] StudyPlanResponse, StudyPlanTaskUpdate
│   │   │   ├── subject.py             [BACKEND] Subject schemas
│   │   │   ├── sync.py                [BACKEND] SyncBatchRequest, SyncBatchResponse, ContentPack
│   │   │   └── user.py                [BACKEND] UserProfileResponse, UserProfileUpdate, UserStatsResponse
│   │   ├── services/                  [BACKEND]
│   │   │   ├── attempt_service.py     [BACKEND] Authoritative grading & attempt lifecycle
│   │   │   ├── content_service.py     [BACKEND] Curriculum catalog services
│   │   │   ├── mock_service.py        [BACKEND] 5-question mini-mock generation & grading
│   │   │   ├── question_service.py    [BACKEND] Question retrieval with answer key concealment
│   │   │   ├── study_plan_service.py  [BACKEND] Study plan lifecycle & task updates
│   │   │   ├── sync_service.py        [BACKEND] Content pack packaging & idempotent batch sync
│   │   │   └── user_service.py        [BACKEND] User profile & authoritative stats aggregation
│   │   └── why_engine/                [AI-TEAMMATE SCOPE / BACKEND-ADAPTER]
│   │       ├── gemini_adapter.py      [AI-OWNED] Gemini LLM client adapter (deterministic double)
│   │       ├── graph.py               [AI-OWNED] LangGraph StateGraph diagnosis workflow definition
│   │       └── service.py             [BACKEND / AI-ADAPTER] Service orchestrating diagnosis & reports
│   └── tests/                         [BACKEND-OWNED]
│       ├── conftest.py                [BACKEND] TestClient, SQLite DB session, & auth token fixtures
│       ├── test_assessment_lifecycle.py [BACKEND] Full assessment cycle, safe retry, diagnosis trigger
│       ├── test_attempts.py           [BACKEND] Authoritative scoring (+4/-1), resubmission block
│       ├── test_auth.py               [BACKEND] Supabase JWT validation & role permissions
│       ├── test_config.py             [BACKEND] Settings validation & CORS production guard
│       ├── test_errors.py             [BACKEND] Standardized error envelope tests
│       ├── test_health.py             [BACKEND] Health endpoint security
│       ├── test_integration_contracts.py [BACKEND] Cross-team API contracts, clean migrations, OpenAPI
│       ├── test_migrations.py         [BACKEND] Alembic upgrade head & schema validation
│       ├── test_mock_session_get.py   [BACKEND] Mini-mock session retrieval & ownership enforcement
│       ├── test_mock_test.py          [BACKEND] 5-question mini-mock generation & answer key concealment
│       ├── test_questions.py          [BACKEND] Question answer key concealment on active tests
│       ├── test_rag.py                [BACKEND / AI-ADAPTER] RAG health, reindex & query integration tests
│       ├── test_schemas.py            [BACKEND] Class level validation & Pydantic constraints
│       ├── test_security_hardening.py [BACKEND] 11 security hardening tests (auth, isolation, logs)
│       ├── test_sqlite_hardening.py   [BACKEND] SQLite foreign keys, transactions & WAL mode
│       ├── test_startup.py            [BACKEND] FastAPI startup & OpenAPI docs generation
│       ├── test_sync.py               [BACKEND] Content pack download & idempotent batch sync
│       ├── test_user_stats.py         [BACKEND] Profile class level updates & stats aggregation
│       └── test_why_engine.py         [BACKEND / AI-ADAPTER] WHY Engine diagnosis & mark recovery flow
│
├── frontend/                          [FRONTEND-OWNED]
│   ├── package.json                   [FRONTEND] React 19 + Vite 6 + TailwindCSS dependencies
│   ├── vite.config.ts                 [FRONTEND] Vite bundler config (dev server port 5173)
│   ├── index.html                     [FRONTEND] App entry HTML
│   ├── src/                           [FRONTEND]
│   │   ├── App.tsx                    [FRONTEND] Root routing and application screen shell
│   │   ├── components/                [FRONTEND] Reusable UI components
│   │   ├── screens/                   [FRONTEND] Application screens (MockTest, WhyEngine, etc.)
│   │   ├── services/storageService.ts [FRONTEND] Offline storage & sync queue (to wire to /sync/batch)
│   │   └── data/                      [FRONTEND] Client mock data & bilingual translation tables
│   └── public/                        [FRONTEND] Visual assets, icons, audio, and video
│
└── data/                              [IGNORED / RUNTIME-LOCAL]
    ├── nidana.db                      [IGNORED] Canonical SQLite development database
    └── chroma/                        [IGNORED] Local ChromaDB vector database index
```

---

## 3. Team Ownership Responsibility Matrix

| Domain | Owner | Scope & Repository Paths | Non-Negotiable Boundaries |
|---|---|---|---|
| **Core Backend** | **Senior Backend Engineer** | `backend/app/api/v1/endpoints/` (core CRUD, auth, attempts, mock, sync)<br>`backend/app/core/`<br>`backend/app/db/`<br>`backend/app/models/`<br>`backend/app/repositories/`<br>`backend/app/schemas/`<br>`backend/app/services/`<br>`backend/alembic/`<br>`backend/tests/`<br>`docs/api-contracts.md`, `docs/offline-sync.md`, `changelog_backend.md` | - Authoritative for grading, attempts, and SQLite persistence.<br>- Do not implement or modify frontend UI.<br>- Do not rewrite or modify RAG retrieval pipelines or LangGraph agent reasoning logic. |
| **Frontend UI & Client Offline Store** | **Frontend Teammate** | `frontend/` (entire React + Vite + Tailwind codebase)<br>`frontend/src/components/`, `frontend/src/screens/`<br>`frontend/src/services/storageService.ts`<br>`frontend/src/data/mockData.ts`, `frontend/src/data/translations.ts`<br>`frontend/public/`<br>`frontend/vite.config.ts`, `frontend/package.json` | - Owns student UI/UX, animations, audio, and language toggles.<br>- Owns client-side IndexedDB/Dexie cache and offline attempt queuing.<br>- Must NOT perform authoritative scoring or mark recovery decisions.<br>- Backend provides stable REST APIs with CORS 5173 support. |
| **RAG & Agentic AI** | **RAG / AI Teammate** | `backend/app/rag/chroma_client.py`<br>`backend/app/rag/embedding.py`<br>`backend/app/rag/provenance.py`<br>`backend/app/api/v1/endpoints/rag.py`<br>`backend/app/why_engine/` (`graph.py`, `gemini_adapter.py`, `service.py`)<br>`backend/app/api/v1/endpoints/diagnosis.py` | - Owns embedding generation, chunk indexing, ChromaDB tuning, and semantic retrieval.<br>- Owns LangGraph StateGraph, prompt engineering, and Gemini LLM integration.<br>- Backend provides relational models (`ContentChunk`, `DiagnosticRun`, `DiagnosticProbe`, `RecoveryReport`) and session lifecycle. Backend does NOT implement AI pipelines. |
| **Legacy / Historical** | **Shared / Reference Only** | Root legacy files: `Backend_guide.md`, `Tech_stack.md`, `Guardrail.md`, `Feature_list.md`, `Userflow.md`, `Workflow.md` | - Historical documents from early project inception referencing PostgreSQL/Supabase.<br>- Retained for audit and product context; not actively maintained by backend. |

---

## 4. Completed Work & Verified Invariants

### 4.1 Relational Database Layer & SQLite Hardening
- **Canonical Persistence**: Hardened SQLite database (`./data/nidana.db`) with WAL mode (`journal_mode = WAL`), foreign key enforcement (`PRAGMA foreign_keys = ON`), and 5000ms busy timeout.
- **Alembic Migrations**:
  - `0001_initial_schema.py`: Core tables (`users`, `subjects`, `chapters`, `concepts`, `questions`, `question_variants`, `content_chunks`, `attempts`, `study_plans`, `study_plan_tasks`).
  - `0002_diagnosis_and_sync_schema.py`: Diagnostics and sync tables (`diagnostic_runs`, `diagnostic_probes`, `recovery_reports`, `sync_receipts`).
  - `0003_add_user_class_level.py`: Added `class_level` column on `users` table.
  - `0004_add_mock_test_sessions.py`: Added `mock_test_sessions` table with user foreign key.
  - Verified clean database migration execution from zero tables to all 16 tables.

### 4.2 Security, Identity & Authoritative Assessment
- **JWT Verification & Role Enforcement**: Token decoding with expiration checks, signature verification, and role-based permissions (`student`, `educator`, `admin`).
- **Learner Record Ownership**: Enforced across attempts, mock test sessions, diagnostic runs, recovery reports, and study plans. Cross-user access returns 403 `OWNERSHIP_VIOLATION`.
- **Answer Key Concealment**: Active test endpoints and public question banks serialize through `QuestionPublic`, ensuring `correct_answer`, `explanation_en`, `explanation_or`, and `distractor_metadata` are strictly hidden from students.
- **Authoritative Grading**: Server-side calculation (+4.0 for correct, -1.0 for incorrect, 0 for unattempted). Client-submitted `is_correct` or `marks_obtained` fields are rejected or ignored.
- **Attempt Idempotency**: Once submitted, attempts and mock test sessions cannot be resubmitted or tampered with. Repeated submissions return the original graded results idempotently.
- **Credential & Secret Redaction**: Structured JSON logging scrubs Bearer tokens, passwords, and sensitive keys.

### 4.3 5-Question Mini-Mock Assessment Engine
- `POST /api/v1/mock/start`: Generates an active 5-question assessment with answer keys concealed.
- `POST /api/v1/mock/{session_id}/submit`: Authoritatively grades the assessment, persists session and individual attempts, and automatically triggers WHY Engine diagnosis eligibility for incorrect questions.
- `GET /api/v1/mock/sessions`: Lists student's assessment attempt history.
- `GET /api/v1/mock/{session_id}`: Retrieves completed assessment breakdown with ownership enforcement.
- `GET /api/v1/mock/{session_id}/active`: Resumes in-progress session with questions intact.

### 4.4 Diagnostic WHY Engine & Mark Recovery Evidence
- `POST /api/v1/diagnosis/run/{attempt_id}`: Triggers diagnostic run on an incorrect attempt, logging hypothesis, selected probes, and mark recovery eligibility.
- `GET /api/v1/diagnosis/reports`: Lists recovery reports for the authenticated student.
- `GET /api/v1/diagnosis/reports/{report_id}`: Retrieves detailed recovery report and targeted repair.
- `POST /api/v1/diagnosis/reports/{report_id}/verify`: Educator/admin verification endpoint to authoritatively mark recovered marks.

### 4.5 Offline Content Packs & Batch Event Synchronization
- `GET /api/v1/sync/packs`: Lists downloadable syllabus content packs with checksum hashes.
- `GET /api/v1/sync/packs/{pack_id}`: Delivers complete bilingual package for offline storage with answer keys concealed.
- `POST /api/v1/sync/batch`: Idempotently processes offline attempt events using `SyncReceipt` deduplication ledger to prevent double-counting.

### 4.6 Seed Data Pipeline
- `backend/app/db/seed_demo_data.py`:
  - Seeds 25 bilingual (Odia/English) high-quality questions across Classes 9, 10, and 12.
  - Seeds approved taxonomy (Science, Mathematics, Physics) and content chunks with SHA-256 provenance hashes.
  - Includes a direct CLI entrypoint (`python -m app.db.seed_demo_data`).

---

## 5. Identified and Resolved Items

| Item | Status | Resolution Details |
|---|---|---|
| **CORS Origin Configuration** | **Resolved** | Added `http://localhost:5173` and `http://127.0.0.1:5173` to `CORS_ORIGINS` default list in `backend/app/core/config.py` and `backend/.env.example` so the Vite frontend communicates without CORS errors. |
| **Root .gitignore Documentation Tracking** | **Resolved** | Confirmed `docs/` is tracked in Git; prompt instructions (`ANTIGRAVITY_BACKEND_PROMPTS*.md`) are properly excluded. |
| **Pytest Root Discovery** | **Resolved** | Added root `pytest.ini` with `norecursedirs = frontend node_modules .venv .git data`, enabling instant execution from root. |
| **Pydantic Enum Alignments** | **Resolved** | Aligned `StudyPlan.target_exam` and `StudyPlanTask.status` with canonical lowercase enum values (`ExamTarget.CHSE_CLASS_12.value`, `TaskStatus.PENDING.value`). |
| **Mock Session Schema & Retrieval** | **Resolved** | Added `MockTestSession` model, Alembic migration 0004, `MockSessionResponse` schema, and session retrieval endpoints. |
| **Authoritative User Stats** | **Resolved** | Implemented `GET /api/v1/me/stats` aggregating attempts, accuracy, marks obtained, recoverable marks, and recovered marks directly from the relational database. |

---

## 6. Teammate Handoff & Next Steps

### 6.1 Frontend Teammate Integration
1. **API Contracts Reference**: Consult [docs/api-contracts.md](file:///E:/PROJECTS/Nirmit-D1/Nidana-D1/docs/api-contracts.md) for all endpoints, headers, request bodies, response models, and error codes.
2. **Interactive OpenAPI Specs**: Run `uvicorn app.main:app --reload` inside `backend/` and open `http://127.0.0.1:8000/docs` or `http://127.0.0.1:8000/openapi.json`.
3. **Assessment Integration**: Wire `frontend/src/screens/MockTestScreen.tsx` to `POST /api/v1/mock/start` and `POST /api/v1/mock/{session_id}/submit`.
4. **Offline Synchronization**: Wire `frontend/src/services/storageService.ts` to `POST /api/v1/sync/batch` using event payload specification in [docs/offline-sync.md](file:///E:/PROJECTS/Nirmit-D1/Nidana-D1/docs/offline-sync.md).
5. **Dashboard & Stats**: Wire `frontend/src/screens/HomeScreen.tsx` and `ProfileOfflineScreen.tsx` to `GET /api/v1/me` and `GET /api/v1/me/stats`.

### 6.2 RAG / Agentic AI Teammate Integration
1. **ChromaDB Client**: Implement embeddings and query pipeline in `backend/app/rag/chroma_client.py` and `backend/app/rag/embedding.py`. Use `ContentChunk` records as the source of truth.
2. **LangGraph StateGraph**: Implement agentic diagnostic probes and misconception detection in `backend/app/why_engine/graph.py` and `backend/app/why_engine/gemini_adapter.py`.
3. **Diagnostic Service Bridge**: The backend endpoint `POST /api/v1/diagnosis/run/{attempt_id}` already coordinates with `WhyEngineService.run_diagnosis()`. When the AI teammate's model is ready, update `backend/app/why_engine/graph.py` and set `GEMINI_API_KEY`.
4. **Curriculum Reindex**: Trigger reindexing via `POST /api/v1/rag/reindex` (admin-authenticated).
