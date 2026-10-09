from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    preferred_language: str
    abha_id: Optional[str] = None

class TokenData(BaseModel):
    user_id: Optional[str] = None

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    preferred_language: Optional[str] = "en"
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class ProfileResponse(BaseModel):
    id: str
    user_id: str
    abha_id: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_language: str = "en"
    chronic_conditions: List[str] = []
    verified_allergies: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_language: Optional[str] = None
    chronic_conditions: Optional[List[str]] = None
    verified_allergies: Optional[List[str]] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool
    is_demo_user: bool
    created_at: datetime
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

class ConsentResponse(BaseModel):
    id: str
    consent_type: str
    status: str
    details: Optional[str] = None
    granted_at: datetime
    revoked_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConsentUpdate(BaseModel):
    consent_type: str
    status: str  # granted, revoked
    details: Optional[str] = None

class AuditEventResponse(BaseModel):
    id: str
    event_type: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
