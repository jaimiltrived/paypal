from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.pending_action import PendingAction
from app.repositories.base import BaseRepository


class PendingActionRepository(BaseRepository[PendingAction]):
    def __init__(self, db: Session):
        super().__init__(PendingAction, db)

    def list_pending(
        self,
        action_type: Optional[str] = None,
        status: Optional[str] = "PENDING",
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[PendingAction], int]:
        query = self.db.query(PendingAction)
        if status:
            query = query.filter(PendingAction.status == status.upper())
        if action_type:
            query = query.filter(PendingAction.action_type == action_type)

        total = query.count()
        items = query.order_by(PendingAction.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

