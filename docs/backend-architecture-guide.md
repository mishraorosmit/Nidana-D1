# NIDANA Backend Architecture Guide & Execution Walkthrough

**Audience**: Junior-to-Senior Engineers, Frontend Teammates, AI/RAG Teammates, and System Evaluators  
**Repository**: `Nidana-D1/backend`  
**Status**: Authoritative Documentation of Implemented Backend Architecture  
**Test Baseline**: 66 passed tests, 100% pass rate  

---

## 1. Welcome to NIDANA

**NIDANA** (ନିଦାନ - meaning *root-cause diagnosis* in Sanskrit and Odia) is an offline-first, bilingual (Odia and English) learning companion designed for students in Odisha preparing for competitive examinations (CHSE Class 12, BSE Class 10, Class 9 foundations, JEE Main, and NEET-UG).

While conventional EdTech platforms act as question banks that merely report *“You got this wrong, here is the answer”*, NIDANA introduces the **Mark-Loss Autopsy**:
1. **Observe**: When a student answers incorrectly, note the exact option chosen, time taken, and class context.
2. **Diagnose**: Form competing hypotheses explaining *why* the student erred (e.g., terminology confusion between Odia and English, prerequisite concept gap, formula misconception, or careless execution).
3. **Probe**: Administer at most two low-stakes diagnostic probes to disambiguate the true cause.
4. **Remediate**: Deliver targeted, syllabus-grounded remediation quoting approved textbook sections.
5. **Replan & Recover**: Schedule follow-up mastery checks to authoritatively verify mark recovery.

```
+-----------+      +------------+      +----------+      +-----------+      +-----------------+
|  Attempt  | ---> |  Diagnose  | ---> |  Repair  | ---> |  Replan   | ---> | Verify Recovery |
| (Student) |      | (Autopsy)  |      | (Bridge) |      |  (Tasks)  |      |   (Educator)    |
+-----------+      +------------+      +----------+      +-----------+      +-----------------+
```

---

## 2. Core Architectural Invariants

Before looking at any code, understand these non-negotiable architectural principles:

1. **The Server is Authoritative**:
   - The client application (browser, mobile PWA, or tablet) is considered **untrusted**.
   - The client *never* computes scores, calculates correctness, determines marks obtained, or approves mark recovery.
   - All grading is deterministically computed on the server (+4.0 for correct, -1.0 for incorrect, 0 for unattempted).
2. **Answer Keys are Strictly Concealed**:
   - During active assessments, mini-mocks, and public question browsing, answer keys (`correct_answer`), explanations (`explanation_en`, `explanation_or`), and distractor metadata are **stripped** from the response payload.
   - Answer keys exist only in the internal database and server-side memory.
3. **SQLite is the Canonical Source of Truth**:
   - SQLite is not a temporary prototype—it is the hardened, canonical application database.
   - Configured with Write-Ahead Logging (`WAL`), foreign key enforcement, and thread concurrency timeouts.
   - ChromaDB (vector store) is a *derived, rebuildable index*, never the primary store of student state.
4. **Learner Ownership Boundary**:
   - Students can only read or mutate their own attempts, mock sessions, diagnostic reports, and study plans.
   - Cross-user access triggers an immediate `403 Forbidden` (`OWNERSHIP_VIOLATION`).
5. **Idempotency & Safe Retries**:
   - Offline devices frequently retry HTTP requests due to poor connectivity.
   - Assessments cannot be resubmitted once submitted. Repeated submissions return the original graded results without corrupting scores.
   - Batch sync events are deduplicated using a persistent receipt ledger (`SyncReceipt`).

---

## 3. The Journey of an HTTP Request (Step-by-Step Execution Flow)

To understand how the backend works, let us trace a real request:  
**A student submits answers to a 5-Question Mini-Mock Assessment** (`POST /api/v1/mock/{session_id}/submit`).

