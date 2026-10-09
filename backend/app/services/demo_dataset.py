import json
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.user import User, PatientProfile, ConsentRecord, AuditEvent
from app.models.document import Document, DocumentPage, ExtractedField, DocumentReview
from app.models.clinical import (
    Prescription, MedicationItem,
    LaboratoryReport, LaboratoryObservation,
    DischargeSummary, DiagnosticReport
)
from app.models.health_intelligence import HealthTimelineEvent, HealthInsight
from app.services.auth_service import hash_password

DEMO_USER_EMAIL = "demo.patient@swasthya.internal"

def seed_demo_data(db: Session) -> User:
    """
    Seeds comprehensive synthetic medical records for the hackathon presentation.
    All data is clearly marked DEMO - NOT A REAL MEDICAL RECORD.
    """
    # 1. Clean existing demo data if any
    existing_user = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()

    # 2. Create Demo User & Profile
    demo_user = User(
        email=DEMO_USER_EMAIL,
        hashed_password=hash_password("SwasthyaDemo2026!"),
        full_name="Sita Ramanathan [DEMO]",
        is_active=True,
        is_demo_user=True
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    profile = PatientProfile(
        user_id=demo_user.id,
        abha_id="91-9876-5432-1098 [MOCK ABHA]",
        date_of_birth="1978-05-14",
        gender="Female",
        blood_group="B+",
        emergency_contact_name="Ramesh Ramanathan (Spouse)",
        emergency_contact_phone="+91 98490 12345",
        preferred_language="te",
        chronic_conditions=json.dumps(["Type 2 Diabetes Mellitus", "Essential Hypertension", "Mild Hyperlipidemia"]),
        verified_allergies=json.dumps(["Penicillin (Mild Urticaria documented in 2018)"])
    )
    db.add(profile)

    # Consents
    for c_type in ["clinical_data_sharing", "ai_processing", "research_anonymized"]:
        db.add(ConsentRecord(
            user_id=demo_user.id,
            consent_type=c_type,
            status="granted",
            details="Demo user explicit consent for clinical intelligence and ABDM simulation."
        ))

    # Audit event
    db.add(AuditEvent(
        user_id=demo_user.id,
        event_type="demo_load",
        resource_type="patient_profile",
        resource_id=demo_user.id,
        details=json.dumps({"action": "Synthetic hackathon dataset initialized"}),
        ip_address="127.0.0.1"
    ))

    # =========================================================================
    # DOCUMENT 1: Lab Report 1 (Jan 15, 2026) - Baseline Metabolic Panel
    # =========================================================================
    doc1 = Document(
        user_id=demo_user.id,
        original_filename="DEMO_Lab_Report_Jan2026.pdf",
        stored_filename=f"demo_lab_jan2026_{uuid.uuid4().hex[:6]}.pdf",
        file_size=184200,
        mime_type="application/pdf",
        content_hash="mock_hash_lab_jan2026",
        page_count=1,
        document_type="lab_report",
        processing_status="completed",
        ocr_engine_used="pypdf",
        has_uncertain_fields=False,
        upload_timestamp=datetime(2026, 1, 15, 10, 30)
    )
    db.add(doc1)
    db.commit()
    db.refresh(doc1)

    raw_text_1 = """
    APOLLO DIAGNOSTICS & PATHOLOGY LABS — HYDERABAD
    [DEMO — NOT A REAL MEDICAL RECORD]
    Patient: Sita Ramanathan | Age: 48 | Gender: Female | Date: 2026-01-15
    INVESTIGATION REPORT: COMPREHENSIVE DIABETIC & LIPID PROFILE

    Test Name                  Result    Units     Reference Interval    Flag
    HbA1c (Glycated Hb)        8.2       %         4.0 - 5.6             HIGH
    Fasting Blood Sugar (FBS)  156       mg/dL     70 - 100              HIGH
    Total Cholesterol          228       mg/dL     < 200                 HIGH
    Serum Creatinine           0.9       mg/dL     0.6 - 1.2             NORMAL
    Hemoglobin                 12.8      g/dL      12.0 - 15.0           NORMAL
    """
    db.add(DocumentPage(
        document_id=doc1.id,
        page_number=1,
        raw_text=raw_text_1.strip(),
        ocr_confidence=0.98,
        language_detected="en"
    ))

    lab1 = LaboratoryReport(
        user_id=demo_user.id,
        document_id=doc1.id,
        lab_name="Apollo Diagnostics Hyderabad",
        report_date="2026-01-15",
        specimen_type="Blood Serum",
        accession_number="APL-2026-0115-098"
    )
    db.add(lab1)
    db.commit()
    db.refresh(lab1)

    obs1_hba1c = LaboratoryObservation(
        lab_report_id=lab1.id,
        user_id=demo_user.id,
        document_id=doc1.id,
        test_name="HbA1c",
        standardized_test_name="HbA1c",
        measured_value="8.2",
        numeric_value=8.2,
        unit="%",
        reference_interval="4.0 - 5.6",
        ref_low=4.0,
        ref_high=5.6,
        abnormal_flag="HIGH",
        test_date="2026-01-15",
        is_verified=True
    )
    db.add(obs1_hba1c)

    obs1_fbs = LaboratoryObservation(
        lab_report_id=lab1.id,
        user_id=demo_user.id,
        document_id=doc1.id,
        test_name="Fasting Blood Sugar",
        standardized_test_name="Fasting Blood Sugar",
        measured_value="156",
        numeric_value=156.0,
        unit="mg/dL",
        reference_interval="70 - 100",
        ref_low=70.0,
        ref_high=100.0,
        abnormal_flag="HIGH",
        test_date="2026-01-15",
        is_verified=True
    )
    db.add(obs1_fbs)

    obs1_chol = LaboratoryObservation(
        lab_report_id=lab1.id,
        user_id=demo_user.id,
        document_id=doc1.id,
        test_name="Total Cholesterol",
        standardized_test_name="Total Cholesterol",
        measured_value="228",
        numeric_value=228.0,
        unit="mg/dL",
        reference_interval="< 200",
        ref_low=0.0,
        ref_high=200.0,
        abnormal_flag="HIGH",
        test_date="2026-01-15",
        is_verified=True
    )
    db.add(obs1_chol)

    obs1_creat = LaboratoryObservation(
        lab_report_id=lab1.id,
        user_id=demo_user.id,
        document_id=doc1.id,
        test_name="Serum Creatinine",
        standardized_test_name="Serum Creatinine",
        measured_value="0.9",
        numeric_value=0.9,
        unit="mg/dL",
        reference_interval="0.6 - 1.2",
        ref_low=0.6,
        ref_high=1.2,
        abnormal_flag="NORMAL",
        test_date="2026-01-15",
        is_verified=True
    )
    db.add(obs1_creat)
    db.commit()

    # Timeline event
    db.add(HealthTimelineEvent(
        user_id=demo_user.id,
        document_id=doc1.id,
        event_date="2026-01-15",
        event_type="lab_result",
        title="Diagnostic Lab Report (Baseline)",
        summary="HbA1c: 8.2% (High), Fasting Blood Glucose: 156 mg/dL (High), Total Cholesterol: 228 mg/dL (High).",
        clinical_category="Endocrinology",
        is_abnormal=True,
        is_verified=True,
        reference_id=lab1.id,
        reference_type="LaboratoryReport"
    ))

    # =========================================================================
    # DOCUMENT 2: Prescription (Jan 16, 2026) - Dr. K. Venkatesh
    # =========================================================================
    doc2 = Document(
        user_id=demo_user.id,
        original_filename="DEMO_Prescription_Jan2026.pdf",
        stored_filename=f"demo_rx_jan2026_{uuid.uuid4().hex[:6]}.pdf",
        file_size=125400,
        mime_type="application/pdf",
        content_hash="mock_hash_rx_jan2026",
        page_count=1,
        document_type="prescription",
        processing_status="completed",
        ocr_engine_used="pypdf",
        has_uncertain_fields=False,
        upload_timestamp=datetime(2026, 1, 16, 11, 45)
    )
    db.add(doc2)
    db.commit()
    db.refresh(doc2)

    raw_text_2 = """
    DR. K. VENKATESH, MD (General Medicine)
    Apollo Health City, Jubilee Hills, Hyderabad | Reg No: TS-48291
    [DEMO — NOT A REAL MEDICAL RECORD]
    Patient: Sita Ramanathan | Age: 48 | Date: 2026-01-16
    Diagnosis: Type 2 Diabetes Mellitus, Essential Hypertension, Dyslipidemia

    Rx:
    1. Tab. Metformin 500mg — 1 tablet twice daily (1-0-1), after food x 3 months
    2. Tab. Telmisartan 40mg — 1 tablet once daily (1-0-0), morning after food x 3 months
    3. Tab. Atorvastatin 10mg — 1 tablet once daily (0-0-1), night after dinner x 3 months

    Advice:
    - Low carbohydrate diabetic diet.
    - 30 minutes brisk walking daily.
    - Review in 2.5 to 3 months with repeat HbA1c, FBS, Lipid Profile.
    """
    db.add(DocumentPage(
        document_id=doc2.id,
        page_number=1,
        raw_text=raw_text_2.strip(),
        ocr_confidence=0.97,
        language_detected="en"
    ))

    rx1 = Prescription(
        user_id=demo_user.id,
        document_id=doc2.id,
        prescriber_name="Dr. K. Venkatesh, MD",
        clinic_or_hospital="Apollo Health City Hyderabad",
        prescription_date="2026-01-16"
    )
    db.add(rx1)
    db.commit()
    db.refresh(rx1)

    med1 = MedicationItem(
        prescription_id=rx1.id,
        user_id=demo_user.id,
        medicine_name="Metformin",
        dosage_form="Tablet",
        strength="500mg",
        dose_written="1 tablet",
        frequency="Twice daily (1-0-1)",
        duration="3 months",
        instructions="After meals",
        confidence_level="high",
        is_verified=True,
        status="active"
    )
    med2 = MedicationItem(
        prescription_id=rx1.id,
        user_id=demo_user.id,
        medicine_name="Telmisartan",
        dosage_form="Tablet",
        strength="40mg",
        dose_written="1 tablet",
        frequency="Once daily (1-0-0)",
        duration="3 months",
        instructions="Morning after breakfast",
        confidence_level="high",
        is_verified=True,
        status="active"
    )
    med3 = MedicationItem(
        prescription_id=rx1.id,
        user_id=demo_user.id,
        medicine_name="Atorvastatin",
        dosage_form="Tablet",
        strength="10mg",
        dose_written="1 tablet",
        frequency="Once daily (0-0-1)",
        duration="3 months",
        instructions="Night after dinner",
        confidence_level="high",
        is_verified=True,
        status="active"
    )
    db.add_all([med1, med2, med3])
    db.commit()

    db.add(HealthTimelineEvent(
        user_id=demo_user.id,
        document_id=doc2.id,
        event_date="2026-01-16",
        event_type="prescription",
        title="Physician Consultation & Prescription",
        summary="Dr. K. Venkatesh prescribed Metformin 500mg BD, Telmisartan 40mg OD, Atorvastatin 10mg HS.",
        clinical_category="Internal Medicine",
        is_abnormal=False,
        is_verified=True,
        reference_id=rx1.id,
        reference_type="Prescription"
    ))

    # =========================================================================
    # DOCUMENT 3: Lab Report 2 (Mar 28, 2026) - Follow-Up (Shows Trends!)
    # =========================================================================
    doc3 = Document(
        user_id=demo_user.id,
        original_filename="DEMO_Lab_Report_Mar2026.pdf",
        stored_filename=f"demo_lab_mar2026_{uuid.uuid4().hex[:6]}.pdf",
        file_size=179500,
        mime_type="application/pdf",
        content_hash="mock_hash_lab_mar2026",
        page_count=1,
        document_type="lab_report",
        processing_status="completed",
        ocr_engine_used="pypdf",
        has_uncertain_fields=False,
        upload_timestamp=datetime(2026, 3, 28, 9, 15)
    )
    db.add(doc3)
    db.commit()
    db.refresh(doc3)

    raw_text_3 = """
    APOLLO DIAGNOSTICS & PATHOLOGY LABS — HYDERABAD
    [DEMO — NOT A REAL MEDICAL RECORD]
    Patient: Sita Ramanathan | Age: 48 | Gender: Female | Date: 2026-03-28
    FOLLOW-UP INVESTIGATION REPORT

    Test Name                  Result    Units     Reference Interval    Flag
    HbA1c (Glycated Hb)        7.1       %         4.0 - 5.6             HIGH
    Fasting Blood Sugar (FBS)  124       mg/dL     70 - 100              HIGH
    Total Cholesterol          192       mg/dL     < 200                 NORMAL
    Serum Creatinine           0.9       mg/dL     0.6 - 1.2             NORMAL
    """
    db.add(DocumentPage(
        document_id=doc3.id,
        page_number=1,
        raw_text=raw_text_3.strip(),
        ocr_confidence=0.99,
        language_detected="en"
    ))

    lab2 = LaboratoryReport(
        user_id=demo_user.id,
        document_id=doc3.id,
        lab_name="Apollo Diagnostics Hyderabad",
        report_date="2026-03-28",
        specimen_type="Blood Serum",
        accession_number="APL-2026-0328-114"
    )
    db.add(lab2)
    db.commit()
    db.refresh(lab2)

    obs2_hba1c = LaboratoryObservation(
        lab_report_id=lab2.id,
        user_id=demo_user.id,
        document_id=doc3.id,
        test_name="HbA1c",
        standardized_test_name="HbA1c",
        measured_value="7.1",
        numeric_value=7.1,
        unit="%",
        reference_interval="4.0 - 5.6",
        ref_low=4.0,
        ref_high=5.6,
        abnormal_flag="HIGH",
        test_date="2026-03-28",
        is_verified=True
    )
    db.add(obs2_hba1c)

    obs2_fbs = LaboratoryObservation(
        lab_report_id=lab2.id,
        user_id=demo_user.id,
        document_id=doc3.id,
        test_name="Fasting Blood Sugar",
        standardized_test_name="Fasting Blood Sugar",
        measured_value="124",
        numeric_value=124.0,
        unit="mg/dL",
        reference_interval="70 - 100",
        ref_low=70.0,
        ref_high=100.0,
        abnormal_flag="HIGH",
        test_date="2026-03-28",
        is_verified=True
    )
    db.add(obs2_fbs)

    obs2_chol = LaboratoryObservation(
        lab_report_id=lab2.id,
        user_id=demo_user.id,
        document_id=doc3.id,
        test_name="Total Cholesterol",
        standardized_test_name="Total Cholesterol",
        measured_value="192",
        numeric_value=192.0,
        unit="mg/dL",
        reference_interval="< 200",
        ref_low=0.0,
        ref_high=200.0,
        abnormal_flag="NORMAL",
        test_date="2026-03-28",
        is_verified=True
    )
    db.add(obs2_chol)

    obs2_creat = LaboratoryObservation(
        lab_report_id=lab2.id,
        user_id=demo_user.id,
        document_id=doc3.id,
        test_name="Serum Creatinine",
        standardized_test_name="Serum Creatinine",
        measured_value="0.9",
        numeric_value=0.9,
        unit="mg/dL",
        reference_interval="0.6 - 1.2",
        ref_low=0.6,
        ref_high=1.2,
        abnormal_flag="NORMAL",
        test_date="2026-03-28",
        is_verified=True
    )
    db.add(obs2_creat)
    db.commit()

    db.add(HealthTimelineEvent(
        user_id=demo_user.id,
        document_id=doc3.id,
        event_date="2026-03-28",
        event_type="lab_result",
        title="3-Month Follow-Up Lab Report",
        summary="HbA1c decreased from 8.2% to 7.1%. Fasting glucose decreased to 124 mg/dL. Total cholesterol normalized to 192 mg/dL.",
        clinical_category="Endocrinology",
        is_abnormal=True,
        is_verified=True,
        reference_id=lab2.id,
        reference_type="LaboratoryReport"
    ))

    # =========================================================================
    # DOCUMENT 4: Discharge Summary (Nov 2025)
    # =========================================================================
    doc4 = Document(
        user_id=demo_user.id,
        original_filename="DEMO_Discharge_Summary_Nov2025.pdf",
        stored_filename=f"demo_discharge_nov2025_{uuid.uuid4().hex[:6]}.pdf",
        file_size=210500,
        mime_type="application/pdf",
        content_hash="mock_hash_discharge_nov2025",
        page_count=1,
        document_type="discharge_summary",
        processing_status="completed",
        ocr_engine_used="pypdf",
        has_uncertain_fields=False,
        upload_timestamp=datetime(2025, 11, 20, 16, 0)
    )
    db.add(doc4)
    db.commit()
    db.refresh(doc4)

    raw_text_4 = """
    KIMS HOSPITALS — SECUNDERABAD
    [DEMO — NOT A REAL MEDICAL RECORD]
    DISCHARGE SUMMARY
    Patient Name: Sita Ramanathan | IP No: KIMS-IP-89102
    Admission Date: 2025-11-18 | Discharge Date: 2025-11-20
    Department: General Cardiology / Internal Medicine

    Primary Diagnosis:
    Atypical chest discomfort evaluated; Acute Coronary Syndrome ruled out.

    Hospital Course:
    Patient admitted with complaints of transient retrosternal heaviness after heavy meal.
    Serial Troponin I levels negative x 2. Serial ECGs within normal limits.
    2D Echocardiography revealed normal LV systolic function (LVEF 60%).
    Patient responded well to symptomatic antacids and rest. Discharged in stable condition.

    Discharge Advice:
    - Dietary moderation; avoid late-night heavy meals.
    - Continue outpatient follow-up with physician for metabolic monitoring.
    """
    db.add(DocumentPage(
        document_id=doc4.id,
        page_number=1,
        raw_text=raw_text_4.strip(),
        ocr_confidence=0.98,
        language_detected="en"
    ))

    ds = DischargeSummary(
        user_id=demo_user.id,
        document_id=doc4.id,
        hospital_name="KIMS Hospitals Secunderabad",
        department="General Cardiology",
        admission_date="2025-11-18",
        discharge_date="2025-11-20",
        primary_diagnosis="Atypical chest discomfort evaluated; Acute Coronary Syndrome ruled out",
        secondary_diagnoses=json.dumps(["Dyspepsia", "Mild GERD"]),
        procedures_performed=json.dumps(["Serial Troponin I", "12-Lead ECG", "2D Echocardiogram"]),
        hospital_course="Troponin negative x 2, normal ECG and echo (EF 60%). Discharged stable.",
        discharge_condition="Stable, asymptomatic",
        allergies=json.dumps(["Penicillin"]),
        follow_up_instructions="Dietary moderation; avoid late meals; regular OPD follow-up."
    )
    db.add(ds)
    db.commit()

    db.add(HealthTimelineEvent(
        user_id=demo_user.id,
        document_id=doc4.id,
        event_date="2025-11-20",
        event_type="discharge",
        title="Hospital Discharge (KIMS Cardiology)",
        summary="Admitted for atypical chest discomfort evaluation. Cardiac enzymes negative. Discharged stable with dietary advice.",
        clinical_category="Cardiology",
        is_abnormal=False,
        is_verified=True,
        reference_id=ds.id,
        reference_type="DischargeSummary"
    ))

    # =========================================================================
    # DOCUMENT 5: Diagnostic Report (Ultrasound Abdomen, Feb 2026)
    # =========================================================================
    doc5 = Document(
        user_id=demo_user.id,
        original_filename="DEMO_USG_Abdomen_Feb2026.pdf",
        stored_filename=f"demo_usg_feb2026_{uuid.uuid4().hex[:6]}.pdf",
        file_size=154300,
        mime_type="application/pdf",
        content_hash="mock_hash_usg_feb2026",
        page_count=1,
        document_type="diagnostic_report",
        processing_status="completed",
        ocr_engine_used="pypdf",
        has_uncertain_fields=False,
        upload_timestamp=datetime(2026, 2, 10, 14, 20)
    )
    db.add(doc5)
    db.commit()
    db.refresh(doc5)

    raw_text_5 = """
    VIJAYA DIAGNOSTIC CENTRE — HYDERABAD
    [DEMO — NOT A REAL MEDICAL RECORD]
    ULTRASOUND WHOLE ABDOMEN & PELVIS
    Patient: Sita Ramanathan | Age: 48 | Date: 2026-02-10
    Referring Doctor: Dr. K. Venkatesh

    Findings:
    - Liver: Mildly increased echogenicity consistent with Grade 1 Hepatic Steatosis (Fatty Liver). No focal lesions.
    - Gallbladder: Normal lumen, no calculi or wall thickening.
    - Kidneys: Normal bilateral renal size and corticomedullary differentiation. No hydronephrosis.
    - Spleen and Pancreas: Normal echotexture.

    Impression:
    Mild Grade 1 Fatty Infiltration of Liver. Otherwise normal abdominal sonogram.
    """
    db.add(DocumentPage(
        document_id=doc5.id,
        page_number=1,
        raw_text=raw_text_5.strip(),
        ocr_confidence=0.99,
        language_detected="en"
    ))

    diag = DiagnosticReport(
        user_id=demo_user.id,
        document_id=doc5.id,
        test_type="Ultrasound Whole Abdomen",
        exam_date="2026-02-10",
        reporting_clinician="Dr. P. Swaroop, Radiologist",
        clinical_indication="Routine diabetic and abdominal health check",
        findings="Mildly increased liver echogenicity (Grade 1 fatty liver). Normal gallbladder, kidneys, spleen.",
        impression_or_conclusion="Grade 1 Hepatic Steatosis. Normal study otherwise.",
        recommendations="Lifestyle dietary control and periodic follow-up."
    )
    db.add(diag)
    db.commit()

    db.add(HealthTimelineEvent(
        user_id=demo_user.id,
        document_id=doc5.id,
        event_date="2026-02-10",
        event_type="diagnostic",
        title="Ultrasound Whole Abdomen",
        summary="Ultrasound showed Grade 1 Fatty Liver (hepatic steatosis). Bilateral kidneys and other organs normal.",
        clinical_category="Radiology",
        is_abnormal=True,
        is_verified=True,
        reference_id=diag.id,
        reference_type="DiagnosticReport"
    ))

    # =========================================================================
    # DOCUMENT 6: UNCONFIRMED DOCUMENT FOR HUMAN-IN-THE-LOOP VERIFICATION DEMO
    # =========================================================================
    doc6 = Document(
        user_id=demo_user.id,
        original_filename="DEMO_Pending_Prescription_Review.pdf",
        stored_filename=f"demo_pending_rx_{uuid.uuid4().hex[:6]}.pdf",
        file_size=98200,
        mime_type="application/pdf",
        content_hash="mock_hash_pending_review",
        page_count=1,
        document_type="prescription",
        processing_status="review_required",
        ocr_engine_used="pypdf",
        has_uncertain_fields=True,
        upload_timestamp=datetime(2026, 4, 1, 12, 0)
    )
    db.add(doc6)
    db.commit()
    db.refresh(doc6)

    raw_text_6 = """
    COMMUNITY HEALTH CLINIC — HYDERABAD
    [DEMO — HUMAN REVIEW DEMONSTRATION RECORD]
    Doctor: Dr. Ramesh Varma, MBBS
    Date: 2026-04-01

    Rx:
    1. Tab. Pantoprazole 40mg — 1-0-0 before food x 14 days
    2. Tab. [Handwriting unclear: Vit-D3 / Calcitriol] 60k IU — once weekly [Needs review]
    """
    db.add(DocumentPage(
        document_id=doc6.id,
        page_number=1,
        raw_text=raw_text_6.strip(),
        ocr_confidence=0.82,
        language_detected="en"
    ))

    # Extracted fields showing High, Medium, and Low confidence for the review UI
    db.add(ExtractedField(
        document_id=doc6.id,
        field_name="prescriber_name",
        field_type="string",
        original_value="Dr. Ramesh Varma",
        corrected_value="Dr. Ramesh Varma",
        confidence_level="high",
        source_text="Doctor: Dr. Ramesh Varma, MBBS",
        source_page=1,
        is_verified=False
    ))
    db.add(ExtractedField(
        document_id=doc6.id,
        field_name="prescription_date",
        field_type="date",
        original_value="2026-04-01",
        corrected_value="2026-04-01",
        confidence_level="high",
        source_text="Date: 2026-04-01",
        source_page=1,
        is_verified=False
    ))
    db.add(ExtractedField(
        document_id=doc6.id,
        field_name="medication_1",
        field_type="medication",
        original_value="Tab. Pantoprazole 40mg | Freq: 1-0-0 | Instr: Before food",
        corrected_value="Tab. Pantoprazole 40mg | Freq: 1-0-0 | Instr: Before food",
        confidence_level="high",
        source_text="1. Tab. Pantoprazole 40mg — 1-0-0 before food x 14 days",
        source_page=1,
        is_verified=False
    ))
    db.add(ExtractedField(
        document_id=doc6.id,
        field_name="medication_2_uncertain",
        field_type="medication",
        original_value="Tab. [Vit-D3 / Calcitriol] 60k IU | Freq: Once weekly",
        corrected_value="Tab. Cholecalciferol (Vitamin D3) 60000 IU",
        confidence_level="low",
        source_text="2. Tab. [Handwriting unclear: Vit-D3 / Calcitriol] 60k IU — once weekly",
        source_page=1,
        is_verified=False
    ))
    db.commit()

    # =========================================================================
    # EVIDENCE-LINKED HEALTH INSIGHTS (Core Hackathon Differentiator)
    # =========================================================================
    insight1 = HealthInsight(
        user_id=demo_user.id,
        document_id=doc3.id,
        observation_id=obs2_hba1c.id,
        insight_category="trend_alert",
        plain_language_explanation_en=(
            "Your HbA1c has decreased from 8.2% (Jan 15, 2026) to 7.1% (Mar 28, 2026). "
            "While still above the lab reference range (4.0 - 5.6%), this shows a positive downward trend over the 3-month treatment period."
        ),
        plain_language_explanation_te=(
            "మీ HbA1c విలువ 8.2% (15 జనవరి 2026) నుండి 7.1% (28 మార్చి 2026) కి తగ్గింది. "
            "ఇది ఇంకా సాధారణ పరిధి (4.0 - 5.6%) కంటే ఎక్కువగానే ఉన్నప్పటికీ, గత 3 నెలల చికిత్సలో సానుకూల తగ్గుదల కనిపించింది."
        ),
        language="en",
        supporting_values=json.dumps({
            "test_name": "HbA1c",
            "previous_value": "8.2%",
            "previous_date": "2026-01-15",
            "current_value": "7.1%",
            "current_date": "2026-03-28",
            "reference_interval": "4.0 - 5.6%",
            "trend": "decreased (improved glycemic marker)"
        }),
        source_page=1,
        source_field="HbA1c",
        safety_note="Trend direction is an observational metric and not a substitute for clinical physician consultation.",
        model_or_template_provenance="Deterministic Evidence-Grounded Engine (Demo/Local Mode)",
        review_status="verified"
    )
    db.add(insight1)

    insight2 = HealthInsight(
        user_id=demo_user.id,
        document_id=doc3.id,
        observation_id=obs2_chol.id,
        insight_category="abnormal_lab",
        plain_language_explanation_en=(
            "Total Cholesterol has normalized to 192 mg/dL on March 28, down from 228 mg/dL in January, entering the report's desirable range (< 200 mg/dL)."
        ),
        plain_language_explanation_te=(
            "టోటల్ కొలెస్ట్రాల్ జనవరిలోని 228 mg/dL నుండి మార్చి 28 నాటికి 192 mg/dL కు చేరి సాధారణ పరిధిలోకి (< 200 mg/dL) వచ్చింది."
        ),
        language="en",
        supporting_values=json.dumps({
            "test_name": "Total Cholesterol",
            "previous_value": "228 mg/dL",
            "current_value": "192 mg/dL",
            "reference_interval": "< 200 mg/dL",
            "status": "NORMAL"
        }),
        source_page=1,
        source_field="Total Cholesterol",
        safety_note="Lipid levels should be reviewed together with HDL, LDL, and cardiovascular risk factors.",
        model_or_template_provenance="Deterministic Evidence-Grounded Engine (Demo/Local Mode)",
        review_status="verified"
    )
    db.add(insight2)

    insight3 = HealthInsight(
        user_id=demo_user.id,
        document_id=doc2.id,
        medication_id=med1.id,
        insight_category="medication_adherence",
        plain_language_explanation_en=(
            "Prescription instructions specifically mandate Metformin 500mg to be taken 'after food' twice daily. "
            "Taking it with or after meals helps reduce gastrointestinal discomfort."
        ),
        plain_language_explanation_te=(
            "డాక్టర్ ప్రిస్క్రిప్షన్ ప్రకారం Metformin 500mg ఆహారం తిన్న తర్వాత (After food) రోజుకు రెండుసార్లు తీసుకోవాలి. "
            "భోజనం తర్వాత తీసుకోవడం వల్ల కడుపులో అసౌకర్యం తగ్గుతుంది."
        ),
        language="en",
        supporting_values=json.dumps({
            "medicine_name": "Metformin",
            "strength": "500mg",
            "frequency": "Twice daily (1-0-1)",
            "timing": "After meals"
        }),
        source_page=1,
        source_field="medication_1",
        safety_note="Never alter or stop prescribed medication without explicit direction from your prescribing doctor.",
        model_or_template_provenance="Deterministic Evidence-Grounded Engine (Demo/Local Mode)",
        review_status="verified"
    )
    db.add(insight3)
    db.commit()

    return demo_user
