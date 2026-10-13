# NIDANA API Contracts Specification

**Version:** 0.2.0 (Locked SQLite + ChromaDB + LangGraph Stack)  
**Base URL:** `/api/v1`

---

## 1. 5-Question Mini-Mock Assessment

### `POST /api/v1/mock/start`
Starts a 5-question bilingual mini-mock for the requested Class Level.
- **Request Body (`MockStartRequest`):**
  ```json
  {
    "class_level": 10,
    "subject_id": "sub_science",
    "language": "bilingual"
  }
  ```
- **Response (`MockSessionResponse`):**
  - **Security Invariant:** Answer keys (`correct_answer`), full teacher explanations, and distractor metadata are strictly stripped.
  ```json
  {
    "session_id": "mock_a1b2c3d4e5f6",
    "class_level": 10,
    "total_questions": 5,
    "total_marks": 20.0,
    "questions": [
      {
        "id": "q_c10_rxn_01",
        "chapter_id": "chap_c10_chem_rxn",
        "concept_id": "cpt_c10_redox",
        "type": "single_choice",
        "difficulty": "easy",
        "marks": 4.0,
        "negative_marks": 1.0,
        "expected_time_seconds": 60,
        "language": "bilingual",
        "stem_en": "In the reaction CuO + H2 -> Cu + H2O, which substance is being reduced?",
        "stem_or": "CuO + H2 -> Cu + H2O ରାସାୟନିକ ପ୍ରତିକ୍ରିୟାରେ କେଉଁ ପଦାର୍ଥଟି ବିଜାରିତ ହେଉଛି?",
        "options": [
          {"id": "A", "text_en": "CuO (Copper oxide)", "text_or": "CuO (କପର ଅକ୍ସାଇଡ୍)"},
          {"id": "B", "text_en": "H2 (Hydrogen)", "text_or": "H2 (ହାଇଡ୍ରୋଜେନ୍)"}
        ]
      }
    ]
  }
  ```

### `POST /api/v1/mock/{session_id}/submit`
Submits student answers for authoritative server-side evaluation.
- **Request Body (`MockSubmitRequest`):**
  ```json
  {
    "answers": [
      {
        "question_id": "q_c10_rxn_01",
        "selected_option": "B",
        "time_taken_seconds": 45,
        "learning_signals": {"answer_changes": 1, "confidence_rating": 3}
      }
    ]
  }
  ```
- **Response (`MockResultResponse`):**
  - Evaluates scores (+4.0 for correct, -1.0 for incorrect).
  - Automatically initializes a persisted `DiagnosticRun` for incorrect answers.
  - Reveals correct answers and bilingual explanations only after submission.
  ```json
  {
    "session_id": "mock_a1b2c3d4e5f6",
    "total_score": -1.0,
    "max_possible_score": 4.0,
    "correct_count": 0,
    "incorrect_count": 1,
    "unanswered_count": 0,
    "results": [
      {
        "question_id": "q_c10_rxn_01",
        "attempt_id": "att_mock_a1b2c3d4e5f6_q_c10_rxn_01",
        "selected_option": "B",
        "is_correct": false,
        "marks_obtained": -1.0,
        "correct_option": "A",
        "explanation_en": "CuO loses oxygen to form Cu, hence it is reduced.",
        "explanation_or": "CuO ରୁ ଅମ୍ଳଜାନ ଅପସାରିତ ହୋଇ Cu ଗଠନ ହୁଏ, ତେଣୁ ଏହା ବିଜାରିତ ହୁଏ ।"
      }
    ],
    "diagnostic_runs_triggered": ["diag_87ab6c54e321"]
  }
  ```

### `GET /api/v1/mock/sessions`
Retrieves paginated history of mock assessment sessions for the authenticated learner.
- **Query Parameters**:
  - `status` (optional string): Filter by status (`in_progress`, `submitted`).
  - `class_level` (optional int): Target class level (`9`, `10`, `12`).
  - `offset` (optional int, default: `0`): Pagination offset.
  - `limit` (optional int, default: `20`, max: `100`): Results per page.
- **Response (`List[MockSessionSummary]`)**:
  ```json
  [
    {
      "session_id": "mock_a1b2c3d4e5f6",
      "class_level": 10,
      "subject_id": "sub_science",
      "status": "submitted",
      "total_questions": 5,
      "total_marks": 20.0,
      "score": 15.0,
      "correct_count": 4,
      "incorrect_count": 1,
      "started_at": "2026-10-13T10:00:00Z",
      "submitted_at": "2026-10-13T10:15:30Z"
    }
  ]
  ```