```
[ Client Browser / PWA ]
          │  HTTP POST /api/v1/mock/mock_test_session_123/submit
          │  Header: Authorization: Bearer <JWT>
          │  Body: {"answers": [{"question_id": "q1", "selected_option": "A"}]}
          ▼
┌────────────────────────────────────────────────────────┐
│ 1. Uvicorn & ASGI Listener (app.main:app)              │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 2. CORS Middleware                                     │
│    - Validates Origin (e.g., http://localhost:5173)    │
│    - Rejects unauthorized cross-origin preflights      │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 3. Master Router Dispatch (app.api.v1.router)          │
│    - Matches prefix /api/v1 and route /mock/{id}/submit│
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 4. Dependency Injection Phase (app.api.deps)           │
│    a. get_current_user (app.core.security):            │
│       - Extracts Bearer token                          │
│       - Verifies HMAC signature, exp, audience via JWT │
│       - Yields AuthenticatedUser(id, email, role)      │
│    b. get_db (app.db.session):                         │
│       - Opens thread-local Session                     │
│       - Applies PRAGMA foreign_keys=ON; WAL;           │
│       - Yields SQLAlchemy Session                      │
│    c. MockService(db): Injects active session          │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 5. Pydantic v2 Request Validation                      │
│    - Validates payload against MockSessionSubmitRequest│
│    - extra="forbid" rejects unexpected tampering fields│
│    - On error: validation_exception_handler (422)      │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 6. Service Layer & Business Rules (MockService)        │
│    - Enforces session ownership (enforce_ownership)    │
│    - Checks idempotency: if already submitted, return  │
│    - Fetches questions authoritatively from SQLite     │
│    - Server grades each option: +4.0 (correct) / -1.0  │
│    - Updates MockTestSession, inserts Attempt records  │
│    - Triggers WhyEngineService for incorrect answers   │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 7. Persistence & Commit                                │
│    - SQLAlchemy flushes records to SQLite              │
│    - get_db executes db.commit() upon normal exit      │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ 8. Response Serialization                              │
│    - Serializes result into MockSessionResponse        │
│    - Returns HTTP 200 JSON to client                   │
└────────────────────────────────────────────────────────┘
```

### Detailed Execution Phase Breakdown

1. **Uvicorn Web Server**:
   - `uvicorn` listens on `0.0.0.0:8000` and receives the raw TCP socket data, parsing HTTP headers and payload into the ASGI interface.
2. **CORS Middleware (`CORSMiddleware`)**:
   - Inspects the incoming `Origin` header. If the origin matches `CORS_ORIGINS` (which includes `http://localhost:5173` for the Vite frontend), it appends access-control headers. In production, wildcard `*` is strictly disallowed.
3. **Routing Match**:
   - FastAPI parses the URL path `/api/v1/mock/{session_id}/submit` against the route table defined in `app/api/v1/endpoints/mock_exam.py` mounted by `app/api/v1/router.py`.
4. **Dependency Resolution**:
   - `get_current_user` extracts the JWT from the `Authorization: Bearer <token>` header. It validates the cryptographic signature using `SUPABASE_JWT_SECRET` (HS256), checks expiration (`exp`), verifies audience (`aud == "authenticated"`), and builds an immutable `AuthenticatedUser` dataclass.
   - `get_db` opens a thread-local SQLAlchemy session, activates SQLite PRAGMAs (`foreign_keys=ON`, `journal_mode=WAL`), and yields the session.
5. **Schema Validation**:
   - Pydantic validates the request body against `MockSessionSubmitRequest`. Extra client-supplied fields (e.g. attempting to send `is_correct: true`) are rejected immediately with `422 Unprocessable Content`.
