from app.services.classifier import classify_medical_document
from app.services.field_extractor import (
    extract_prescription_fields,
    extract_lab_report_fields,
    extract_discharge_fields,
    extract_diagnostic_fields
)

def test_document_classification():
    lab_text = "APOLLO DIAGNOSTICS LABORATORY REPORT. Investigation: Fasting Blood Sugar 110 mg/dL Reference Interval 70-100."
    doc_type, conf = classify_medical_document(lab_text)
    assert doc_type == "lab_report"
    assert conf > 0.5

    rx_text = "Dr. K. Sharma MBBS. Rx: Tab Metformin 500mg 1-0-1 after meals for 30 days."
    doc_type, conf = classify_medical_document(rx_text)
    assert doc_type == "prescription"
    assert conf > 0.5

    dis_text = "DISCHARGE SUMMARY. Admission Date: 2026-01-01. Discharge Date: 2026-01-05. Hospital Course: Stable."
    doc_type, conf = classify_medical_document(dis_text)
    assert doc_type == "discharge_summary"
    assert conf > 0.5

def test_lab_report_field_extraction():
    text = """
    LAKSHMI PATHOLOGY LAB
    Date: 2026-02-15
    HbA1c: 8.5 % (4.0 - 5.6) HIGH
    Serum Creatinine: 1.1 mg/dL (0.6 - 1.2) NORMAL
    """
    fields = extract_lab_report_fields(text)
    field_names = [f["field_name"] for f in fields]
    assert "laboratory_name" in field_names
    assert any("hba1c" in f for f in field_names)
    assert any("creatinine" in f for f in field_names)

def test_prescription_field_extraction():
    text = """
    Dr. Ramesh Babu, MD
    Date: 2026-03-01
    1. Tab. Telmisartan 40mg - 1-0-0 after food x 30 days
    """
    fields = extract_prescription_fields(text)
    assert any(f["field_name"] == "prescriber_name" and "Ramesh" in f["corrected_value"] for f in fields)
    assert any(f["field_type"] == "medication" and "Telmisartan" in f["corrected_value"] for f in fields)