### `GET /api/v1/mock/{session_id}/active`
Allows a learner to resume an ongoing in-progress mini-mock assessment.
- **Path Parameter**: `session_id` (e.g., `mock_a1b2c3d4e5f6`)
- **Security Invariant**: Strictly returns questions without answer keys or explanations.
- **Status Codes**: Returns `400` (`INVALID_STATUS`) if the session has already been submitted, `404` (`RESOURCE_NOT_FOUND`) if not found, and `403` (`OWNERSHIP_VIOLATION`) if requested by a different user.
- **Response (`MockSessionResponse`)**: Same schema as `POST /mock/start`.

### `GET /api/v1/mock/{session_id}`
Retrieves the authoritative graded outcome of a previously submitted mini-mock session with strict ownership verification.
- **Path Parameter**: `session_id` (e.g., `mock_a1b2c3d4e5f6`)
- **Response (`MockResultResponse`)**:
  Same structure as `POST /mock/{session_id}/submit`. Returns `400` (`INVALID_STATUS`) if the session is still in progress, `404` (`RESOURCE_NOT_FOUND`) if not found, and `403` (`OWNERSHIP_VIOLATION`) if requested by a different user.

---

## 2. RAG & ChromaDB Pipeline

### `GET /api/v1/rag/health`
Returns readiness of the persistent ChromaDB collection without leaking system filesystem paths.
```json
{
  "status": "healthy",
  "collection": "nidana_curriculum_chunks",
  "indexed_records": 4,
  "embedding_model": "all-MiniLM-L6-v2",
  "dimensions": 384
}
```

### `POST /api/v1/rag/reindex`
Rebuilds the ChromaDB vector index from authoritative SQLite `content_chunks`.

### `POST /api/v1/rag/query`
Executes semantic retrieval with exact curriculum scope pre-filtering.
- **Request Body:**
  ```json
  {
    "query_text": "oxidation and reduction reaction definition",
    "class_level": 10,
    "subject_id": "sub_science",
    "language": "bilingual",
    "top_k": 3
  }
  ```
- **Response:**
  Returns grounded context and citations with source titles, locators, and page numbers.

---

## 3. WHY Engine & Mark Recovery Flow

### `POST /api/v1/diagnosis/run/{attempt_id}`
Executes the LangGraph diagnosis pipeline for an incorrect attempt.
- Evaluates hypotheses (`MISCONCEPTION`, `PREREQUISITE_GAP`, etc.).
- Retrieves 3–5 grounded ChromaDB chunks with provenance.
- Deploys up to 2 targeted diagnostic probes.
- Generates a `RecoveryReport` and schedules a repair task in the student's study plan.

### `GET /api/v1/diagnosis/reports`
Retrieves paginated mark recovery reports for the authenticated learner.
- **Query Parameters**:
  - `offset` (optional int, default: `0`): Pagination offset.
  - `limit` (optional int, default: `20`, max: `100`): Results per page.
- **Response**:
  ```json
  [
    {
      "report_id": "rep_98f7e6d5",
      "diagnostic_run_id": "diag_87ab6c54e321",
      "attempt_id": "att_mock_a1b2c3d4e5f6_q_c10_rxn_01",
      "marks_at_risk": 1.0,
      "identified_cause": "MISCONCEPTION",
      "targeted_repair": "Review CuO redox electron exchange mechanism.",
      "mastery_check_details": {"probe_id": "prb_c10_redox_01"},
      "is_verified": true,
      "verified_at": "2026-10-12T17:00:00Z"
    }
  ]
  ```

### `GET /api/v1/diagnosis/reports/{report_id}`
Retrieves a specific mark recovery report with caller ownership enforcement (`403` if accessed by another user).

### `POST /api/v1/diagnosis/reports/{report_id}/verify`
Verifies whether mark loss was recovered via follow-up mastery check or authoritatively graded follow-up attempt.
- **Request Body (`RecoveryVerifyRequest`)**:
  - `follow_up_attempt_id` (optional string): ID of a correctly evaluated server attempt demonstrating mark recovery.
  - `submitted_response` (optional dict): Learner response to the mastery check probe evaluated authoritatively against report criteria.
  - `is_mastery_correct` (optional bool): Direct verification result (backward compatible).
  ```json
  {
    "follow_up_attempt_id": "att_285778b5-4b42-47ab-98f2-018931e1465e"
  }
  ```
