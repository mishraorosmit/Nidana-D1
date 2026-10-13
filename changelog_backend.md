# NIDANA Backend Changelog

All backend architectural changes, migrations, API contracts, environment updates, and test results are tracked here.

---

## [Final Backend Handoff: Codebase Consolidation, Directory Tree Audit, Clean Up, & Cross-Team Readiness] - 2026-10-13

### 1. Scope & Implementation Details
- **Upstream Sync & Branch Alignment:**
  - Fetched and cleanly fast-forwarded local `backend` branch with `origin/backend` (which merged upstream PR #5 from `main` containing frontend codebase and visual assets).
  - Verified no conflicts or overwritten teammate code.
- **Codebase Cleanliness & Repository Hygiene Audit:**
  - Audited all tracked and untracked files across backend, root, and shared folders.
  - Confirmed local database files (`backend/data/`, `data/`) are properly ignored by `.gitignore` and kept out of version control.
  - Confirmed prompt instructions (`ANTIGRAVITY_BACKEND_PROMPTS*.md`) are properly excluded by `.gitignore`.
  - Audited dependencies in `pyproject.toml` and `requirements.txt`: locked to necessary stack (`fastapi`, `uvicorn`, `pydantic`, `sqlalchemy`, `alembic`, `pyjwt`, `cryptography`, `httpx`, `chromadb`, `langgraph`).
  - Added frontend dev port 5173 (`http://localhost:5173,http://127.0.0.1:5173`) to `backend/.env.example` default `CORS_ORIGINS`.
  - Updated `backend/README.md` with accurate directory structure, all 10 endpoint modules, Alembic migrations 0001-0004, and 66-test verification.
- **Documentation & State Audit Update (`docs/backend-state-audit.md`):**
  - Updated with final directory tree explicitly marking `[BACKEND-OWNED]`, `[FRONTEND-OWNED]`, `[AI/RAG-OWNED]`, `[SHARED/DOCS]`, and `[IGNORED/LOCAL]`.
  - Updated executive summary, verified invariants, and concrete step-by-step handoff integration points for frontend and AI teammates.
- **Root Test Discovery Configuration (`pytest.ini`):**
  - Added root `pytest.ini` configuring `norecursedirs = frontend node_modules .venv .git data`, enabling instant test runs from repository root without node_modules scanning overhead.

### 2. Files Added, Modified & Retained
- **Modified (Backend Core & Docs):**
  - `backend/.env.example` — Added port 5173 to CORS_ORIGINS template.
  - `backend/README.md` — Updated directory layout, migrations, and test metrics.
  - `docs/backend-state-audit.md` — Updated with complete directory tree, ownership map, and handoff instructions.
  - `changelog_backend.md` — Appended final handoff log.
- **Retained (Backend Core Work From Session):**
  - `backend/alembic/versions/0003_add_user_class_level.py` — Migration adding `class_level` to `users`.
  - `backend/alembic/versions/0004_add_mock_test_sessions.py` — Migration adding `mock_test_sessions` table.
  - `backend/app/models/mock_session.py` — `MockTestSession` model.
  - `backend/app/schemas/diagnosis.py` — Typed diagnosis request and response schemas.
  - `backend/tests/test_assessment_lifecycle.py` — Assessment lifecycle & safe retry integration tests.
  - `backend/tests/test_integration_contracts.py` — Cross-team contract, clean migration & OpenAPI tests.
  - `backend/tests/test_mock_session_get.py` — Mini-mock session retrieval & ownership enforcement tests.
  - `backend/tests/test_security_hardening.py` — 11 security hardening tests.
  - `backend/tests/test_user_stats.py` — User stats and profile update tests.
  - `pytest.ini` — Root-level test discovery configuration.

### 3. Tests Executed & Actual Results
- Command: `backend\.venv\Scripts\pytest.exe -v`
- Execution Environment: Python 3.14.3, Windows powershell, SQLite in-memory / temp files.
- Result: **66 passed, 0 failed, 11 warnings in 6.58s** (100% pass rate).
- Test Breakdown:
  - `tests/test_assessment_lifecycle.py`: 8 passed
  - `tests/test_attempts.py`: 4 passed
  - `tests/test_auth.py`: 5 passed
  - `tests/test_config.py`: 4 passed
  - `tests/test_errors.py`: 3 passed
  - `tests/test_health.py`: 1 passed
  - `tests/test_integration_contracts.py`: 7 passed
  - `tests/test_migrations.py`: 1 passed
  - `tests/test_mock_session_get.py`: 3 passed
  - `tests/test_mock_test.py`: 2 passed
  - `tests/test_questions.py`: 1 passed
  - `tests/test_rag.py`: 2 passed
  - `tests/test_schemas.py`: 2 passed
  - `tests/test_security_hardening.py`: 11 passed
  - `tests/test_sqlite_hardening.py`: 3 passed
  - `tests/test_startup.py`: 1 passed
  - `tests/test_sync.py`: 2 passed
  - `tests/test_user_stats.py`: 4 passed
  - `tests/test_why_engine.py`: 2 passed
- Note on Linters/Type Checkers: `ruff` and `mypy` are not installed or configured in the virtual environment. Full runtime type checking and contract validation were verified via Pydantic v2 schemas and pytest.

### 4. Remaining Integration Dependencies (Teammate Responsibilities)
- **Frontend Teammate**:
  - Connect React components to backend APIs:
    - `MockTestScreen.tsx` -> `POST /api/v1/mock/start` and `POST /api/v1/mock/{session_id}/submit`.
    - `HomeScreen.tsx` & `ProfileOfflineScreen.tsx` -> `GET /api/v1/me` and `GET /api/v1/me/stats`.
    - `storageService.ts` -> `POST /api/v1/sync/batch` (idempotent offline sync ledger).
  - Use contracts in `docs/api-contracts.md` and OpenAPI docs at `http://127.0.0.1:8000/docs`.
- **RAG / AI Teammate**:
  - Replace ChromaDB test adapter in `backend/app/rag/chroma_client.py` and `embedding.py` with live vector store and embeddings.
  - Implement LangGraph diagnosis nodes in `backend/app/why_engine/graph.py` and configure `GEMINI_API_KEY` in `.env`.
  - Relational persistence, session lifecycle, and fallback doubles remain fully operational.

---

## [Frontend & AI Teammate Integration Preparation: API Contracts, OpenAPI Schemas, Clean Migrations & Explicit Boundaries] - 2026-10-13

### 1. Scope & Implementation Details
- **API Documentation & Contract Consolidation (`docs/api-contracts.md`):**
  - Consolidated and expanded all 10 API surface sections covering Authentication, Mini-Mocks, ChromaDB/RAG, WHY Engine, Learner Profile & Stats, Single Question Attempts, Curriculum Taxonomy & Question Bank Authoring, Remediation Study Plans, Offline Content Packs & Event Sync, and AI Teammate Explicit Boundaries & Gaps.
  - Documented exact HTTP methods, paths, request/response models, ownership rules, role requirements, query filters, idempotency mechanisms, and uniform machine-readable error formats.
- **OpenAPI Schema Accuracy & Response Typing:**
  - Created `backend/app/schemas/diagnosis.py` defining `DiagnosticProbeSummary`, `DiagnosticRunResponse`, `RecoveryReportResponse`, `RecoveryVerifyRequest`, and `RecoveryVerifyResponse`.
  - Replaced unstructured `Dict[str, Any]` returns in `backend/app/api/v1/endpoints/diagnosis.py` with typed Pydantic models.
  - Exported diagnosis schemas in `backend/app/schemas/__init__.py`.
  - Verified FastAPI OpenAPI generation at `/openapi.json` with OpenAPI 3.1.0 schema compliance and `HTTPBearer` security scheme definition.
- **Canonical Schema Consistency in Diagnostics:**
  - Updated `WhyEngineService` to use canonical `ExamTarget.CHSE_CLASS_12.value` ("chse_class_12"), `TaskStatus.PENDING.value` ("pending"), and `TaskStatus.COMPLETED.value` ("completed") during automated study plan generation and recovery verification.
- **Clean Database Migration Verification:**
  - Ran migration `alembic upgrade head` from a completely empty SQLite database file in automated tests, validating all 16 tables, composite indexes, and foreign keys.
- **AI Teammate Integration Boundary & Clear Gaps:**
  - Defined explicit interface adapters for ChromaDB (`POST /api/v1/rag/query`, `POST /api/v1/rag/reindex`, `app/rag/chroma_client.py`) and LangGraph WHY Engine (`POST /api/v1/diagnosis/run/{attempt_id}`, `app/why_engine/graph.py`, `GeminiAdapter`).
  - Marked unimplemented features clearly: Real-time Odia vocal speech-to-text autopsy, district-level multi-tenant dashboards, and peer-to-peer mesh sync are documented as deferred.
  - Preserved test doubles and deterministic heuristic fallbacks so the backend and tests remain 100% functional without external LLM keys or network dependencies.

### 2. Files Added & Modified
- `backend/app/schemas/diagnosis.py` — Created typed Pydantic request and response schemas for diagnosis runs, probes, and mark recovery reports.
- `backend/app/schemas/__init__.py` — Exported diagnosis schemas in the schemas package.
- `backend/app/api/v1/endpoints/diagnosis.py` — Added `response_model` specifications across all diagnosis routes.
- `backend/app/why_engine/service.py` — Standardized study plan target exam and task status on canonical enum values.
- `docs/api-contracts.md` — Comprehensive documentation of all 10 API surfaces, OpenAPI definitions, auth requirements, error envelopes, and integration boundaries.
- `backend/tests/test_integration_contracts.py` — Created 7 comprehensive integration tests covering clean migrations, OpenAPI schema validation, and end-to-end endpoint contracts.
- `changelog_backend.md` — Updated with integration preparation details, tests, dependencies, and next steps.

### 3. Tests Executed & Actual Results
- Integration test suite: `backend\.venv\Scripts\pytest.exe -v backend/tests/test_integration_contracts.py` (7 passed in 1.45s).
- Full backend test suite: `backend\.venv\Scripts\pytest.exe -v`
- Result: **66 passed, 0 failed, 11 warnings in 4.51s** (100% test pass rate).
- Key integration contract verifications:
  - `test_clean_environment_database_migration_setup`: Verified zero-to-head migration on clean SQLite file creating all 16 tables.
  - `test_openapi_schema_completeness_and_security`: Verified OpenAPI 3.x schema exports all 29 routes and `HTTPBearer` security definition.
  - `test_auth_and_profile_contract`: Verified `/me`, `/me/stats`, profile updates, and accuracy aggregation.
  - `test_study_plan_contract`: Verified diagnosis generation of remediation plan and task state transitions.
  - `test_offline_pack_and_sync_contract`: Verified manifest listing, bundle downloads with answer concealment, and batch sync deduplication via `client_event_id`.
  - `test_rag_ai_boundary_contract`: Verified health check and curriculum retrieval query gateway.
  - `test_error_envelope_consistency`: Verified uniform `{"error": {"code": "...", "message": "...", "details": null}}` structure across 401, 403, 404, and 422 errors.

### 4. Remaining Integration Dependencies (Teammate Responsibilities)
- **Frontend Teammate**:
  - Implement React / Vite screens mapped to the documented API contracts (`/api/v1/mock/start`, `/api/v1/mock/sessions`, `/api/v1/mock/{session_id}/active`, `/api/v1/mock/{session_id}/submit`, `/api/v1/me/stats`, `/api/v1/study-plans/me`).
  - Wire client-side Dexie / IndexedDB offline store with `/api/v1/sync/packs` bundles and `/api/v1/sync/batch` event queue.
- **RAG / Agentic AI Teammate**:
  - Fine-tune Odia-specialized embedding tokenizers and vector retrieval thresholds using the `/api/v1/rag/query` gateway.
  - Implement custom LangGraph prompt nodes, reasoning loops, and supply production Gemini API keys in `.env` (`GEMINI_API_KEY`).
  - Validate candidate probe generation and multimodal/speech-to-text features if prioritized for future milestones.

### 5. Next Steps
- Deliver the updated `docs/api-contracts.md` and OpenAPI specification (`/openapi.json`) to the frontend and AI teammates as stable, authoritative contracts for seamless parallel development.

---

## [Server-Side Assessment Data Lifecycle: Question Retrieval, Mock Session Persistence, Authoritative Grading, Safe Retries & Mark Recovery] - 2026-10-13

### 1. Scope & Implementation Details
- **Alembic Migration & Data Models:**
  - Created migration `0004_add_mock_test_sessions.py` adding `mock_test_sessions` table with composite indexes (`ix_mock_sessions_user_status`, `ix_mock_sessions_started_at`) and foreign keys to `users` and `subjects`.
  - Added SQLAlchemy model `MockTestSession` in `backend/app/models/mock_session.py` and linked it via relationship `mock_sessions` to `User`.
  - Updated `backend/tests/test_migrations.py` to assert `mock_test_sessions` existence during automated migration tests.
- **Question Retrieval & Language Support:**
  - Enhanced `QuestionRepository.list_by_filter`, `QuestionService.list_public_questions`, and `GET /api/v1/questions` to filter by `class_level`, `subject_id`, and `language` with pagination (`offset`, `limit`).
  - Preserved Odia-English bilingual content support without hardcoding language-specific assumptions into the schema.
  - Guaranteed answer key and explanation concealment on all returned questions via `QuestionPublic`.
- **Mock Assessment Lifecycle & Resumption:**
  - `POST /api/v1/mock/start`: Authoritatively persists an in-progress `MockTestSession` with 5 assigned question IDs, total obtainable marks, and started timestamp.
  - `GET /api/v1/mock/{session_id}/active`: Allows learners to safely resume an in-progress mini-mock assessment. Answer keys remain strictly omitted. Returns 400 `INVALID_STATUS` if the session was already submitted.
  - `GET /api/v1/mock/sessions`: Exposes paginated mock attempt history for the authenticated learner with optional `status` and `class_level` filters.
- **Server-Authoritative Grading & Duplicate Submission Protection:**
  - `POST /api/v1/mock/{session_id}/submit`:
    - Validates assigned question scope upfront against `session.question_ids`; rejects foreign or unassigned question IDs with 400 `INVALID_QUESTION`.
    - Computes server-authoritative score (+4 for correct, -negative marks for incorrect, 0 for unanswered), tracking `correct_count`, `incorrect_count`, and `unanswered_count`.
    - Records individual attempts atomically within a transactional rollback wrapper.
    - Idempotency & Safe Retries: If the session has already been submitted (`session.status == "submitted"`), returns the existing graded result immediately without duplicate writes or duplicate diagnostic triggers.
  - `GET /api/v1/mock/{session_id}`: Standardized to return graded outcome after submission, and 400 `INVALID_STATUS` if requested prior to submission.
- **Single Attempt Lifecycle & Safe Resubmissions:**
  - Enhanced `AttemptRepository.list_by_user` and `GET /api/v1/attempts` to support filtering by `lifecycle_state`, `question_id`, `is_correct`, `offset`, and `limit`.
  - In `AttemptService.submit_answer`:
    - Safe idempotent retries: If an attempt is already submitted and the client resubmits the identical response payload, the graded attempt is returned idempotently without error.
    - Tamper protection: If the client attempts to alter the submitted response on a submitted attempt, raises 400 `ATTEMPT_ALREADY_SUBMITTED`.
  - Fixed `evaluate_correctness` in `attempt_service.py` to transparently unpack dictionary answer keys (e.g., `{"selected_option": "A"}`) and string keys, ensuring server-side grading accurately matches answer keys across all question formats.
- **Mark-Recovery Evidence Persistence & Authoritative Verification:**
  - In `backend/app/api/v1/endpoints/diagnosis.py` and `backend/app/why_engine/service.py`:
    - Added `GET /api/v1/diagnosis/reports` to list historical mark recovery reports for the authenticated learner.
    - Enhanced `POST /api/v1/diagnosis/reports/{report_id}/verify` to support `follow_up_attempt_id` (verifying authoritative correctness of a linked follow-up attempt) and `submitted_response` alongside existing `is_mastery_correct`.
    - Idempotency & Retries: Retrying verification on an already verified report is safe and idempotent.
    - Cross-user isolation: Strictly prevents learners from viewing or verifying another learner's recovery report.
- **Clean Boundaries:**
  - Zero RAG algorithm, LangGraph workflow modifications, or frontend UI code invented. All changes strictly backend models, services, repositories, endpoints, migrations, and tests.

### 2. Files Added & Modified
- `backend/alembic/versions/0004_add_mock_test_sessions.py` — Migration creating `mock_test_sessions` table.
- `backend/app/models/mock_session.py` — SQLAlchemy 2.x domain model for `MockTestSession`.
- `backend/app/models/user.py` — Added `mock_sessions` relationship to `User`.
- `backend/app/models/__init__.py` — Exported `MockTestSession`.
- `backend/app/core/errors.py` — Added `INVALID_STATUS` and `INVALID_QUESTION` to `APIErrorCode`.
- `backend/app/repositories/question_repo.py` — Enhanced `list_by_filter` with chapter join, class, subject, language, and pagination.
- `backend/app/repositories/attempt_repo.py` — Added `lifecycle_state`, `question_id`, `is_correct`, `offset`, and `limit` to `list_by_user`.
- `backend/app/services/question_service.py` — Passed filtering arguments in `list_public_questions`.
- `backend/app/services/attempt_service.py` — Fixed `evaluate_correctness` for dictionary answer keys; implemented idempotent submit retries; added filtering to `list_user_attempts`.
- `backend/app/services/mock_service.py` — Added mock session persistence in `start_mini_mock`, upfront question validation, transactional submission with safe retries in `submit_mini_mock`, `get_active_mock_session`, and `list_user_mock_sessions`.
- `backend/app/why_engine/service.py` — Added `list_user_reports` and enhanced `verify_recovery` with follow-up attempt evaluation and safe retries.
- `backend/app/schemas/mock_test.py` — Added `MockSessionSummary` schema; added `status` and `started_at` to `MockSessionResponse`.
- `backend/app/api/v1/endpoints/questions.py` — Exposed `class_level`, `subject_id`, `language`, `offset`, `limit` on `GET /questions`.
- `backend/app/api/v1/endpoints/mock_exam.py` — Added `GET /mock/sessions` and `GET /mock/{session_id}/active`.
- `backend/app/api/v1/endpoints/attempts.py` — Added query filters to `GET /attempts`.
- `backend/app/api/v1/endpoints/diagnosis.py` — Added `GET /diagnosis/reports` and updated `RecoveryVerifyRequest` on `POST /diagnosis/reports/{report_id}/verify`.
- `backend/tests/test_migrations.py` — Added `"mock_test_sessions"` assertion to migration test.
- `backend/tests/test_assessment_lifecycle.py` — Created 8 comprehensive assessment lifecycle tests.

### 3. Tests Executed & Actual Results
- Command: `backend\.venv\Scripts\pytest.exe -v`
- Result: **59 passed, 0 failed, 8 warnings in 3.80s** (100% test pass rate).
- Key test scenarios verified:
  - `test_question_retrieval_filtering_and_language_support`: Verified class, subject, bilingual/Odia filtering, pagination offset, and complete answer key concealment.
  - `test_mock_test_session_lifecycle_and_active_resumption`: Verified `MockTestSession` DB persistence with status "in_progress", active mock resumption without answer keys, and rejection of pre-submission outcome queries.
  - `test_mock_test_submission_and_server_side_grading`: Verified server-authoritative scoring (+4 / -1 / 0), session status transition to "submitted", and diagnostic run creation.
  - `test_mock_submission_rejects_unassigned_question`: Verified that submitting questions outside the mock session scope is rejected with 400 `INVALID_QUESTION`.
  - `test_mock_submission_safe_retry_idempotency`: Verified repeated submit requests return identical results without duplicating attempts or diagnostic runs.
  - `test_mock_session_history_and_cross_user_isolation`: Verified history pagination and 403 `OWNERSHIP_VIOLATION` on cross-user session access.
  - `test_single_attempt_lifecycle_filters_and_safe_retries`: Verified lifecycle state filtering, idempotent submission on identical payload, and 400 `ATTEMPT_ALREADY_SUBMITTED` on response modification.
  - `test_recovery_evidence_persistence_and_authoritative_verification`: Verified diagnosis run, recovery report persistence, report listing, verification via authoritatively solved follow-up attempt, retry idempotency, and cross-user isolation.

### 4. Blockers
- None. All 59 tests in the backend suite pass cleanly. SQLite schema migrations and all endpoints are functional.

### 5. Next Steps
- Share the documented assessment endpoints and schemas (`GET /api/v1/questions`, `POST /api/v1/mock/start`, `GET /api/v1/mock/sessions`, `GET /api/v1/mock/{session_id}/active`, `POST /api/v1/mock/{session_id}/submit`, `GET /api/v1/mock/{session_id}`, `GET /api/v1/diagnosis/reports`, `POST /api/v1/diagnosis/reports/{report_id}/verify`) with the frontend teammate and LangGraph teammate for clean client-side integration.

---

## [Backend Security Hardening: Authentication, Authorization, Ownership Enforcement & Tamper Protection] - 2026-10-13

### 1. Scope & Implementation Details
- **Architecture Reuse & Hardening (No Second Auth System):**
  - Reused the established single authentication design in `backend/app/core/security.py` using cryptographic Supabase JWT verification (`decode_supabase_jwt`, `get_current_user`, `enforce_ownership`, `require_role`).
  - Hardened `APIException` in `backend/app/core/errors.py` to accept both `error_code` and `code` keyword arguments, ensuring consistent error envelopes without runtime `TypeError` exceptions.
- **Strict Record Ownership Enforcement:**
  - `GET /api/v1/diagnosis/reports/{report_id}`: Replaced raw 200 JSON dictionary with standard 404 `RESOURCE_NOT_FOUND` on missing records and 403 `OWNERSHIP_VIOLATION` via `enforce_ownership`.
  - `POST /api/v1/mock/{session_id}/submit`: Added `enforce_ownership` check when an attempt session already exists, preventing cross-user session hijacking.
  - `GET /api/v1/mock/{session_id}`: Standardized on centralized `enforce_ownership`.
  - `WhyEngineService.diagnose_attempt` & `verify_recovery`: Replaced raw equality checks with `enforce_ownership` ensuring uniform 403 `OWNERSHIP_VIOLATION` handling.
- **Client Input Validation & Tamper Protection (`extra="forbid"`):**
  - Added `model_config = ConfigDict(extra="forbid")` across request schemas to strictly reject client-submitted privileged fields:
    - `AnswerSubmitRequest`: Rejects client-supplied `is_correct` or `marks_obtained` with 422 `VALIDATION_ERROR`.
    - `UserUpdate`: Rejects client-supplied `role`, `is_active`, `id`, or unknown fields with 422 `VALIDATION_ERROR`.
    - `MockStartRequest`, `MockAnswerSubmission`, `MockSubmitRequest`: Rejects injected scoring/cheat parameters with 422 `VALIDATION_ERROR`.
    - `StudyPlanTaskUpdate`, `RecoveryVerifyRequest`: Rejects unauthorized payload attributes with 422 `VALIDATION_ERROR`.
- **Role-Based Privilege Boundaries:**
  - Protected `POST /api/v1/rag/reindex` with `require_role(UserRole.ADMIN, UserRole.EDUCATOR)`, preventing learners from triggering expensive vector reindexing.
  - Preserved role enforcement on question/variant authoring (`POST /api/v1/questions` and variants).
- **Assessment Answer Key Concealment:**
  - Verified and asserted that active assessments (`POST /api/v1/mock/start`, `GET /api/v1/questions`, `GET /api/v1/questions/{id}`, and offline bundles `GET /api/v1/sync/packs/{pack_id}`) strictly expose `QuestionPublic`, omitting `correct_answer`, `explanation_en`, `explanation_or`, and `distractor_metadata`.
- **Safe Logging & Credential Redaction:**
  - Enhanced `RedactingFormatter` in `backend/app/core/logging.py` to redact `Bearer` tokens, `Authorization` headers, `Cookie` headers, passwords, secrets, API keys, tokens, and student contact numbers from log records.
- **CORS & Environment Protection:**
  - Verified explicit CORS origins in `Settings.CORS_ORIGINS` (localhost/127.0.0.1 on ports 3000 and 5173). Production disallows wildcards with credentials.

### 2. Files Added & Modified
- `backend/app/core/errors.py` — Made `APIException` tolerant to `error_code`/`code` kwargs and safely serialize code values.
- `backend/app/core/logging.py` — Expanded `SENSITIVE_PATTERNS` to redact cookies, authorization headers, tokens, and PII.
- `backend/app/core/security.py` — Verified JWT decoding, ownership enforcement, and role checker.
- `backend/app/api/v1/endpoints/diagnosis.py` — Enforced ownership and 404/403 status codes on `get_recovery_report`; added `extra="forbid"` on `RecoveryVerifyRequest`.
- `backend/app/api/v1/endpoints/rag.py` — Added role guard `require_role(UserRole.ADMIN, UserRole.EDUCATOR)` on `POST /rag/reindex`.
- `backend/app/why_engine/service.py` — Migrated ownership checks to `enforce_ownership`.
- `backend/app/services/mock_service.py` — Enforced caller ownership on submit and session retrieval.
- `backend/app/schemas/attempt.py` — Added `extra="forbid"` to `AttemptStartRequest` and `AnswerSubmitRequest`.
- `backend/app/schemas/mock_test.py` — Added `extra="forbid"` to `MockStartRequest`, `MockAnswerSubmission`, and `MockSubmitRequest`.
- `backend/app/schemas/user.py` — Added `extra="forbid"` to `UserUpdate`.
- `backend/app/schemas/study_plan.py` — Added `extra="forbid"` to `StudyPlanTaskUpdate`.
- `backend/tests/conftest.py` — Added `educator_auth_headers` fixture.
- `backend/tests/test_security_hardening.py` — Added 12 security test cases covering unauthorized access, cross-user isolation, input tampering, role boundaries, answer key concealment, and log redaction.

### 3. Tests Executed & Actual Results
- Command: `backend\.venv\Scripts\pytest.exe -v`
- Result: **51 passed, 0 failed, 8 warnings in 12.39s** (100% test pass rate).
- Key security assertions verified:
  - 401 `AUTHENTICATION_REQUIRED` for unauthenticated requests on protected routes.
  - 401 `TOKEN_EXPIRED` and `INVALID_TOKEN` on expired/forged JWTs.
  - 403 `OWNERSHIP_VIOLATION` on cross-user attempt access, mock session viewing, mock hijacking, recovery report access, and study plan task manipulation.
  - 422 `VALIDATION_ERROR` on client tampering (`is_correct`, `marks_obtained`, `role: "admin"`).
  - 403 `FORBIDDEN` on learners attempting question creation or RAG reindexing.
  - Active test concealment asserting omission of `correct_answer`, `explanation_en`, `explanation_or`, and `distractor_metadata`.
  - Structured logging redaction of Bearer tokens, cookies, and secrets.

### 4. Blockers & Dependencies
- **Blockers:** None.
- **Dependencies:** Frontend team should ensure requests omit unknown extra properties when calling `PATCH /me`, `POST /attempts/{id}/submit`, and `POST /mock/{id}/submit`.

### 5. Next Steps
- Coordinate with frontend team to connect Supabase Auth session tokens directly into the `Authorization: Bearer <token>` header.
- Maintain contract stability for RAG/AI teammate integrations.

---

## [Core Backend Implementation: Profile Class Level, Learner Stats & Mock Session Retrieval] - 2026-10-13

### 1. Scope & Implementation Details
- **Frontend Integration Enablement:** Added Vite dev ports (`http://localhost:5173`, `http://127.0.0.1:5173`) to `CORS_ORIGINS` in `backend/app/core/config.py` to unblock direct browser fetch requests from the React frontend.
- **Learner Class Level & Profile Setup:**
  - Added `class_level` column to `User` model with database-level check constraint (`CheckConstraint("class_level IN (9, 10, 12)")`).
  - Created Alembic migration `0003_add_user_class_level.py` using `batch_alter_table` for non-destructive SQLite schema upgrade.
  - Updated `UserBase`, `UserCreate`, `UserUpdate`, and `UserPublic` Pydantic schemas with strict validation rejecting class levels outside `[9, 10, 12]` with 422.
  - Updated `UserService.update_profile` to persist `class_level`.
- **Authoritative Learner Performance & Recovery Metrics:**
  - Added `GET /api/v1/me/stats` endpoint returning `UserStatsResponse` with `HypothesisBreakdown`.
  - Implemented `UserService.get_user_stats` calculating authoritative accuracy, marks obtained, recoverable marks (from diagnostic runs/reports), recovered marks (from verified reports), and mark loss breakdown across terminology friction, time pressure, and concept gaps.
- **Mini-Mock Session Retrieval:**
  - Added `GET /api/v1/mock/{session_id}` endpoint in `backend/app/api/v1/endpoints/mock_exam.py`.
  - Implemented `MockService.get_mini_mock_result` with question response reconstruction from persisted attempts and strict learner ownership verification (403 `OWNERSHIP_VIOLATION` for cross-learner requests, 404 `RESOURCE_NOT_FOUND` for missing sessions).
- **Tooling & Operational Hardening:**
  - Added standalone `if __name__ == "__main__":` entrypoint to `backend/app/db/seed_demo_data.py`.
  - Added root `pytest.ini` with `norecursedirs = frontend node_modules .venv` preventing pytest from traversing `frontend/node_modules`.
  - Removed accidental local `#DOCS\ndocs` entry from root `.gitignore` to preserve doc tracking.

### 2. Files Added & Modified
- `backend/app/core/config.py` — Added `http://localhost:5173` to `CORS_ORIGINS`.
- `backend/app/models/user.py` — Added `class_level` column with CheckConstraint.
- `backend/alembic/versions/0003_add_user_class_level.py` — Migration for `users.class_level`.
- `backend/app/schemas/user.py` — Added `class_level` validation, `HypothesisBreakdown`, and `UserStatsResponse`.
- `backend/app/services/user_service.py` — Implemented `class_level` updates and `get_user_stats`.
- `backend/app/api/v1/endpoints/users.py` — Added `GET /api/v1/me/stats` route.
- `backend/app/services/mock_service.py` — Implemented `get_mini_mock_result` and fixed `APIException` parameter naming (`status_code`, `error_code`).
- `backend/app/api/v1/endpoints/mock_exam.py` — Added `GET /api/v1/mock/{session_id}` route.
- `backend/app/db/seed_demo_data.py` — Added CLI runner.
- `pytest.ini` — Root pytest configuration with directory filters.
- `.gitignore` — Removed accidental docs exclusion.
- `backend/tests/test_user_stats.py` — 4 unit/integration tests for profile updates, class level constraints, and stats aggregation.
- `backend/tests/test_mock_session_get.py` — 3 integration tests for session retrieval, 404s, and ownership enforcement.
- `backend/tests/test_migrations.py` — Updated migration tests asserting `users.class_level`.
- `backend/tests/conftest.py` — Added `other_learner_auth_headers` fixture.

### 3. Tests Executed & Actual Results
- Command: `backend\.venv\Scripts\pytest.exe -v` (executed from repository root and `backend/`)
- Result: **39 passed, 0 failed, 5 warnings in 2.62s** (100% test passing rate).
- Suite breakdown:
  - 4 attempt scoring tests
  - 5 auth & JWT role tests
  - 4 config validation tests
  - 3 error structure tests
  - 1 health check test
  - 1 multi-version Alembic migration upgrade test (0001 -> 0002 -> 0003)
  - 2 mini-mock start & submit tests
  - 3 mini-mock session GET & ownership enforcement tests
  - 4 learner class level & stats aggregation tests
  - 2 question concealment tests
  - 2 ChromaDB RAG health & query tests
  - 2 curriculum schema validation tests
  - 3 SQLite PRAGMA & rollback tests
  - 1 app startup test
  - 2 offline pack download & sync idempotency tests
  - 1 LangGraph WHY Engine diagnosis test

### 4. Items Requiring Teammate Decision
- **Frontend Teammate Decision:**
  - Transitioning `storageService.ts` from local mock storage to live backend endpoints (`POST /api/v1/sync/batch`, `POST /api/v1/mock/start`, `GET /api/v1/me/stats`).
  - Confirmation of preferred language codes for regional UI localization (`odia`, `english`).
- **AI / RAG Teammate Decision:**
  - Ingestion strategy for curriculum chunk embedding refresh (polling vs explicit `/api/v1/rag/reindex` trigger).
  - Diagnostic run probe serialization format for future multi-turn probing beyond the current 2-probe baseline.

### 5. Next Steps
- Provide API contracts to the frontend teammate to connect `ProfileSetupScreen`, `HomeScreen`, and `MockTestScreen`.
- Maintain SQLite migration discipline and keep all assessment endpoints strictly authoritative.

---

## [Repository Audit, Ownership Boundaries & Gap Analysis] - 2026-10-13

### 1. Scope & Repository Audit
- **Comprehensive Repository Inspection:** Inspected Git history, active branches (`backend` tracking `origin/backend`, ahead by 5 commits), uncommitted working copy changes (`.gitignore`), and full directory layout across `backend/`, `frontend/`, `data/`, and `docs/`.
- **Ownership Boundary Delineation:**
  - **Backend (Our scope):** FastAPI, SQLAlchemy 2.0, Alembic, SQLite, Pydantic, HTTPX, assessment scoring, sync engine, migrations, core schemas, repositories, services, and tests.
  - **Frontend (Teammate scope):** React 18, Vite, TailwindCSS, all screens/components, client IndexedDB/Dexie cache (`storageService.ts`), assets. Strictly decoupled from authoritative grading.
  - **RAG & Agentic AI (Teammate scope):** ChromaDB client, embedding pipelines, retrieval logic, LangGraph StateGraph, Gemini LLM adapters, prompt templates, and diagnostic reasoning.
- **Verification Baseline:** Verified entire backend test suite using `backend/.venv/Scripts/pytest.exe -v`: **32 passed, 0 failed, 4 warnings in 2.72s**.

### 2. Files Updated
- `docs/backend-state-audit.md` — Updated with complete architecture inventory, clear ownership boundaries, completed components, identified gaps, risks, and recommended next steps.
- `changelog_backend.md` — Added audit findings, checks, blockers, and next steps.

### 3. Identified Gaps & Blockers
- **Blocker (Frontend Integration):** `backend/app/core/config.py` defines `CORS_ORIGINS` with port `3000` only (`http://localhost:3000`), whereas the teammate's Vite frontend runs on port `5173` (`http://localhost:5173`). Cross-origin requests from the frontend will fail until port `5173` is allowed.
- **Repository Hygiene Issue:** Uncommitted change in root `.gitignore` ignores `docs`, which risks ignoring documentation updates.
- **Pytest Root Discovery Overhead:** Running pytest from repository root scans `frontend/node_modules`, causing test execution to take 33.5s instead of 2.72s.
- **CLI Seeding:** `backend/app/db/seed_demo_data.py` lacks a direct `if __name__ == "__main__":` entrypoint.

### 4. Checks & Verification
- Ran `git status`, `git branch -a`, `git log -n 10 --oneline`.
- Ran `pytest tests -v` inside `backend/` (32 passed in 2.72s).
- Validated SQLite PRAGMA enforcement, Alembic schema migration chain (0001 -> 0002), answer key concealment, and idempotent sync receipts.

### 5. Next Steps
- Add `http://localhost:5173` to `CORS_ORIGINS` in `config.py`.
- Remove `#DOCS\ndocs` from root `.gitignore` to preserve doc tracking.
- Add `if __name__ == "__main__":` block to `seed_demo_data.py` for standalone execution.
- Provide API contract confirmation to frontend and AI teammates.

---

## [Locked v2 Architecture: SQLite Hardening, ChromaDB, Offline Sync & LangGraph WHY Engine] - 2026-10-12

### 1. Scope & Stack Alignment (Prompts 1 – 6)
- **Stack Lockdown:** Replaced legacy Supabase/PostgreSQL/pgvector runtime reliance with a local-first, highly reliable foundation:
  - **Relational Core:** SQLite (via SQLAlchemy 2.x + Alembic) with WAL mode, foreign keys enforced on connection, and a 5000ms busy timeout.
  - **Vector Retrieval:** ChromaDB persistent client managing rebuildable curriculum chunks with exact pre-filters.
  - **Diagnostic Agent:** LangGraph StateGraph orchestrating hypothesis formulation, probe selection (max 2), grounded evidence retrieval, and Mark Recovery Report generation.
  - **LLM Integration:** Isolated Gemini adapter with deterministic fallback heuristics ensuring tests run offline without network access or live credentials.
  - **Client Offline Synchronization:** Bounded content pack distribution and idempotent batch event synchronization with conflict deduplication via `sync_receipts`.

### 2. Files Added & Modified
- **Documentation & Configuration:**
  - `docs/TECH_STACK.md` — Authoritative component matrix, responsibilities, and data boundaries.
  - `docs/backend-state-audit.md` — Initial repository audit, component inventory, and migration risks.
  - `docs/api-contracts.md` — Complete endpoint contracts for mini-mock, RAG, and diagnosis workflows.
  - `docs/offline-sync.md` — Specification for offline packs, client Dexie separation, and sync receipts.
  - `backend/.env.example` — Documented environment variables for SQLite, ChromaDB, Gemini, and optional Langfuse.
  - `backend/requirements.txt` & `backend/pyproject.toml` — Added `chromadb>=1.5.0` and `langgraph>=1.2.0`, removed Postgres binaries.
  - `.gitignore` (root & backend) — Added strict exclusions for local database files, vector store data, and prompt instruction files.
- **Database & Migrations:**
  - `backend/app/db/session.py` — Engine setup with SQLite connect listener executing `PRAGMA foreign_keys=ON;`, `PRAGMA journal_mode=WAL;`, `PRAGMA busy_timeout=5000;`.
  - `backend/alembic/versions/0002_diagnosis_and_sync_schema.py` — Migration adding `diagnostic_runs`, `diagnostic_probes`, `recovery_reports`, `sync_receipts`, and `content_chunks` provenance fields.
  - `backend/app/models/diagnostic.py` — `DiagnosticRun`, `DiagnosticProbe`, and `RecoveryReport` domain models.
  - `backend/app/models/sync_receipt.py` — `SyncReceipt` domain model for idempotency ledger.
  - `backend/app/models/content_chunk.py` — Provenance extensions (`source_locator`, `checksum`, `class_level`, `subject_id`).
  - `backend/app/db/seed_demo_data.py` — Seeder populating 25 reviewed bilingual questions across Class 9, 10, and 12 with approved content chunks.
- **Mini-Mock & Assessment:**
  - `backend/app/schemas/mock_test.py` — `MockStartRequest`, `MockSessionResponse`, `MockSubmitRequest`, and `MockResultResponse`.
  - `backend/app/services/mock_service.py` — 5-question mini-mock orchestration, answer key concealment, server-side grading, and diagnosis triggering.
  - `backend/app/api/v1/endpoints/mock_exam.py` — `/api/v1/mock/start` and `/api/v1/mock/{session_id}/submit`.
- **RAG & ChromaDB:**
  - `backend/app/rag/embedding.py` — Pinned 384-dimensional embedding adapter with deterministic projection fallback.
  - `backend/app/rag/chroma_client.py` — Persistent ChromaDB store wrapper with SQLite reconciliation (`rebuild_from_sqlite`), metadata pre-filters, and keyword fallback.
  - `backend/app/rag/provenance.py` — Structured citation and grounded context formatter.
  - `backend/app/api/v1/endpoints/rag.py` — `/api/v1/rag/health`, `/api/v1/rag/reindex`, and `/api/v1/rag/query`.
- **Offline Content Packs & Sync:**
  - `backend/app/schemas/sync.py` — `ContentPackManifest`, `ContentPackBundle`, `SyncEvent`, and `SyncBatchResponse`.
  - `backend/app/services/sync_service.py` — Pack assembler (omitting answer keys) and idempotent batch processing engine.
  - `backend/app/api/v1/endpoints/sync.py` — `/api/v1/sync/packs`, `/api/v1/sync/packs/{id}`, and `/api/v1/sync/batch`.
- **LangGraph WHY Engine:**
  - `backend/app/why_engine/gemini_adapter.py` — Provider adapter with bounded hypotheses scoring and explanation generation.
  - `backend/app/why_engine/graph.py` — LangGraph diagnosis StateGraph (`evaluate_attempt` -> `retrieve_rag_evidence` -> `formulate_hypotheses` -> `select_probes` -> `generate_recovery_report`).
  - `backend/app/why_engine/service.py` — Execution coordinator and recovery verification manager.
  - `backend/app/api/v1/endpoints/diagnosis.py` — `/api/v1/diagnosis/run/{attempt_id}`, `/api/v1/diagnosis/reports/{report_id}`, and `/api/v1/diagnosis/reports/{report_id}/verify`.
- **Test Suite:**
  - `backend/tests/test_sqlite_hardening.py` — Tests for foreign keys enforcement, session rollback, and unique constraints.
  - `backend/tests/test_mock_test.py` — Tests for mini-mock answer key concealment and authoritative grading.
  - `backend/tests/test_rag.py` — Tests for ChromaDB health, SQLite re-indexing, and curriculum query filters.
  - `backend/tests/test_sync.py` — Tests for offline pack bundle structure and idempotent duplicate handling.
  - `backend/tests/test_why_engine.py` — Tests for diagnostic graph execution and mark recovery verification loop.

### 3. Tests Executed & Actual Results
- **Command:** `pytest backend/tests -v` (executed via `backend\.venv\Scripts\pytest.exe`)
- **Result:** **32 passed, 0 failed, 4 warnings in 2.37s**
- **Test Coverage Summary:**
  - 4 attempt scoring & ownership tests
  - 5 authentication & role verification tests
  - 4 configuration validation tests
  - 3 centralized error handling tests
  - 1 database health check test
  - 1 Alembic multi-version migration upgrade test
  - 2 mini-mock answer concealment & scoring tests
  - 2 public question representation tests
  - 2 curriculum schema validation tests
  - 3 SQLite PRAGMA & rollback hardening tests
  - 1 app boot & OpenAPI startup test
  - 2 ChromaDB RAG health & query tests
  - 2 offline pack download & duplicate sync tests
  - 1 LangGraph WHY Engine diagnosis & mark recovery verification test

---

## [Initial MVP Backend Foundation] - 2026-10-11

### 1. Files Added & Modified
- **Backend Configuration & Setup:**
  - `backend/.gitignore` — Python, venv, sqlite, and cache exclusions.
  - `backend/.env.example` — Typed environment variable template with placeholders only; never commits secrets.
  - `backend/requirements.txt` — Pinned production and test dependencies.
  - `backend/pyproject.toml` — Standard packaging configuration and pytest options.
  - `backend/README.md` — Complete architecture, setup, migration, and testing guide.
  - `backend/alembic.ini` — Alembic migration config.
  - `changelog_backend.md` — Authoritative backend changelog.
- **Core Layer (`backend/app/core/`):**
  - `config.py` — Strongly typed `Settings` using `pydantic-settings`. Normalizes database URLs, enforces production security (rejecting CORS `*` and insecure JWT secrets).
  - `constants.py` — Controlled enums: `ClassLevel` (9, 10, 12), `UserRole`, `PreferredLanguage`, `ExamTarget`, `QuestionType`, `QuestionDifficulty`, `ApprovalState`, `VariantPurpose`, `AttemptLifecycle`, `TaskStatus`.
  - `errors.py` — Stable machine-readable `APIErrorCode` values and centralized exception handlers for `APIException`, `RequestValidationError`, `HTTPException`, and unhandled errors.
  - `logging.py` — Structured JSON logging with automatic redaction of bearer tokens, passwords, and sensitive keys.
  - `security.py` — Server-side Supabase JWT token verification, expiration check, audience enforcement, `get_current_user` dependency, role checks, and `enforce_ownership()`.
- **Database & Models (`backend/app/db/` & `backend/app/models/`):**
  - `db/base.py` — SQLAlchemy 2.0 `DeclarativeBase` with timezone-aware `TimestampMixin`.
  - `db/session.py` — Engine setup, thread-safe session generator with rollback protection, safe DB health check.
  - `models/user.py` — Learner and educator identity with minimal PII.
  - `models/subject.py` — Stable subject codes and bilingual names.
  - `models/chapter.py` — Class-level constrained chapters (`CheckConstraint("class_level IN (9, 10, 12)")`).
  - `models/concept.py` — Atomic concept nodes with Odia-English terminology mappings and prerequisite IDs.
  - `models/question.py` — `Question` and `QuestionVariant` models with server-only answer keys and distractor metadata.
  - `models/content_chunk.py` — Educational text chunks for approved RAG grounding.
  - `models/attempt.py` — Authoritative attempt records storing computed correctness, marks, and learning signals.
  - `models/study_plan.py` — `StudyPlan` and `StudyPlanTask` models for post-autopsy repair tasks.
- **Schemas (`backend/app/schemas/`):**
  - `common.py` — Uniform `HealthResponse` and `APIErrorResponse` structures.
  - `user.py` — Profile read/update schemas.
  - `subject.py`, `chapter.py`, `concept.py` — Curriculum schemas with ClassLevel validation.
  - `question.py` — `QuestionPublic` (answer keys and explanations strictly stripped for active testing) vs `QuestionWithAnswer` (admin/teacher only).
  - `attempt.py` — `AttemptStartRequest`, `AnswerSubmitRequest` (forbids client score tampering), `AttemptResponse`.
  - `study_plan.py` — Intervention and repair task schemas.
- **Repositories & Services (`backend/app/repositories/` & `backend/app/services/`):**
  - Repositories for all 10 domain entities providing clean data-access separation.
  - `user_service.py` — Token synchronization and profile persistence.
  - `content_service.py` — Syllabus hierarchy and validation.
  - `question_service.py` — Active-test retrieval with answer concealment.
  - `attempt_service.py` — Authoritative server-side grading, negative marking calculation, idempotency protection against resubmission, and ownership verification.
  - `study_plan_service.py` — Intervention tracking.
- **Master API (`backend/app/api/` & `backend/app/main.py`):**
  - `deps.py` — Dependency injection tree.
  - `v1/router.py` & `v1/endpoints/` — Mounted endpoints under `/api/v1` for health, users, subjects, chapters, concepts, questions, attempts, and study plans.
  - `main.py` — FastAPI app with CORS middleware, lifespan logging, centralized error handlers, and OpenAPI documentation.
- **Migrations (`backend/alembic/`):**
  - `versions/0001_initial_schema.py` — Initial migration creating all 10 domain tables, indexes, unique constraints, and foreign keys.
- **Tests (`backend/tests/`):**
  - `conftest.py`, `test_startup.py`, `test_health.py`, `test_config.py`, `test_errors.py`, `test_schemas.py`, `test_auth.py`, `test_questions.py`, `test_attempts.py`, `test_migrations.py`.

---

### 2. Migrations
- `0001_initial_schema.py`:
  - Tables created: `users`, `subjects`, `chapters`, `concepts`, `questions`, `question_variants`, `content_chunks`, `attempts`, `study_plans`, `study_plan_tasks`.
  - Constraints & indexes: Foreign keys on all child entities, check constraint on `chapters.class_level IN (9, 10, 12)`, composite index on `(subject_id, class_level)`, indexes on question difficulty/approval state, and unique indexes on email and codes.

---

### 3. API & Architectural Decisions
1. **Frontend / Backend Boundary:**
   - Frontend: Responsible for UI, local IndexedDB caching (Dexie), offline pack storage, local response capture. Never calculates scores or decides recovery.
   - Backend: Authoritative for identity, permissions, question correctness, marks, persisted records, and sync acceptance.
2. **Answer Key Protection:**
   - Active-test responses return `QuestionPublic`, which strictly omits `correct_answer`, `explanation_en`, `explanation_or`, and `distractor_metadata`.
3. **Deterministic Grading:**
   - Client submission (`POST /api/v1/attempts/{id}/submit`) accepts only learner response representations (e.g. `{"selected_option": "A"}`). Client-supplied scores or correctness values are discarded. The backend evaluates against trusted answer keys, applies marks (+4.0) or negative marks (-1.0), and closes the attempt.
4. **Authentication & Ownership:**
   - Supabase Auth tokens are cryptographically verified server-side using `PyJWT` against `SUPABASE_JWT_SECRET`, checking expiry and audience. Learner attempts and personal records enforce `enforce_ownership()`, rejecting foreign user access with 403 `OWNERSHIP_VIOLATION`.
5. **Class Level Policy:**
   - Validated strictly to `[9, 10, 12]`. Any attempt to request or insert chapters outside these values triggers a validation error (`INVALID_CLASS_LEVEL`).

---

### 4. Environment Requirements
- `APP_ENV`: `development` | `staging` | `production`
- `DATABASE_URL`: PostgreSQL or SQLite connection string.
- `CORS_ORIGINS`: Explicit list of allowed domains; wildcard disallowed in production.
- `SUPABASE_JWT_SECRET`: Secret key for server-side JWT verification.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase project metadata.

---

### 5. Tests Executed & Actual Results
- Command: `pytest -v` (executed via `backend\.venv\Scripts\pytest.exe -v`)
- Summary: **22 passed, 0 failed, 4 warnings in 1.54s**
- Test breakdown:
  - `tests/test_startup.py`: 1 passed (App boot & OpenAPI schema)
  - `tests/test_health.py`: 1 passed (Liveness, database readiness, credential concealment)
  - `tests/test_config.py`: 4 passed (Defaults, postgres URL normalization, production CORS guard, production secret guard)
  - `tests/test_errors.py`: 3 passed (404 error envelope, 422 validation structure, safe 500 error sanitization)
  - `tests/test_schemas.py`: 2 passed (Class level 9, 10, 12 validation, public question answer concealment)
  - `tests/test_auth.py`: 5 passed (Missing token, invalid token, expired token, valid token profile sync, role enforcement)
  - `tests/test_questions.py`: 1 passed (Public active-test endpoints strip answer keys and explanations)
  - `tests/test_attempts.py`: 4 passed (Authoritative scoring, negative marking, resubmission rejection, ownership boundary)
  - `tests/test_migrations.py`: 1 passed (Alembic migration upgrade and table reflection)

---

### 6. Unfinished / Deferred Work (Next Phases)
- **WHY Engine / LangGraph:** Diagnostic state machine with probe selection and hypothesis formation (intentionally deferred per prompt constraints).
- **RAG & pgvector:** Vector embeddings on `content_chunks` and semantic retrieval pipelines (deferred until pgvector is provisioned).
- **Offline Pack Generation & Sync:** Idempotent event batch upload (`POST /api/v1/sync/events`) and offline pack serialization (deferred per prompt constraints).
