import json
from typing import Any, Optional
from sqlalchemy.orm import Session
from app.core.logging import logger
from app.models.audit import AuditLog
from app.repositories.audit_repo import AuditRepository


class AuditService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AuditRepository(db)

    def log_action(
        self,
        action: str,
        entity_type: str,
        entity_id: str,
        user_id: Optional[str] = None,
        old_values: Optional[dict[str, Any]] = None,
        new_values: Optional[dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        """Record an immutable financial or administrative audit log entry."""
        old_json = json.dumps(old_values, default=str) if old_values else None
        new_json = json.dumps(new_values, default=str) if new_values else None

        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
            old_values=old_json,
            new_values=new_json,
            ip_address=ip_address,
        )
        created = self.repo.create(audit_entry)
        logger.info(
            f"AUDIT: [{action}] on {entity_type}:{entity_id} by user={user_id or 'SYSTEM'}"
        )
        return created

