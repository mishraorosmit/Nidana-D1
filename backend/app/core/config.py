"""Application configuration settings using pydantic-settings."""
import os
from enum import Enum
from functools import lru_cache
from typing import List, Optional, Union

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppEnvironment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"


class Settings(BaseSettings):
    """Central application settings with strong validation."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "NIDANA-Backend"
    APP_VERSION: str = "0.2.0"
    APP_ENV: AppEnvironment = AppEnvironment.DEVELOPMENT
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS settings
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Authoritative Database (SQLite)
    SQLITE_DATABASE_URL: str = Field(
        default="sqlite:///./data/nidana.db",
        description="Authoritative SQLite database file path.",
    )
    DATABASE_URL: str = Field(
        default="",
        description="Optional database URL override. Falls back to SQLITE_DATABASE_URL if omitted.",
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if not v:
            return ""
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+psycopg2://", 1)
        if v.startswith("postgresql://") and "+psycopg2" not in v:
            return v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v

    @property
    def effective_database_url(self) -> str:
        return self.DATABASE_URL if self.DATABASE_URL else self.SQLITE_DATABASE_URL

    # ChromaDB Vector Store
    CHROMA_PERSIST_DIRECTORY: str = Field(
        default="./data/chroma",
        description="Directory for local persistent ChromaDB vector store.",
    )
    CHROMA_COLLECTION_NAME: str = Field(
        default="nidana_curriculum_chunks",
        description="ChromaDB collection for approved curriculum chunks.",
    )

    # Gemini & AI Configuration
    GEMINI_API_KEY: Optional[str] = Field(
        default=None,
        description="API key for Gemini LLM adapter. Optional in local/test double mode.",
    )
    GEMINI_MODEL: str = Field(
        default="gemini-1.5-flash",
        description="Default model name for Gemini adapter.",
    )

    # Optional Observability (Langfuse)
    LANGFUSE_PUBLIC_KEY: Optional[str] = Field(default=None, description="Optional Langfuse public key.")
    LANGFUSE_SECRET_KEY: Optional[str] = Field(default=None, description="Optional Langfuse secret key.")
    LANGFUSE_HOST: Optional[str] = Field(default="https://cloud.langfuse.com", description="Langfuse host URL.")

    # JWT Authentication & Security
    SUPABASE_URL: str = Field(
        default="https://placeholder.supabase.co",
        description="Supabase project URL (retained for backward compatibility).",
    )
    SUPABASE_ANON_KEY: str = Field(
        default="placeholder-anon-key",
        description="Supabase anonymous client key.",
    )
    SUPABASE_SERVICE_ROLE_KEY: str = Field(
        default="",
        description="Supabase service role secret.",
    )
    SUPABASE_JWT_SECRET: str = Field(
        default="nidana-dev-secret-key-32-chars-minimum-sample!!",
        description="JWT secret for server-side token signature verification.",
    )
    SUPABASE_JWT_AUDIENCE: str = Field(
        default="authenticated",
        description="Expected audience in JWTs.",
    )
    SUPABASE_JWT_ALGORITHM: str = Field(
        default="HS256",
        description="Expected JWT signature algorithm.",
    )

    # Security Guardrails Validation
    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.APP_ENV == AppEnvironment.PRODUCTION:
            if "*" in self.CORS_ORIGINS:
                raise ValueError("CORS wildcard ('*') is strictly disallowed in production environment.")
            if "placeholder" in self.SUPABASE_JWT_SECRET or len(self.SUPABASE_JWT_SECRET) < 16:
                raise ValueError("A secure SUPABASE_JWT_SECRET must be configured in production.")
        return self


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
