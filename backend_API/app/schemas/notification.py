import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificationCreate(BaseModel):
    user_id: uuid.UUID
    notification_type: str
    title: str
    message: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    notification_id: int
    user_id: uuid.UUID
    notification_type: str
    title: str
    message: str
    is_read: bool
    read_at: Optional[datetime]
    related_entity_type: Optional[str]
    related_entity_id: Optional[str]
    created_at: datetime