- **Response**:
  ```json
  {
    "report_id": "rep_98f7e6d5",
    "is_verified": true,
    "verified_at": "2026-10-12T17:00:00Z",
    "status": "RECOVERED"
  }
  ```

---

## 4. Learner Profile & Authoritative Stats

### `PATCH /api/v1/me`
Updates student preferences including Class Level (`9`, `10`, or `12`).
- **Request Body (`UserUpdate`):**
  ```json
  {
    "display_name": "Rohan Das",
    "preferred_language": "odia",
    "exam_target": "chse_class_12",
    "class_level": 10
  }
  ```
- **Response (`UserPublic`):**
  Reflects updated profile fields with `class_level`.

### `GET /api/v1/me/stats`
Authoritatively aggregates the learner's overall assessment records, accuracy, recoverable marks, recovered marks, and mark-loss category breakdown.
- **Response (`UserStatsResponse`):**
  ```json
  {
    "user_id": "user-uuid-123",
    "class_level": 10,
    "total_attempts": 25,
    "correct_attempts": 18,
    "accuracy_percentage": 72.0,
    "total_marks_obtained": 64.0,
    "recoverable_marks": 28.0,
    "recovered_marks": 16.0,
    "breakdown": {
      "english_terminology": 8.0,
      "time_pressure": 4.0,
      "concept_gaps": 16.0,
      "other": 0.0
    }
  }
  ```

---

## 5. Single Question Attempts

### `POST /api/v1/attempts`
Initializes an active attempt on the server tied to the authenticated learner.
- **Auth**: Bearer Token (Learner)
- **Request Body (`AttemptStartRequest`)**:
  ```json
  {
    "question_id": "q_c10_rxn_01",
    "variant_id": null
  }
  ```
- **Response (`AttemptResponse`)**:
  ```json
  {
    "id": "73a7b433-d11b-49e5-81b7-db075a13f897",
    "user_id": "learner-123",
    "question_id": "q_c10_rxn_01",
    "variant_id": null,
    "lifecycle_state": "in_progress",
    "submitted_response": null,
    "is_correct": null,
    "marks_obtained": 0.0,
    "time_taken_seconds": null,
    "started_at": "2026-10-13T06:54:29.540Z",
    "submitted_at": null,
    "learning_signals": {}
  }
  ```

### `POST /api/v1/attempts/{attempt_id}/submit`
Submits student answer for authoritative evaluation on the backend.
- **Auth**: Bearer Token (Learner, Ownership Enforced)
- **Request Body (`AnswerSubmitRequest`)**:
  - `extra="forbid"`: Client cannot supply `is_correct` or `marks_obtained`.
  ```json
  {
    "submitted_response": {"selected_option": "A"},
    "time_taken_seconds": 25,
    "learning_signals": {"confidence": 4}
  }
  ```
- **Idempotency & Retries**:
  - Re-submitting the exact same response returns the graded attempt idempotently.
  - Submitting a different response once submitted raises `400` (`ATTEMPT_ALREADY_SUBMITTED`).
- **Response (`AttemptResponse`)**: Returns updated attempt with `is_correct` and `marks_obtained`.

### `GET /api/v1/attempts/{attempt_id}`
Retrieves attempt state with strict ownership verification (`403` if accessed cross-user).

### `GET /api/v1/attempts`
Lists attempt history owned exclusively by the authenticated learner.
- **Query Parameters**:
  - `lifecycle_state` (optional string): `"in_progress"` or `"submitted"`
  - `question_id` (optional string)
  - `is_correct` (optional bool)
  - `offset` (optional int, default: 0)
  - `limit` (optional int, default: 50, max: 100)
- **Response**: `List[AttemptResponse]`

---

## 6. Curriculum Taxonomy & Question Banks

### `GET /api/v1/subjects` & `POST /api/v1/subjects`
- `GET`: Public listing of available academic subjects.
- `POST`: Requires `admin` or `educator` role. Creates subject.

### `GET /api/v1/chapters` & `POST /api/v1/chapters`
- `GET`: Lists curriculum chapters with optional `class_level` and `subject_id` filters.
- `POST`: Requires `admin` or `educator` role. Creates chapter.

### `GET /api/v1/concepts` & `POST /api/v1/concepts`
- `GET`: Lists learning concepts with optional `chapter_id` filter.
- `POST`: Requires `admin` or `educator` role. Creates concept.

