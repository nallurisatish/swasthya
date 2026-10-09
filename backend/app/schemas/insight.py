import json
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, field_validator

class HealthInsightResponse(BaseModel):
    id: str
    document_id: Optional[str] = None
    observation_id: Optional[str] = None
    medication_id: Optional[str] = None
    insight_category: str
    plain_language_explanation_en: str
    plain_language_explanation_te: str
    language: str
    supporting_values: Dict[str, Any] = {}
    source_page: int = 1
    source_field: Optional[str] = None
    safety_note: str
    model_or_template_provenance: str
    review_status: str
    created_at: datetime

    @field_validator("supporting_values", mode="before")
    @classmethod
    def parse_supporting_values(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return {}
        return v or {}

    class Config:
        from_attributes = True