6. **Authoritative Business Logic**:
   - `mock_service.submit_mock_session()` queries the database for the active `MockTestSession`.
   - `enforce_ownership()` confirms the session belongs to the authenticated caller.
   - The service fetches canonical `Question` records from SQLite.
   - The server evaluates the selected answer against `correct_answer`:
     - If correct: `is_correct = True`, `marks_obtained = +4.0`.
     - If incorrect: `is_correct = False`, `marks_obtained = -1.0`.
     - If omitted: `is_correct = False`, `marks_obtained = 0.0`.
   - For every incorrect answer, `WhyEngineService.run_diagnosis()` is scheduled, generating a `DiagnosticRun` and creating an educator-verifiable `RecoveryReport`.
7. **Session Commit**:
   - When the route handler finishes without unhandled exceptions, the `get_db` generator commits the transaction (`db.commit()`) and closes the connection (`db.close()`).
8. **Response Formatting**:
   - The return data is serialized into `MockSessionResponse` and returned to the client as clean JSON.

---

## 4. Relational Database Layer & 16 Tables

SQLite is our canonical database engine. All schema definitions are managed through **Alembic migrations** (never `Base.metadata.create_all()` in production).

### The Migration Chain:
```
0001_initial_schema
   └── 0002_diagnosis_and_sync_schema
         └── 0003_add_user_class_level
               └── 0004_add_mock_test_sessions (HEAD)
```

### Table Inventory & Relationships

| # | Table Name | Purpose | Key Columns |
|---|---|---|---|
| 1 | `users` | Learner profiles, roles, class level, preferred language | `id`, `email`, `role`, `class_level`, `preferred_language` |
| 2 | `subjects` | Broad academic subjects (Science, Math, Physics) | `id`, `code`, `name_en`, `name_or` |
| 3 | `chapters` | Chapters strictly bound to class levels (9, 10, 12) | `id`, `subject_id`, `class_level`, `title_en`, `title_or` |
| 4 | `concepts` | Granular concept nodes & bilingual terminology | `id`, `chapter_id`, `code`, `terminology_mappings` |
| 5 | `questions` | Canonical question bank with concealed answer keys | `id`, `concept_id`, `class_level`, `correct_answer`, `marks` |
| 6 | `question_variants` | Difficulty/language variants for adaptive tests | `id`, `parent_question_id`, `variant_type`, `language` |
| 7 | `content_chunks` | Approved syllabus text chunks with SHA-256 hashes | `id`, `chapter_id`, `text_content`, `checksum`, `approval_state` |
| 8 | `attempts` | Single question attempt logs and grading outcomes | `id`, `user_id`, `question_id`, `is_correct`, `marks_obtained` |
| 9 | `mock_test_sessions` | 5-question mini-mock assessment sessions | `id`, `user_id`, `class_level`, `total_score`, `status` |
| 10 | `study_plans` | Personalized remedial study plans | `id`, `user_id`, `target_exam`, `status` |
| 11 | `study_plan_tasks` | Actionable remedial tasks and follow-up drills | `id`, `study_plan_id`, `target_weakness`, `status` |
| 12 | `diagnostic_runs` | WHY Engine diagnosis execution records | `id`, `attempt_id`, `user_id`, `primary_hypothesis`, `status` |
| 13 | `diagnostic_probes` | Specific diagnostic probe questions and responses | `id`, `diagnostic_run_id`, `probe_type`, `prompt_stem` |
| 14 | `recovery_reports` | Mark recovery evidence and targeted repair plan | `id`, `diagnostic_run_id`, `marks_at_risk`, `is_verified` |
| 15 | `sync_receipts` | Idempotent receipt ledger for client offline sync | `id`, `user_id`, `client_event_id`, `status` |
| 16 | `alembic_version` | Tracks current applied database migration version | `version_num` |

---

## 5. Security & Authentication Model

### 1. JWT Verification (`app/core/security.py`)
- Authentication is handled via **Supabase Auth JWT tokens** passed in the `Authorization: Bearer <token>` header.
- The backend verifies tokens **locally and cryptographically** using `PyJWT` with the `SUPABASE_JWT_SECRET`. It does not make blocking HTTP calls to Supabase on every request.
- Tokens must contain:
  - Valid signature matching `SUPABASE_JWT_SECRET`.
  - Non-expired expiration timestamp (`exp`).
  - Audience claim matching `SUPABASE_JWT_AUDIENCE` (`authenticated`).
  - Subject claim (`sub`) containing the user's UUID.