### `GET /api/v1/questions`
Public catalog of approved questions.
- **Query Parameters**: `class_level`, `subject_id`, `language` (`"odia"`, `"english"`, `"bilingual"`), `offset`, `limit`.
- **Security Invariant**: Strictly uses `QuestionPublic`, omitting `correct_answer`, `explanation_en`, `explanation_or`, and `distractor_metadata`.

### `GET /api/v1/questions/{question_id}`
Retrieves a single question without answer keys.

### `POST /api/v1/questions`
Authoring endpoint for reviewed questions.
- **Auth**: Requires `admin` or `educator` role.
- **Request Body (`QuestionCreate`)**: Requires full answer keys, bilingual explanations, and distractor metadata.

### `GET /api/v1/questions/{question_id}/variants` & `POST /api/v1/questions/{question_id}/variants`
- `GET`: Public listing of question variants with answer keys concealed (`QuestionVariantPublic`).
- `POST`: Authoring endpoint requiring `admin` or `educator` role.

---

## 7. Study Plans & Post-Autopsy Interventions

### `GET /api/v1/study-plans/me`
Retrieves current learner's active remediation study plan and targeted repair tasks.
- **Auth**: Bearer Token (Learner)
- **Response (`Optional[StudyPlanRead]`)**:
  ```json
  {
    "id": "plan_a1b2c3d4",
    "user_id": "learner-123",
    "title": "Active Mark Recovery Plan",
    "target_exam": "chse_class_12",
    "status": "active",
    "tasks": [
      {
        "id": "task_recov_ce7182d6",
        "study_plan_id": "plan_a1b2c3d4",
        "concept_id": "cpt_c10_redox",
        "title": "Repair MISCONCEPTION",
        "reason": "Targeted repair after incorrect attempt on question q_c10_rxn_01.",
        "evidence_source": "Official Approved Textbook",
        "target_weakness": "MISCONCEPTION",
        "status": "pending",
        "due_date": null,
        "completed_at": null
      }
    ]
  }
  ```

### `PATCH /api/v1/study-plans/tasks/{task_id}`
Updates task status as student completes targeted study tasks.
- **Auth**: Bearer Token (Learner, Ownership Enforced)
- **Request Body (`StudyPlanTaskUpdate`)**:
  ```json
  {
    "status": "in_progress"
  }
  ```
- **Allowed Statuses**: `"pending"`, `"in_progress"`, `"completed"`, `"skipped"`.

---

## 8. Offline Content Packs & Sync Operations

### `GET /api/v1/sync/packs`
Lists pre-generated offline curriculum bundles for local IndexedDB / Dexie consumption.
- **Response (`List[ContentPackManifest]`)**:
  ```json
  [
    {
      "pack_id": "pack_c10_science_v1",
      "class_level": 10,
      "subject_id": "sub_science",
      "language": "bilingual",
      "version": "1.0.0",
      "content_version": "1.0.0",
      "checksum": "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "generated_at": "2026-10-13T00:00:00Z",
      "min_app_version": "1.0.0",
      "item_counts": {
        "chapters": 2,
        "concepts": 2,
        "questions": 8,
        "content_chunks": 3
      }
    }
  ]
  ```

### `GET /api/v1/sync/packs/{pack_id}`
Downloads full self-contained offline package bundle.
- **Security Invariant**: Strictly uses `QuestionPublic`, omitting answer keys to prevent client cheating during offline tests.
- **Response (`ContentPackBundle`)**: Returns `{manifest, chapters, concepts, questions, learning_chunks, offline_rules}`.

### `POST /api/v1/sync/batch`
Ingests offline attempt events queued while disconnected.
- **Auth**: Bearer Token (Learner)
- **Request Body (`SyncBatchRequest`)**:
  ```json
  {
    "events": [
      {
        "client_event_id": "evt_uuid_9876",
        "event_type": "ATTEMPT_SUBMIT",
        "payload_schema_version": "1.0.0",
        "client_timestamp": "2026-10-13T09:30:00Z",
        "payload": {
          "question_id": "q_c10_rxn_01",
          "selected_option": "A",
          "time_taken_seconds": 30
        }
      }
    ]
  }
  ```
- **Idempotency & Conflict Handling**:
  - Deduplicates events via unique `client_event_id`.
  - Replaying previously processed events returns `status: "DUPLICATE"` with the original `server_receipt_id`.
