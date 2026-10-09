import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    content_hash = Column(String(64), nullable=False, index=True)  # SHA-256 for duplicate detection
    page_count = Column(Integer, default=1)
    
    # Classification: prescription, lab_report, discharge_summary, diagnostic_report, unknown
    document_type = Column(String(50), default="unknown", index=True)
    # Status: uploaded, processing, review_required, completed, failed
    processing_status = Column(String(50), default="uploaded", index=True)
    error_message = Column(Text, nullable=True)
    ocr_engine_used = Column(String(50), default="auto")
    has_uncertain_fields = Column(Boolean, default=False)
    
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    completed_timestamp = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document", cascade="all, delete-orphan")
    extracted_fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    reviews = relationship("DocumentReview", back_populates="document", cascade="all, delete-orphan")
    
    # Clinical entities linked to this document
    prescriptions = relationship("Prescription", back_populates="document", cascade="all, delete-orphan")
    lab_reports = relationship("LaboratoryReport", back_populates="document", cascade="all, delete-orphan")
    discharge_summaries = relationship("DischargeSummary", back_populates="document", cascade="all, delete-orphan")
    diagnostic_reports = relationship("DiagnosticReport", back_populates="document", cascade="all, delete-orphan")
    timeline_events = relationship("HealthTimelineEvent", back_populates="document", cascade="all, delete-orphan")
    insights = relationship("HealthInsight", back_populates="document", cascade="all, delete-orphan")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    raw_text = Column(Text, default="")
    preprocessed_image_path = Column(String(255), nullable=True)
    ocr_confidence = Column(Float, default=1.0)
    language_detected = Column(String(10), default="en")

    document = relationship("Document", back_populates="pages")


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False, index=True)
    field_type = Column(String(50), default="string")  # string, number, date, range, medication, observation
    original_value = Column(Text, nullable=True)
    corrected_value = Column(Text, nullable=True)
    confidence_level = Column(String(20), default="high")  # high, medium, low
    source_text = Column(Text, nullable=True)
    source_page = Column(Integer, default=1)
    bounding_box = Column(Text, nullable=True)  # JSON {x, y, w, h}
    is_manually_corrected = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    document = relationship("Document", back_populates="extracted_fields")


class DocumentReview(Base):
    __tablename__ = "document_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewed_at = Column(DateTime, default=datetime.utcnow)
    corrections_count = Column(Integer, default=0)
    review_notes = Column(Text, nullable=True)
    status = Column(String(50), default="confirmed")  # confirmed, rejected

    document = relationship("Document", back_populates="reviews")
