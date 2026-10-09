from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentSummaryResponse
from app.services.health_summary_ai import generate_grounded_summary, is_ollama_available
from app.config import settings

router = APIRouter()

@router.post("/summarize/{document_id}", response_model=DocumentSummaryResponse)
def get_document_summary(
    document_id: str,
    language: Optional[str] = Query("en", pattern="^(en|te)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a structured, evidence-grounded summary for a verified document.
    Includes what the document says, key findings, reference range anomalies,
    historical comparisons, clinician questions, and source references.
    """
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    summary = generate_grounded_summary(db=db, document=doc, target_language=language or "en")
    return summary

@router.get("/provider-status")
def get_ai_provider_status():
    """
    Returns the real-time operational status of AI intelligence providers.
    Explicitly labels whether an external/local LLM or deterministic engine is serving summaries.
    """
    ollama_active = is_ollama_available()
    return {
        "configured_provider": settings.LLM_PROVIDER,
        "ollama_available": ollama_active,
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "ollama_model": settings.OLLAMA_MODEL,
        "active_engine": f"Ollama ({settings.OLLAMA_MODEL})" if ollama_active else "Deterministic Evidence-Grounded Engine (Demo/Local Mode)",
        "mode_description": "Production LLM service active" if ollama_active else "Running local deterministic healthcare reasoning & templating engine (zero API cost, 100% reproducible)"
    }
