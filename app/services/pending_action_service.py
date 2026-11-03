import json
from datetime import datetime, timezone
from typing import Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundError, PayOpsException
from app.models.pending_action import PendingAction
from app.repositories.pending_action_repo import PendingActionRepository
from app.services.audit_service import AuditService


class PendingActionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PendingActionRepository(db)
        self.audit = AuditService(db)

    def create_pending_action(
        self,
        action_type: str,
        entity_type: str,
        entity_id: str,
        payload: dict[str, Any],
        proposed_by_user_id: str,
        ip_address: Optional[str] = None,
    ) -> PendingAction:
        action = PendingAction(
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            payload_json=json.dumps(payload, default=str),
            proposed_by_user_id=proposed_by_user_id,
            status="PENDING",
        )
        saved = self.repo.create(action)
        self.audit.log_action(
            action="PENDING_ACTION_CREATED",
            entity_type="pending_action",
            entity_id=saved.id,
            user_id=proposed_by_user_id,
            new_values={"action_type": action_type, "target_entity": f"{entity_type}:{entity_id}"},
            ip_address=ip_address,
        )
        return saved

    def get_by_id(self, action_id: str) -> PendingAction:
        action = self.repo.get_by_id(action_id)
        if not action:
            raise EntityNotFoundError("PendingAction", action_id)
        return action

    def list_pending(
        self,
        action_type: Optional[str] = None,
        status: Optional[str] = "PENDING",
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[PendingAction], int]:
        return self.repo.list_pending(action_type=action_type, status=status, skip=skip, limit=limit)

    def reject_action(
        self,
        action_id: str,
        user_id: str,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> PendingAction:
        action = self.get_by_id(action_id)
        if action.status != "PENDING":
            raise PayOpsException(f"Action '{action_id}' is already {action.status}.")

        action.status = "REJECTED"
        action.confirmed_by_user_id = user_id
        action.resolved_at = datetime.now(timezone.utc)
        saved = self.repo.update(action)

        self.audit.log_action(
            action="PENDING_ACTION_REJECTED",
            entity_type="pending_action",
            entity_id=saved.id,
            user_id=user_id,
            new_values={"reason": reason},
            ip_address=ip_address,
        )
        return saved

