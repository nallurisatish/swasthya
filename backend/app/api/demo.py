from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.user import User
from app.schemas.auth import Token
from app.services.demo_dataset import seed_demo_data, DEMO_USER_EMAIL
from app.services.auth_service import create_access_token

router = APIRouter()

@router.post("/load", response_model=Token)
def load_demo_data_endpoint(db: Session = Depends(get_db)):
    """
    1-Click Demo Loader:
    Seeds complete synthetic hackathon scenario:
    - Patient Sita Ramanathan (ABHA: 91-9876-5432-1098)
    - 2 Lab reports showing longitudinal trend (HbA1c & Fasting Glucose improvements)
    - 1 Prescription with Metformin & Telmisartan
    - 1 Discharge summary from KIMS Cardiology
    - 1 Diagnostic report (Ultrasound abdomen)
    - 1 Document awaiting human-in-the-loop review
    - 3 Evidence-linked health insights with 'View Source' citations
    Returns authenticated session token for instant demonstration.
    """
    demo_user = seed_demo_data(db)
    token = create_access_token({"sub": demo_user.id, "user_id": demo_user.id, "email": demo_user.email})
    profile = demo_user.profile

    return Token(
        access_token=token,
        user_id=demo_user.id,
        email=demo_user.email,
        full_name=demo_user.full_name,
        preferred_language=profile.preferred_language if profile else "te",
        abha_id=profile.abha_id if profile else "91-9876-5432-1098 [MOCK ABHA]"
    )

@router.post("/reset")
def reset_demo_data_endpoint(db: Session = Depends(get_db)):
    """Removes synthetic demo patient records cleanly."""
    demo_user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if demo_user:
        db.delete(demo_user)
        db.commit()
    return {"message": "Demo data successfully reset."}

@router.get("/status")
def get_demo_status(db: Session = Depends(get_db)):
    """Checks whether the synthetic demo dataset is currently present."""
    demo_user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    return {
        "demo_loaded": demo_user is not None,
        "demo_patient_name": demo_user.full_name if demo_user else None,
        "demo_patient_email": DEMO_USER_EMAIL
    }
