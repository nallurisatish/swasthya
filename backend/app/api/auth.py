import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User, PatientProfile
from app.schemas.auth import (
    Token, UserRegister, UserLogin, UserResponse,
    ProfileResponse, ProfileUpdate
)
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    """Registers a new patient and creates their baseline health profile."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create associated PatientProfile with mock ABHA identifier
    mock_abha = f"91-{user.id[:4]}-{user.id[4:8]}-{user.id[8:12]} [MOCK ABHA]"
    profile = PatientProfile(
        user_id=user.id,
        abha_id=mock_abha,
        date_of_birth=user_in.date_of_birth,
        gender=user_in.gender,
        preferred_language=user_in.preferred_language or "en",
        emergency_contact_name=user_in.emergency_contact_name,
        emergency_contact_phone=user_in.emergency_contact_phone,
        chronic_conditions="[]",
        verified_allergies="[]"
    )
    db.add(profile)
    db.commit()

    log_audit_event(db, user.id, "user_register", "user", user.id, {"email": user.email})

    token = create_access_token({"sub": user.id, "user_id": user.id, "email": user.email})
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferred_language=profile.preferred_language,
        abha_id=profile.abha_id
    )

@router.post("/login", response_model=Token)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    """Logs in an existing user and returns a session JWT."""
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    profile = user.profile
    lang = profile.preferred_language if profile else "en"
    abha = profile.abha_id if profile else None

    log_audit_event(db, user.id, "user_login", "user", user.id)

    token = create_access_token({"sub": user.id, "user_id": user.id, "email": user.email})
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        preferred_language=lang,
        abha_id=abha
    )

@router.get("/profile", response_model=UserResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches the current user and their clinical demographic profile."""
    profile = current_user.profile
    chronic = []
    allergies = []
    if profile:
        try:
            chronic = json.loads(profile.chronic_conditions or "[]")
        except Exception:
            chronic = []
        try:
            allergies = json.loads(profile.verified_allergies or "[]")
        except Exception:
            allergies = []

    profile_resp = None
    if profile:
        profile_resp = ProfileResponse(
            id=profile.id,
            user_id=profile.user_id,
            abha_id=profile.abha_id,
            date_of_birth=profile.date_of_birth,
            gender=profile.gender,
            blood_group=profile.blood_group,
            emergency_contact_name=profile.emergency_contact_name,
            emergency_contact_phone=profile.emergency_contact_phone,
            preferred_language=profile.preferred_language,
            chronic_conditions=chronic,
            verified_allergies=allergies,
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_demo_user=current_user.is_demo_user,
        created_at=current_user.created_at,
        profile=profile_resp
    )

@router.put("/profile", response_model=ProfileResponse)
def update_user_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates demographic information and language preferences."""
    profile = current_user.profile
    if not profile:
        profile = PatientProfile(user_id=current_user.id)
        db.add(profile)

    if profile_in.date_of_birth is not None:
        profile.date_of_birth = profile_in.date_of_birth
    if profile_in.gender is not None:
        profile.gender = profile_in.gender
    if profile_in.blood_group is not None:
        profile.blood_group = profile_in.blood_group
    if profile_in.emergency_contact_name is not None:
        profile.emergency_contact_name = profile_in.emergency_contact_name
    if profile_in.emergency_contact_phone is not None:
        profile.emergency_contact_phone = profile_in.emergency_contact_phone
    if profile_in.preferred_language is not None:
        profile.preferred_language = profile_in.preferred_language
    if profile_in.chronic_conditions is not None:
        profile.chronic_conditions = json.dumps(profile_in.chronic_conditions)
    if profile_in.verified_allergies is not None:
        profile.verified_allergies = json.dumps(profile_in.verified_allergies)

    db.commit()
    db.refresh(profile)

    log_audit_event(db, current_user.id, "profile_update", "patient_profile", profile.id)

    return ProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        abha_id=profile.abha_id,
        date_of_birth=profile.date_of_birth,
        gender=profile.gender,
        blood_group=profile.blood_group,
        emergency_contact_name=profile.emergency_contact_name,
        emergency_contact_phone=profile.emergency_contact_phone,
        preferred_language=profile.preferred_language,
        chronic_conditions=json.loads(profile.chronic_conditions or "[]"),
        verified_allergies=json.loads(profile.verified_allergies or "[]"),
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )
