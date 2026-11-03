from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.webhook import Event
from app.repositories.base import BaseRepository


class WebhookRepository(BaseRepository[Event]):
    def __init__(self, db: Session):
        super().__init__(Event, db)

    def get_by_event_id(self, event_id: str) -> Optional[Event]:
        return self.db.query(Event).filter(Event.event_id == event_id).first()

    def list_events(
        self,
        event_type: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Event], int]:
        query = self.db.query(Event)
        if event_type:
            query = query.filter(Event.event_type == event_type)
        if status:
            query = query.filter(Event.status == status.upper())

        total = query.count()
        items = query.order_by(Event.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

