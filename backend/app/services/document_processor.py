import hashlib
import uuid
import mimetypes
from pathlib import Path
from typing import Tuple, List, Optional
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.document import Document, DocumentPage, ExtractedField
from app.services.ocr_engine import extract_text_from_pdf, run_ocr_on_image
from app.services.classifier import classify_medical_document
from app.services.field_extractor import extract_structured_fields

def validate_uploaded_file(file: UploadFile) -> Tuple[str, str]:
    """Validates file extension and mime type."""
    filename = file.filename or "unnamed_document"
    ext = Path(filename).suffix.lower().lstrip(".")
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    mime_type, _ = mimetypes.guess_type(filename)
    mime = file.content_type or mime_type or "application/octet-stream"
    return filename, ext

def compute_sha256(content: bytes) -> str:
    """Computes SHA-256 hash of byte content."""
    hasher = hashlib.sha256()
    hasher.update(content)
    return hasher.hexdigest()

def save_and_process_document(
    db: Session,
    user_id: str,
    file_bytes: bytes,
    original_filename: str,
    content_type: str
) -> Document:
    """
    Core document processing pipeline:
    1. Validation & content hashing
    2. Check for duplicate upload
    3. Secure disk storage
    4. Text extraction (PDF / OCR)
    5. Document classification
    6. Structured medical field extraction
    7. Database persistence with 'review_required' status
    """
    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)}MB."
        )

    content_hash = compute_sha256(file_bytes)
    ext = Path(original_filename).suffix.lower().lstrip(".")
    
    # Check duplicate for this user
    existing = db.query(Document).filter(
        Document.user_id == user_id,
        Document.content_hash == content_hash
    ).first()
    if existing:
        return existing

    # Generate secure unique file name
    stored_filename = f"{uuid.uuid4().hex}.{ext}"
    stored_path = settings.UPLOAD_DIR / stored_filename
    with open(stored_path, "wb") as f:
        f.write(file_bytes)

    # Initialize Document Record
    doc = Document(
        user_id=user_id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_size=len(file_bytes),
        mime_type=content_type,
        content_hash=content_hash,
        processing_status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Extraction step
    all_pages_text: List[Tuple[int, str]] = []
    engine_used = "pypdf"
    
    if ext == "pdf":
        all_pages_text = extract_text_from_pdf(stored_path)
        doc.page_count = max(1, len(all_pages_text))
    else:
        # Image OCR
        ocr_text, conf, engine = run_ocr_on_image(stored_path)
        all_pages_text = [(1, ocr_text)]
        doc.page_count = 1
        engine_used = engine

    doc.ocr_engine_used = engine_used

    # Save pages
    full_text_corpus = ""
    for page_num, p_text in all_pages_text:
        full_text_corpus += f"\n{p_text}"
        page_rec = DocumentPage(
            document_id=doc.id,
            page_number=page_num,
            raw_text=p_text,
            ocr_confidence=0.95 if ext == "pdf" else 0.85,
            language_detected="en"
        )
        db.add(page_rec)

    # Classification
    classified_type, confidence = classify_medical_document(full_text_corpus)
    doc.document_type = classified_type

    # Extract structured candidate fields
    has_low_conf = False
    for page_num, p_text in all_pages_text:
        fields = extract_structured_fields(classified_type, p_text, page_num)
        for f in fields:
            if f.get("confidence_level") == "low":
                has_low_conf = True
            extracted_obj = ExtractedField(
                document_id=doc.id,
                field_name=f["field_name"],
                field_type=f["field_type"],
                original_value=f["original_value"],
                corrected_value=f["corrected_value"],
                confidence_level=f["confidence_level"],
                source_text=f["source_text"],
                source_page=f["source_page"],
                is_verified=False
            )
            db.add(extracted_obj)

    doc.has_uncertain_fields = has_low_conf
    doc.processing_status = "review_required"
    db.commit()
    db.refresh(doc)
    return doc
