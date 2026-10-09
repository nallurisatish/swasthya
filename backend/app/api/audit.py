from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User, AuditEvent
from app.schemas.auth import AuditEventResponse

router = APIRouter()

@router.get("", response_model=List[AuditEventResponse])
def get_audit_trail(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns immutable security and clinical audit events for the authenticated patient."""
    return db.query(AuditEvent).filter(
        AuditEvent.user_id == current_user.id
    ).order_by(AuditEvent.timestamp.desc()).limit(50).all()
