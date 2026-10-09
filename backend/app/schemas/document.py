from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ExtractedFieldResponse(BaseModel):
    id: str
    document_id: str
    field_name: str
    field_type: str
    original_value: Optional[str] = None
    corrected_value: Optional[str] = None
    confidence_level: str  # high, medium, low
    source_text: Optional[str] = None
    source_page: int = 1
    bounding_box: Optional[str] = None
    is_manually_corrected: bool = False
    is_verified: bool = False

    class Config:
        from_attributes = True

class ExtractedFieldUpdate(BaseModel):
    id: str
    corrected_value: str
    is_verified: bool = True

class DocumentPageResponse(BaseModel):
    id: str
    page_number: int
    raw_text: str
    ocr_confidence: float
    language_detected: str

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    original_filename: str
    stored_filename: str
    file_size: int
    mime_type: str
    content_hash: str
    page_count: int
    document_type: str
    processing_status: str
    error_message: Optional[str] = None
    ocr_engine_used: str
    has_uncertain_fields: bool
    upload_timestamp: datetime
    completed_timestamp: Optional[datetime] = None
    extracted_fields: List[ExtractedFieldResponse] = []

    class Config:
        from_attributes = True

class DocumentConfirmRequest(BaseModel):
    field_updates: List[ExtractedFieldUpdate] = []
    review_notes: Optional[str] = None

class AbnormalFindingItem(BaseModel):
    test_name: str
    measured_value: str
    unit: Optional[str] = None
    reference_interval: Optional[str] = None
    abnormal_flag: str
    explanation: str

class HistoricalComparisonItem(BaseModel):
    test_name: str
    previous_date: str
    previous_value: str
    current_date: str
    current_value: str
    unit: str
    trend: str  # increased, decreased, stable
    cautious_note: str

class DocumentSummaryResponse(BaseModel):
    document_id: str
    language: str = "en"
    what_this_document_says: str
    key_findings: List[str]
    results_outside_reference_range: List[AbnormalFindingItem]
    historical_comparison: List[HistoricalComparisonItem]
    questions_for_clinician: List[str]
    important_documented_instructions: List[str]
    source_references: List[Dict[str, Any]]
    disclaimer: str = (
        "This AI-generated explanation is for informational purposes only. "
        "It is not a diagnosis or a substitute for advice from a qualified healthcare professional."
    )
    model_provenance: str
