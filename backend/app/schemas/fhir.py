from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class FhirResource(BaseModel):
    resourceType: str
    id: str
    meta: Optional[Dict[str, Any]] = None
    identifier: Optional[List[Dict[str, Any]]] = None

class FhirBundle(BaseModel):
    resourceType: str = "Bundle"
    id: str
    type: str = "collection"
    timestamp: str
    total: int
    entry: List[Dict[str, Any]] = []

class FhirMappingInfo(BaseModel):
    entity_name: str
    fhir_resource_type: str
    description: str
    mapping_rules: List[str]
    code_systems_used: List[str]
    current_status: str  # "Fully Mapped", "Partially Mapped", "ABDM Extensible"
