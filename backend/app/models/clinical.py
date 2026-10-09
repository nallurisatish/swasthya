import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    prescriber_name = Column(String(255), nullable=True)
    clinic_or_hospital = Column(String(255), nullable=True)
    prescription_date = Column(String(50), nullable=True, index=True)
    pharmacy_details = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="prescriptions")
    medications = relationship("MedicationItem", back_populates="prescription", cascade="all, delete-orphan")


class MedicationItem(Base):
    __tablename__ = "medication_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    prescription_id = Column(String(36), ForeignKey("prescriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    medicine_name = Column(String(255), nullable=False, index=True)
    brand_name = Column(String(255), nullable=True)
    generic_name = Column(String(255), nullable=True)
    dosage_form = Column(String(50), nullable=True)  # Tablet, Capsule, Syrup, Injection, Ointment
    strength = Column(String(100), nullable=True)  # e.g., 500mg, 10mg/5ml
    dose_written = Column(String(100), nullable=True)  # e.g., 1 tablet
    route = Column(String(50), default="Oral")  # Oral, Topical, IV
    frequency = Column(String(100), nullable=True)  # e.g., Once daily, Twice daily, 1-0-1
    duration = Column(String(100), nullable=True)  # e.g., 5 days, 1 month, Ongoing
    instructions = Column(String(255), nullable=True)  # e.g., After food, Before food
    confidence_level = Column(String(20), default="high")  # high, medium, low
    is_verified = Column(Boolean, default=False)
    # Clinical medication status: active, historical, uncertain
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    prescription = relationship("Prescription", back_populates="medications")


class LaboratoryReport(Base):
    __tablename__ = "laboratory_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    lab_name = Column(String(255), nullable=True)
    report_date = Column(String(50), nullable=True, index=True)
    specimen_type = Column(String(100), nullable=True)  # Blood, Urine, Serum
    specimen_collection_date = Column(String(50), nullable=True)
    accession_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="lab_reports")
    observations = relationship("LaboratoryObservation", back_populates="lab_report", cascade="all, delete-orphan")


class LaboratoryObservation(Base):
    __tablename__ = "laboratory_observations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lab_report_id = Column(String(36), ForeignKey("laboratory_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    test_name = Column(String(255), nullable=False, index=True)
    standardized_test_name = Column(String(255), nullable=True, index=True)  # e.g. "HbA1c", "Fasting Blood Glucose"
    measured_value = Column(String(100), nullable=False)  # As written in report, e.g. "7.2"
    numeric_value = Column(Float, nullable=True)  # Extracted float for analytics
    unit = Column(String(50), nullable=True)  # e.g. "%", "mg/dL", "mmol/L"
    reference_interval = Column(String(100), nullable=True)  # As printed on report, e.g. "4.0 - 5.6"
    ref_low = Column(Float, nullable=True)
    ref_high = Column(Float, nullable=True)
    # Abnormal flags: NORMAL, HIGH, LOW, ABNORMAL, CRITICAL
    abnormal_flag = Column(String(50), default="NORMAL", index=True)
    specimen = Column(String(100), nullable=True)
    test_date = Column(String(50), nullable=True, index=True)
    is_verified = Column(Boolean, default=False)
    comments = Column(Text, nullable=True)
    confidence_level = Column(String(20), default="high")
    created_at = Column(DateTime, default=datetime.utcnow)

    lab_report = relationship("LaboratoryReport", back_populates="observations")


class DischargeSummary(Base):
    __tablename__ = "discharge_summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    hospital_name = Column(String(255), nullable=True)
    department = Column(String(100), nullable=True)
    admission_date = Column(String(50), nullable=True)
    discharge_date = Column(String(50), nullable=True, index=True)
    primary_diagnosis = Column(Text, nullable=True)
    secondary_diagnoses = Column(Text, default="[]")  # JSON string array
    procedures_performed = Column(Text, default="[]")  # JSON string array
    hospital_course = Column(Text, nullable=True)
    discharge_condition = Column(String(100), nullable=True)
    allergies = Column(Text, default="[]")  # JSON string array
    follow_up_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="discharge_summaries")


class DiagnosticReport(Base):
    __tablename__ = "diagnostic_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    test_type = Column(String(100), nullable=False)  # Ultrasound, ECG, X-Ray, CT Scan, MRI
    exam_date = Column(String(50), nullable=True, index=True)
    reporting_clinician = Column(String(255), nullable=True)
    clinical_indication = Column(Text, nullable=True)
    findings = Column(Text, nullable=True)
    impression_or_conclusion = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="diagnostic_reports")