### 2. Role-Based Access Control (`require_role`)
Users are categorized into three roles:
- `student` (default learner): Can take tests, sync offline packs, view personal reports.
- `educator`: Can review student diagnostics, verify mark recovery reports, and author question variants.
- `admin`: Has full privileges, including rebuilding the vector index (`POST /api/v1/rag/reindex`).

### 3. Record Ownership Enforcement (`enforce_ownership`)
Whenever an endpoint fetches personal learner data (e.g., `GET /api/v1/attempts/{id}` or `GET /api/v1/mock/{session_id}`):
```python
def enforce_ownership(resource_owner_id: str, current_user: AuthenticatedUser) -> None:
    if current_user.is_admin:
        return
    if str(resource_owner_id) != str(current_user.id):
        raise APIException(
            status_code=403,
            error_code=APIErrorCode.OWNERSHIP_VIOLATION,
            message="Forbidden: You do not have permission to access or modify this resource.",
        )
```

---

## 6. Communication Boundaries & Teammate Handoff

NIDANA is developed concurrently across three specialized engineering tracks. Understanding the boundaries ensures nobody steps on someone else's work:

### 1. Frontend Boundary (React + Vite + TailwindCSS)
- **Frontend Codebase**: Located under `frontend/`. Runs on port `5173`.
- **Frontend Role**:
  - Delivers the user interface, Odia/English toggle, interactive animations, and responsive screens.
  - Manages local client storage via `IndexedDB` (Dexie) and caches offline content packs.
  - Queues user attempt events while offline and pushes them to `POST /api/v1/sync/batch` when online.
