from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.clinical import LaboratoryObservation, MedicationItem
from app.models.health_intelligence import HealthTimelineEvent, HealthInsight
from app.schemas.health import (
    TimelineEventResponse, LabTrendResponse,
    LabTrendPoint, HealthOverviewStats
)
from app.schemas.clinical import ObservationResponse
from app.schemas.insight import HealthInsightResponse

router = APIRouter()

@router.get("/timeline", response_model=List[TimelineEventResponse])
def get_health_timeline(
    clinical_category: Optional[str] = None,
    is_abnormal: Optional[bool] = None,
    is_verified: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the longitudinal health timeline in chronological order (newest first).
    Supports clinical category and abnormality filters.
    """
    query = db.query(HealthTimelineEvent).filter(HealthTimelineEvent.user_id == current_user.id)
    if clinical_category:
        query = query.filter(HealthTimelineEvent.clinical_category == clinical_category)
    if is_abnormal is not None:
        query = query.filter(HealthTimelineEvent.is_abnormal == is_abnormal)
    if is_verified is not None:
        query = query.filter(HealthTimelineEvent.is_verified == is_verified)

    return query.order_by(HealthTimelineEvent.event_date.desc()).all()

@router.get("/summary", response_model=HealthOverviewStats)
def get_health_overview_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculates dashboard metrics grounded strictly in verified database data."""
    total_docs = db.query(Document).filter(Document.user_id == current_user.id).count()
    pending = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.processing_status == "review_required"
    ).count()
    completed = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.processing_status == "completed"
    ).count()

    abnormal_count = db.query(LaboratoryObservation).filter(
        LaboratoryObservation.user_id == current_user.id,
        LaboratoryObservation.abnormal_flag.in_(["HIGH", "LOW", "ABNORMAL", "CRITICAL"])
    ).count()

    active_meds = db.query(MedicationItem).filter(
        MedicationItem.user_id == current_user.id,
        MedicationItem.status == "active"
    ).count()

    recent_events = db.query(HealthTimelineEvent).filter(
        HealthTimelineEvent.user_id == current_user.id
    ).order_by(HealthTimelineEvent.event_date.desc()).limit(5).all()

    return HealthOverviewStats(
        total_documents=total_docs,
        pending_review=pending,
        completed_documents=completed,
        abnormal_observations_count=abnormal_count,
        active_medications_count=active_meds,
        latest_health_events=recent_events
    )

@router.get("/observations", response_model=List[ObservationResponse])
def get_laboratory_observations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all recorded laboratory test observations for the user."""
    return db.query(LaboratoryObservation).filter(
        LaboratoryObservation.user_id == current_user.id
    ).order_by(LaboratoryObservation.test_date.desc()).all()

@router.get("/trends/{test_name}", response_model=LabTrendResponse)
def get_lab_trends(
    test_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns time-series data for a selected laboratory test.
    Validates unit comparability and computes trend direction.
    """
    obs_list = db.query(LaboratoryObservation).filter(
        LaboratoryObservation.user_id == current_user.id,
        LaboratoryObservation.test_name.ilike(f"%{test_name}%"),
        LaboratoryObservation.numeric_value.isnot(None)
    ).order_by(LaboratoryObservation.test_date.asc()).all()

    if not obs_list:
        return LabTrendResponse(
            test_name=test_name,
            standardized_test_name=test_name,
            unit="N/A",
            data_points=[],
            trend_direction="insufficient_data"
        )

    # Unit comparability check
    units = set((o.unit or "").lower() for o in obs_list if o.unit)
    has_incompatible = len(units) > 1

    data_points = []
    for o in obs_list:
        doc = db.query(Document).filter(Document.id == o.document_id).first()
        doc_name = doc.original_filename if doc else "Laboratory Report"

        data_points.append(LabTrendPoint(
            date=o.test_date or "Unknown",
            value=o.numeric_value or 0.0,
            display_value=o.measured_value,
            unit=o.unit or "",
            reference_low=o.ref_low,
            reference_high=o.ref_high,
            reference_interval_str=o.reference_interval,
            abnormal_flag=o.abnormal_flag,
            document_id=o.document_id,
            document_name=doc_name
        ))

    # Trend direction calculation
    direction = "stable"
    if len(data_points) >= 2:
        first_val = data_points[0].value
        last_val = data_points[-1].value
        diff = last_val - first_val
        if diff > 0.05 * first_val:
            direction = "increased"
        elif diff < -0.05 * first_val:
            direction = "decreased"

    primary_unit = obs_list[0].unit or ""

    return LabTrendResponse(
        test_name=obs_list[0].test_name,
        standardized_test_name=obs_list[0].standardized_test_name or obs_list[0].test_name,
        unit=primary_unit,
        data_points=data_points,
        has_incompatible_units=has_incompatible,
        earliest_date=data_points[0].date if data_points else None,
        latest_date=data_points[-1].date if data_points else None,
        trend_direction=direction
    )

@router.get("/insights", response_model=List[HealthInsightResponse])
def get_health_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evidence-Linked Health Insights:
    Returns AI-generated insights linked directly to source documents and verified measurements.
    """
    return db.query(HealthInsight).filter(
        HealthInsight.user_id == current_user.id
    ).order_by(HealthInsight.created_at.desc()).all()
