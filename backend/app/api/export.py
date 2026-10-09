import json
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.clinical import (
    LaboratoryReport, LaboratoryObservation,
    Prescription, MedicationItem,
    DischargeSummary, DiagnosticReport
)
from app.models.health_intelligence import HealthTimelineEvent, HealthInsight
from app.services.fhir_service import generate_fhir_bundle
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.get("/records")
def export_user_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exports all verified medical records belonging to the patient in structured JSON format."""
    profile = current_user.profile
    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    observations = db.query(LaboratoryObservation).filter(LaboratoryObservation.user_id == current_user.id).all()
    medications = db.query(MedicationItem).filter(MedicationItem.user_id == current_user.id).all()
    timeline = db.query(HealthTimelineEvent).filter(HealthTimelineEvent.user_id == current_user.id).all()
    insights = db.query(HealthInsight).filter(HealthInsight.user_id == current_user.id).all()

    payload = {
        "platform": "Swasthya Copilot",
        "export_date": "2026-10-09T10:46:08Z",
        "patient": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "abha_id": profile.abha_id if profile else None,
            "gender": profile.gender if profile else None,
            "date_of_birth": profile.date_of_birth if profile else None,
        },
        "documents": [
            {
                "id": d.id,
                "filename": d.original_filename,
                "type": d.document_type,
                "status": d.processing_status,
                "upload_time": str(d.upload_timestamp)
            } for d in documents
        ],
        "laboratory_observations": [
            {
                "test_name": o.test_name,
                "value": o.measured_value,
                "unit": o.unit,
                "reference_interval": o.reference_interval,
                "flag": o.abnormal_flag,
                "date": o.test_date
            } for o in observations
        ],
        "medications": [
            {
                "medicine_name": m.medicine_name,
                "strength": m.strength,
                "frequency": m.frequency,
                "instructions": m.instructions,
                "status": m.status
            } for m in medications
        ],
        "timeline_events": [
            {
                "date": t.event_date,
                "type": t.event_type,
                "title": t.title,
                "summary": t.summary,
                "category": t.clinical_category,
                "is_abnormal": t.is_abnormal
            } for t in timeline
        ],
        "evidence_insights": [
            {
                "category": i.insight_category,
                "explanation_en": i.plain_language_explanation_en,
                "explanation_te": i.plain_language_explanation_te,
                "source_field": i.source_field,
                "provenance": i.model_or_template_provenance
            } for i in insights
        ]
    }

    log_audit_event(db, current_user.id, "export_json_records", "patient", current_user.id)

    json_str = json.dumps(payload, indent=2)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=swasthya_records_{current_user.id[:8]}.json"}
    )

@router.get("/fhir")
def export_fhir_bundle(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Exports patient records as an ABDM-aligned FHIR R4 Bundle JSON download."""
    bundle = generate_fhir_bundle(db=db, user=current_user)
    log_audit_event(db, current_user.id, "export_fhir_bundle", "fhir_bundle", bundle.get("id"))

    json_str = json.dumps(bundle, indent=2)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=fhir_bundle_{current_user.id[:8]}.json"}
    )
