from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.fhir import FhirBundle, FhirMappingInfo
from app.services.fhir_service import generate_fhir_bundle, get_fhir_mapping_documentation

router = APIRouter()

@router.get("/Bundle/{patient_id}")
def get_fhir_bundle(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exports the patient's longitudinal health record as a valid FHIR R4 Bundle.
    Enforces user isolation: users can only fetch their own bundle.
    """
    if patient_id != current_user.id and patient_id != "current":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to requested patient bundle.")

    bundle = generate_fhir_bundle(db=db, user=current_user)
    return bundle

@router.get("/mapping", response_model=List[FhirMappingInfo])
def get_fhir_mappings():
    """Returns documentation on internal clinical models mapped to FHIR R4 resources."""
    return get_fhir_mapping_documentation()
