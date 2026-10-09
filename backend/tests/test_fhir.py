from app.services.demo_dataset import seed_demo_data
from app.services.fhir_service import generate_fhir_bundle, get_fhir_mapping_documentation

def test_fhir_bundle_generation(db):
    user = seed_demo_data(db)
    bundle = generate_fhir_bundle(db, user)

    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "collection"
    assert bundle["total"] > 0
    assert "timestamp" in bundle

    resource_types = [entry["resource"]["resourceType"] for entry in bundle["entry"]]
    assert "Patient" in resource_types
    assert "DocumentReference" in resource_types
    assert "Observation" in resource_types
    assert "MedicationRequest" in resource_types
    assert "Provenance" in resource_types

    # Verify Patient ABHA identifier
    patient_entry = next(e["resource"] for e in bundle["entry"] if e["resource"]["resourceType"] == "Patient")
    assert patient_entry["name"][0]["text"] == user.full_name
    assert any(ident["system"] == "https://healthid.ndhm.gov.in" for ident in patient_entry["identifier"])

def test_fhir_mapping_docs():
    mappings = get_fhir_mapping_documentation()
    assert len(mappings) >= 5
    types = [m.fhir_resource_type for m in mappings]
    assert "Patient" in types
    assert "Observation" in types
    assert "MedicationRequest" in types