- **Response (`SyncBatchResponse`)**: Returns `{batch_id, accepted_count, duplicate_count, rejected_count, event_results}`.

---

## 9. Authentication, Permissions & Error Format

### Authentication Requirements
All protected endpoints require an `Authorization: Bearer <token>` header containing a cryptographically valid Supabase JWT.
- **JWT Algorithms Supported**: HS256 (configured via `SUPABASE_JWT_ALGORITHM`).
- **Required Claims**: `sub` (user UUID), `exp` (expiration), `aud == "authenticated"`.
- **Roles**:
  - `learner`: Access to personal profile, stats, attempts, mock sessions, study plans, sync batches, and diagnosis reports.
  - `educator` / `admin`: Authorized to author subjects, chapters, concepts, questions, variants, and trigger ChromaDB vector re-indexing.

### Ownership Boundary
Learners can only view and modify records they own (`user_id == current_user.id`).
Any cross-user attempt to access another user's attempt, mock session, study plan, or recovery report returns:
```json
{
  "error": {
    "code": "OWNERSHIP_VIOLATION",
    "message": "You do not have permission to access or modify this resource.",
    "details": null
  }
}
```

### Standard Machine-Readable Error Envelope
All error responses (4xx, 5xx) strictly follow the uniform schema:
```json
{
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable explanation of error.",
    "details": null
  }
}
```
Standard codes:
- `AUTHENTICATION_REQUIRED` (401): Missing or empty Bearer token.
- `TOKEN_EXPIRED` (401): JWT expired.
- `INVALID_TOKEN` (401): Forged, malformed, or missing required claims.
- `FORBIDDEN` (403): Caller lacks required role (e.g., non-admin calling `/rag/reindex`).
- `OWNERSHIP_VIOLATION` (403): Caller attempting to access another learner's record.
- `RESOURCE_NOT_FOUND` (404): Record does not exist.
- `VALIDATION_ERROR` (422): Input failed schema constraints or contained extra forbidden fields.
- `INVALID_STATUS` (400): Inappropriate state transition (e.g. requesting mock results prior to submission).
- `INVALID_QUESTION` (400): Submitting a question not assigned in the session.
- `ATTEMPT_ALREADY_SUBMITTED` (400): Attempting to alter a previously evaluated attempt.

---

## 10. AI Teammate Integration Scope & Explicit Boundaries

### Shared Integration Interface
The backend exposes dedicated integration surfaces designed specifically for the LangGraph & ChromaDB teammate:
1. **Curriculum Evidence Retrieval (`POST /api/v1/rag/query`)**:
   Allows querying approved syllabus chunks pre-filtered by `class_level`, `subject_id`, and `language`.
2. **Vector Store Reindexing (`POST /api/v1/rag/reindex`)**:
   Rebuilds ChromaDB from canonical SQLite `content_chunks` with deterministic metadata and content checksums.
3. **WHY Engine Diagnostic Trigger (`POST /api/v1/diagnosis/run/{attempt_id}`)**:
   Invokes the LangGraph state machine hook, persisting the run, selected probes, and mark recovery report.
4. **Mark Recovery Verification (`POST /api/v1/diagnosis/reports/{report_id}/verify`)**:
   Verifies whether a follow-up attempt authoritatively resolves the diagnosed misconception.

### Teammate Ownership Scope (Not in Backend Responsibility)
- **RAG Algorithms & Chunk Embeddings**:
  - The AI teammate is responsible for custom sentence-transformer fine-tuning, specialized Odia tokenization, and vector store retrieval ranking algorithms.
- **LangGraph Agent Workflow**:
  - The AI teammate owns multi-step prompt design, agent routing nodes, reflection loops, and live Gemini API prompting.
- **Backend Role**:
  - The backend provides clean storage adapters (`app/rag/chroma_client.py`, `app/why_engine/gemini_adapter.py`) with deterministic heuristic fallbacks so the backend and tests operate 100% reliably in offline test environments.

### Explicit Unimplemented Features (Current Gaps)
The following features are **intentionally not implemented** in this phase to prevent speculative divergence:
1. **Real-time Odia Voice/Audio Autopsy**: Vocal input recognition is not supported in the current REST contracts.
2. **School/District Multi-Tenant Analytics Dashboards**: Batch institutional analytics are outside current scope.
3. **Peer-to-Peer Mesh Sync**: Only client-to-server (`/api/v1/sync/batch`) and server-to-client (`/api/v1/sync/packs`) offline sync are supported.

