from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User, ConsentRecord
from app.schemas.auth import ConsentResponse, ConsentUpdate
from app.services.audit_service import log_audit_event

router = APIRouter()

DEFAULT_CONSENTS = [
    {
        "type": "clinical_data_sharing",
        "details": "Allows sharing of verified longitudinal records with authorized ABDM/clinician portals."
    },
    {
        "type": "ai_processing",
        "details": "Consents to natural language health summary generation and medical explanation assistance."
    },
    {
        "type": "research_anonymized",
        "details": "Permits de-identified epidemiological and health outcome analytics."
    }
]

@router.get("", response_model=List[ConsentResponse])
def get_consents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all consent directives for the current patient."""
    records = db.query(ConsentRecord).filter(ConsentRecord.user_id == current_user.id).all()
    if not records:
        # Seed default consent records if none exist
        for item in DEFAULT_CONSENTS:
            rec = ConsentRecord(
                user_id=current_user.id,
                consent_type=item["type"],
                status="granted",
                details=item["details"]
            )
            db.add(rec)
        db.commit()
        records = db.query(ConsentRecord).filter(ConsentRecord.user_id == current_user.id).all()
    return records

@router.post("", response_model=ConsentResponse)
def update_consent(
    consent_in: ConsentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates status (granted or revoked) of a specific consent directive."""
    rec = db.query(ConsentRecord).filter(
        ConsentRecord.user_id == current_user.id,
        ConsentRecord.consent_type == consent_in.consent_type
    ).first()

    if not rec:
        rec = ConsentRecord(
            user_id=current_user.id,
            consent_type=consent_in.consent_type,
            status=consent_in.status,
            details=consent_in.details
        )
        db.add(rec)
    else:
        rec.status = consent_in.status
        if consent_in.details:
            rec.details = consent_in.details
        if consent_in.status == "revoked":
            rec.revoked_at = datetime.utcnow()
        else:
            rec.revoked_at = None
            rec.granted_at = datetime.utcnow()

    db.commit()
    db.refresh(rec)

    log_audit_event(
        db, current_user.id, "consent_update", "consent_record", rec.id,
        {"consent_type": rec.consent_type, "status": rec.status}
    )
    return rec
