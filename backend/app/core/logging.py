"""Structured logging configuration with automatic redaction of sensitive credentials and PII."""

import json
import logging
import re
import sys
from datetime import datetime, timezone
from typing import Any, Dict


SENSITIVE_PATTERNS = [
    (re.compile(r"(Bearer\s+)[A-Za-z0-9\-._~+/]+=*", re.IGNORECASE), r"\1[REDACTED]"),
    (
        re.compile(
            r'("(?:password|token|secret|api_key|service_role_key|jwt|access_token|refresh_token|supabase_key|private_key|phone|mobile)":\s*")[^"]+(")',
            re.IGNORECASE,
        ),
        r"\1[REDACTED]\2",
    ),
    (
        re.compile(
            r"(password|token|secret|api_key|access_token|refresh_token|cookie)=[^&\s]+",
            re.IGNORECASE,
        ),
        r"\1=[REDACTED]",
    ),
    (re.compile(r"(Cookie:\s*)[^\r\n]+", re.IGNORECASE), r"\1[REDACTED]"),
    (re.compile(r"(Authorization:\s*)[^\r\n]+", re.IGNORECASE), r"\1[REDACTED]"),
]


class RedactingFormatter(logging.Formatter):
    """Custom formatter that outputs JSON structured log entries and redacts secrets."""

    def format(self, record: logging.LogRecord) -> str:
        message = record.getMessage()
        for pattern, repl in SENSITIVE_PATTERNS:
            message = pattern.sub(repl, message)

        log_data: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": message,
        }

        if record.exc_info:
            # Format exception safely without printing sensitive local variables
            log_data["exception"] = self.formatException(record.exc_info)

        if hasattr(record, "request_id"):
            log_data["request_id"] = getattr(record, "request_id")

        return json.dumps(log_data)


def setup_logging(log_level: str = "INFO") -> None:
    """Initialize application root logger with redacting JSON formatter."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Remove existing handlers to prevent duplicates
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(RedactingFormatter())
    root_logger.addHandler(handler)
