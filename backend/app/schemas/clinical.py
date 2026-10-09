from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel

class MedicationItemResponse(BaseModel):
    id: str
    medicine_name: str
    brand_name: Optional[str] = None
    generic_name: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    dose_written: Optional[str] = None
    route: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    confidence_level: str
    is_verified: bool
    status: str

    class Config:
        from_attributes = True

class PrescriptionResponse(BaseModel):
    id: str
    document_id: str
    prescriber_name: Optional[str] = None
    clinic_or_hospital: Optional[str] = None
    prescription_date: Optional[str] = None
    pharmacy_details: Optional[str] = None
    medications: List[MedicationItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ObservationResponse(BaseModel):
    id: str
    document_id: str
    test_name: str
    standardized_test_name: Optional[str] = None
    measured_value: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    reference_interval: Optional[str] = None
    ref_low: Optional[float] = None
    ref_high: Optional[float] = None
    abnormal_flag: str
    specimen: Optional[str] = None
    test_date: Optional[str] = None
    is_verified: bool
    confidence_level: str
    comments: Optional[str] = None

    class Config:
        from_attributes = True

class LabReportResponse(BaseModel):
    id: str
    document_id: str
    lab_name: Optional[str] = None
    report_date: Optional[str] = None
    specimen_type: Optional[str] = None
    accession_number: Optional[str] = None
    observations: List[ObservationResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class DischargeSummaryResponse(BaseModel):
    id: str
    document_id: str
    hospital_name: Optional[str] = None
    department: Optional[str] = None
    admission_date: Optional[str] = None
    discharge_date: Optional[str] = None
    primary_diagnosis: Optional[str] = None
    secondary_diagnoses: List[str] = []
    procedures_performed: List[str] = []
    hospital_course: Optional[str] = None
    discharge_condition: Optional[str] = None
    allergies: List[str] = []
    follow_up_instructions: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DiagnosticReportResponse(BaseModel):
    id: str
    document_id: str
    test_type: str
    exam_date: Optional[str] = None
    reporting_clinician: Optional[str] = None
    clinical_indication: Optional[str] = None
    findings: Optional[str] = None
    impression_or_conclusion: Optional[str] = None
    recommendations: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
