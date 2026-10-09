from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class TimelineEventResponse(BaseModel):
    id: str
    document_id: Optional[str] = None
    event_date: str
    event_type: str
    title: str
    summary: str
    clinical_category: str
    is_abnormal: bool
    is_verified: bool
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LabTrendPoint(BaseModel):
    date: str
    value: float
    display_value: str
    unit: str
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    reference_interval_str: Optional[str] = None
    abnormal_flag: str
    document_id: str
    document_name: str

class LabTrendResponse(BaseModel):
    test_name: str
    standardized_test_name: str
    unit: str
    data_points: List[LabTrendPoint] = []
    has_incompatible_units: bool = False
    earliest_date: Optional[str] = None
    latest_date: Optional[str] = None
    trend_direction: str = "stable"  # increased, decreased, stable, insufficient_data
    clinical_caution: str = "Numerical variation over time must be interpreted in clinical context by a physician."

class HealthOverviewStats(BaseModel):
    total_documents: int
    pending_review: int
    completed_documents: int
    abnormal_observations_count: int
    active_medications_count: int
    latest_health_events: List[TimelineEventResponse] = []
