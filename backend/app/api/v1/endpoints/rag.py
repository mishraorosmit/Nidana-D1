"""RAG API endpoints for ChromaDB inspection, querying, and SQLite reconciliation."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.constants import UserRole
from app.core.security import AuthenticatedUser, get_current_user, require_role
from app.rag.chroma_client import ChromaVectorIndex
from app.rag.provenance import build_grounded_context

router = APIRouter(prefix="/rag", tags=["RAG / ChromaDB"])


class RagQueryRequest(BaseModel):
    query_text: str = Field(description="Search or diagnosis query string")
    class_level: int = Field(default=10, description="Target Class level (9, 10, or 12)")
    subject_id: Optional[str] = Field(default=None)
    chapter_id: Optional[str] = Field(default=None)
    language: Optional[str] = Field(default="bilingual")
    top_k: int = Field(default=4, ge=1, le=10)


class RagQueryResponse(BaseModel):
    has_sufficient_evidence: bool
    citations: List[Dict[str, Any]]
    grounded_text: str
    chunks: List[Dict[str, Any]]


_index_instance: Optional[ChromaVectorIndex] = None


def get_chroma_index() -> ChromaVectorIndex:
    global _index_instance
    if _index_instance is None:
        _index_instance = ChromaVectorIndex()
    return _index_instance


@router.get("/health", status_code=status.HTTP_200_OK, summary="Inspect ChromaDB vector store health")
def get_rag_health(
    index: ChromaVectorIndex = Depends(get_chroma_index),
) -> Dict[str, Any]:
    return index.get_health()


@router.post("/reindex", status_code=status.HTTP_200_OK, summary="Rebuild ChromaDB from canonical SQLite chunks")
def reindex_from_sqlite(
    db: Session = Depends(get_db),
    index: ChromaVectorIndex = Depends(get_chroma_index),
    current_user: AuthenticatedUser = Depends(require_role(UserRole.ADMIN, UserRole.EDUCATOR)),
) -> Dict[str, Any]:
    return index.rebuild_from_sqlite(db)


@router.post("/query", response_model=RagQueryResponse, status_code=status.HTTP_200_OK, summary="Query approved syllabus chunks")
def query_rag_chunks(
    payload: RagQueryRequest,
    index: ChromaVectorIndex = Depends(get_chroma_index),
) -> RagQueryResponse:
    chunks = index.query(
        query_text=payload.query_text,
        class_level=payload.class_level,
        subject_id=payload.subject_id,
        chapter_id=payload.chapter_id,
        language=payload.language,
        top_k=payload.top_k,
    )
    context_data = build_grounded_context(chunks)
    return RagQueryResponse(
        has_sufficient_evidence=context_data["has_sufficient_evidence"],
        citations=context_data["citations"],
        grounded_text=context_data["grounded_text"],
        chunks=chunks,
    )