- **Backend Responsibility to Frontend**:
  - Provides stable REST API contracts documented in [docs/api-contracts.md](file:///e:/PROJECTS/Nirmit-D1/Nidana-D1/docs/api-contracts.md).
  - Enables CORS support for `http://localhost:5173`.
  - Serves interactive OpenAPI schemas at `http://localhost:8000/docs`.

### 2. RAG & Agentic AI Boundary (ChromaDB + LangGraph)
- **AI Codebase**: Located under `backend/app/rag/` and `backend/app/why_engine/`.
- **AI Teammate Role**:
  - Develops semantic chunk retrieval algorithms and tunes Odia embedding tokenizers.
  - Designs LangGraph agent nodes, prompt engineering templates, and Gemini LLM reasoning chains.
- **Backend Responsibility to AI Teammate**:
  - Provides the relational data models (`ContentChunk`, `DiagnosticRun`, `DiagnosticProbe`, `RecoveryReport`).
  - Provides safe API gateways (`POST /api/v1/rag/query`, `POST /api/v1/diagnosis/run/{attempt_id}`).
  - Provides deterministic test doubles (`EmbeddingAdapter`, `GeminiAdapter`) so backend tests never fail due to missing API keys or external server outages.

---

## 7. Factual Architecture Inventory (Honest Status Breakdown)

To avoid confusion, here is the honest categorization of backend functionality:

| Feature / Subsystem | Status | Details & Reality |
|---|---|---|
| **Authoritative Assessment Grading** | **Implemented (100%)** | Server evaluates answer choices (+4.0/-1.0), prevents client tampering, blocks resubmission. Tested & green. |
| **5-Question Mini-Mock Assessment** | **Implemented (100%)** | Start session, answer concealment, active resumption, grading, and history. Tested & green. |
| **Answer Key Concealment** | **Implemented (100%)** | All active test endpoints serialize via `QuestionPublic` stripping answer keys. Tested & green. |
| **Relational SQLite Data Layer** | **Implemented (100%)** | 16 tables, WAL mode, foreign keys, 4 Alembic migrations. Tested & green. |
| **Learner Profile & Stats Aggregation** | **Implemented (100%)** | `GET /me/stats` computes total attempts, accuracy, marks gained, and recoverable marks. Tested & green. |
| **Offline Content Packs & Sync** | **Implemented (100%)** | Downloadable syllabus packs (`/sync/packs`) and idempotent batch sync (`/sync/batch`). Tested & green. |
| **Seed Data Pipeline** | **Implemented (100%)** | 25 bilingual questions and taxonomy seeded via `python -m app.db.seed_demo_data`. Tested & green. |
| **JWT Verification & Ownership** | **Implemented (100%)** | Server-side JWT decoding, role checks, and ownership guards. Tested & green. |
| **Unified Error Handling** | **Implemented (100%)** | Machine-readable codes and uniform error payload envelopes across all endpoints. Tested & green. |
| **LangGraph WHY Engine Workflow** | **Partially Implemented (Adapter Ready)** | 5-node StateGraph compiled and working with deterministic heuristic fallback. AI teammate to provide tuned prompts. |
| **ChromaDB Vector Retrieval** | **Partially Implemented (Adapter Ready)** | Client, metadata filters, and SQLite reconciliation working. Uses 384-dim hash projection double for offline tests. |
| **Vocal Speech-to-Text Autopsy** | **Planned (Deferred)** | Real-time Odia audio transcription not implemented; planned for later milestone. |
| **School/District Analytics Dashboard** | **Planned (Deferred)** | Multi-tenant school aggregation endpoints planned for future educator release. |
| **Peer-to-Peer Wi-Fi Mesh Sync** | **Planned (Deferred)** | Device-to-device local sync without router planned for rural offline expansion. |

---

## 8. Inconsistencies & Legacy Notes

During our architectural audit, we identified several discrepancies between early design notes and the actual codebase:

1. **Legacy Reference to PostgreSQL & Supabase DB (`Backend_guide.md`, `Tech_stack.md`)**:
   - *Historical Context*: Early specifications considered Supabase PostgreSQL with `pgvector`.
   - *Actual Architecture*: To support offline-first local deployment and portable student devices, SQLite with WAL mode was locked as the canonical database, and ChromaDB was locked for local vector retrieval. The backend code does not connect to PostgreSQL.
2. **Legacy Reference to Next.js (`Backend_guide.md`)**:
   - *Historical Context*: Early design documents referenced a Next.js web application.
   - *Actual Architecture*: The frontend was developed and delivered as a high-performance **React 19 + Vite 6 + TailwindCSS** single-page application under `frontend/`.
3. **Legacy Config Parameters in `backend/app/core/config.py`**:
   - Parameters named `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` remain in settings. They are harmless historical artifacts and do not affect the SQLite runtime.
4. **Proposed vs Implemented API Paths**:
   - Legacy docs proposed paths like `/api/v1/tests` or `/api/v1/attempts/{id}/diagnose`.
   - The authoritative API contracts are those documented in [docs/api-contracts.md](file:///e:/PROJECTS/Nirmit-D1/Nidana-D1/docs/api-contracts.md) (e.g. `/api/v1/mock/start`, `/api/v1/diagnosis/run/{attempt_id}`).

---

## 9. Developer Quick-Start Guide

### 1. Setting Up the Environment
```bash
# Navigate to the backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1    # On Windows PowerShell
# source .venv/bin/activate   # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
```

### 2. Applying Database Migrations
```bash
# Upgrade database to head (creates all 16 tables in ./data/nidana.db)
alembic upgrade head
```

### 3. Seeding Demonstration Data
```bash
# Seed 25 bilingual questions across Class 9, 10, and 12
python -m app.db.seed_demo_data
```

### 4. Running the Development Server
```bash
# Start FastAPI with auto-reload on port 8000
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive OpenAPI Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Alternative ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### 5. Running the Test Suite
```bash
# Run all 66 test suites from the project root or backend folder
pytest -v
```
All 66 tests run offline without network access or cloud credentials.
