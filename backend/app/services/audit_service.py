import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import AuditEvent

def log_audit_event(
    db: Session,
    user_id: Optional[str],
    event_type: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = "127.0.0.1"
) -> AuditEvent:
    """Creates a secure audit trail event record."""
    event = AuditEvent(
        user_id=user_id,
        event_type=event_type,
        resource_type=resource_type,
        resource_id=resource_id,
        details=json.dumps(details or {}),
        ip_address=ip_address
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
