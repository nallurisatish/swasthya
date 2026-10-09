import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class HealthTimelineEvent(Base):
    __tablename__ = "health_timeline_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    event_date = Column(String(50), nullable=False, index=True)
    # Event types: prescription, lab_result, discharge, diagnostic, document_upload
    event_type = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    clinical_category = Column(String(100), default="General", index=True)
    is_abnormal = Column(Boolean, default=False, index=True)
    is_verified = Column(Boolean, default=False)
    reference_id = Column(String(100), nullable=True)  # Links to observation_id, prescription_id, etc.
    reference_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="timeline_events")
    document = relationship("Document", back_populates="timeline_events")


class HealthInsight(Base):
    __tablename__ = "health_insights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    observation_id = Column(String(36), ForeignKey("laboratory_observations.id", ondelete="SET NULL"), nullable=True)
    medication_id = Column(String(36), ForeignKey("medication_items.id", ondelete="SET NULL"), nullable=True)
    
    # Categories: abnormal_lab, medication_adherence, trend_alert, preventive_care, follow_up_reminder
    insight_category = Column(String(50), nullable=False, index=True)
    plain_language_explanation_en = Column(Text, nullable=False)
    plain_language_explanation_te = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    
    # Evidence tracing: serialized JSON with test_name, value, unit, ref_range, dates, doctor instructions
    supporting_values = Column(Text, default="{}")
    source_page = Column(Integer, default=1)
    source_field = Column(String(100), nullable=True)
    safety_note = Column(Text, default="This insight is informational only and not a substitute for clinical advice.")
    # Model provenance: e.g. "qwen2.5:7b-ollama" or "Deterministic Evidence-Grounded Engine (Demo/Local Mode)"
    model_or_template_provenance = Column(String(100), default="Deterministic Evidence-Grounded Engine (Demo/Local Mode)")
    review_status = Column(String(50), default="verified")  # verified, pending
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="insights")
    document = relationship("Document", back_populates="insights")
