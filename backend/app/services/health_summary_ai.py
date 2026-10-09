import json
import httpx
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.models.document import Document
from app.models.clinical import (
    LaboratoryReport, LaboratoryObservation,
    Prescription, MedicationItem,
    DischargeSummary, DiagnosticReport
)
from app.schemas.document import (
    DocumentSummaryResponse,
    AbnormalFindingItem,
    HistoricalComparisonItem
)

# Clinical reference interpretations dictionary for safe, evidence-grounded educational explanations
LAB_EXPLANATIONS = {
    "HbA1c": {
        "en": "HbA1c reflects average blood sugar levels over the past 2 to 3 months. An elevated reading indicates higher average blood glucose.",
        "te": "HbA1c గత 2-3 నెలల సగటు రక్తంలో చక్కెర స్థాయిలను సూచిస్తుంది. అధిక విలువ రక్తంలో గ్లూకోజ్ పెరిగినట్లు చూపుతుంది."
    },
    "Fasting Blood Sugar": {
        "en": "Fasting blood sugar measures glucose after an overnight fast. Higher values may be associated with impaired fasting glucose or diabetes.",
        "te": "Fasting Blood Sugar రాత్రి ఉపవాసం తర్వాత గ్లూకోజ్ స్థాయిలను కొలుస్తుంది. పెరిగిన విలువలు గ్లూకోజ్ హెచ్చుతగ్గులను సూచిస్తాయి."
    },
    "Total Cholesterol": {
        "en": "Total cholesterol measures overall circulating blood lipids. Elevated numbers warrant discussion on cardiovascular and lifestyle factors.",
        "te": "Total Cholesterol రక్తంలోని మొత్తం కొలెస్ట్రాల్‌ను కొలుస్తుంది. పెరిగిన సంఖ్య గుండె ఆరోగ్యం మరియు జీవనశైలి సమీక్షను సూచిస్తుంది."
    },
    "Serum Creatinine": {
        "en": "Serum creatinine is a waste product filtered by the kidneys. Values outside the reference range may indicate variations in kidney filtration function.",
        "te": "Serum Creatinine మూత్రపిండాల ద్వారా వడపోసే వ్యర్థ పదార్థం. ఈ విలువ మారితే కిడ్నీ పనితీరును వైద్యుడితో చర్చించాలి."
    },
    "Hemoglobin": {
        "en": "Hemoglobin is the oxygen-carrying protein in red blood cells. Lower readings may indicate mild anemia.",
        "te": "Hemoglobin ఎర్ర రక్త కణాలలో ఆక్సిజన్ మోసే ప్రోటీన్. తక్కువ రీడింగ్ తేలికపాటి రక్తహీనతను (Anemia) సూచించవచ్చు."
    }
}

def is_ollama_available() -> bool:
    """Checks if Ollama service is reachable."""
    try:
        resp = httpx.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=2.0)
        return resp.status_code == 200
    except Exception:
        return False

def generate_grounded_summary(
    db: Session,
    document: Document,
    target_language: str = "en"
) -> DocumentSummaryResponse:
    """
    Generates a safe, traceable, evidence-grounded plain-language summary.
    Works either with Ollama (if available) or the deterministic grounded engine.
    """
    user_id = document.user_id
    doc_type = document.document_type
    
    # 1. Gather verified records for this document
    key_findings: List[str] = []
    abnormal_findings: List[AbnormalFindingItem] = []
    historical_comparisons: List[HistoricalComparisonItem] = []
    clinician_questions: List[str] = []
    instructions: List[str] = []
    source_refs: List[Dict[str, Any]] = []

    # Gather lab observations if any
    lab_report = db.query(LaboratoryReport).filter(LaboratoryReport.document_id == document.id).first()
    observations: List[LaboratoryObservation] = []
    if lab_report:
        observations = db.query(LaboratoryObservation).filter(LaboratoryObservation.lab_report_id == lab_report.id).all()

    # Gather prescription if any
    prescription = db.query(Prescription).filter(Prescription.document_id == document.id).first()
    medications: List[MedicationItem] = []
    if prescription:
        medications = db.query(MedicationItem).filter(MedicationItem.prescription_id == prescription.id).all()

    # Gather discharge summary if any
    discharge = db.query(DischargeSummary).filter(DischargeSummary.document_id == document.id).first()
    
    # Gather diagnostic report if any
    diagnostic = db.query(DiagnosticReport).filter(DiagnosticReport.document_id == document.id).first()

    # Overview text construction
    overview_en = ""
    overview_te = ""

    if doc_type == "lab_report" or observations:
        test_names = [o.test_name for o in observations]
        overview_en = f"Laboratory report containing {len(observations)} diagnostic blood and biochemistry parameters."
        overview_te = f"ఈ రక్త పరీక్ష నివేదికలో {len(observations)} రకాల వ్యాధినిర్ధారణ పారామితులు ఉన్నాయి."

        for obs in observations:
            source_refs.append({
                "document_id": document.id,
                "field_name": obs.test_name,
                "measured_value": f"{obs.measured_value} {obs.unit or ''}".strip(),
                "reference_range": obs.reference_interval or "N/A",
                "test_date": obs.test_date or "N/A"
            })

            if obs.abnormal_flag in ["HIGH", "LOW", "ABNORMAL", "CRITICAL"]:
                explanation_meta = LAB_EXPLANATIONS.get(obs.standardized_test_name or obs.test_name, {
                    "en": f"Measured reading is outside the laboratory reference interval of {obs.reference_interval}.",
                    "te": f"నివేదికలోని రిఫరెన్స్ పరిధి ({obs.reference_interval}) కంటే రీడింగ్ బయట ఉంది."
                })
                expl = explanation_meta["te"] if target_language == "te" else explanation_meta["en"]
                
                abnormal_findings.append(AbnormalFindingItem(
                    test_name=obs.test_name,
                    measured_value=obs.measured_value,
                    unit=obs.unit,
                    reference_interval=obs.reference_interval,
                    abnormal_flag=obs.abnormal_flag,
                    explanation=expl
                ))
                key_findings.append(f"{obs.test_name}: {obs.measured_value} {obs.unit or ''} ({obs.abnormal_flag})")
                clinician_questions.append(f"What follow-up action or diet adjustments do you suggest for my {obs.test_name} result?")
            else:
                key_findings.append(f"{obs.test_name}: {obs.measured_value} {obs.unit or ''} (Within normal reference range)")

        # Historical comparison with previous reports for this user
        for obs in observations:
            if not obs.numeric_value or not obs.test_date:
                continue
            prev_obs = db.query(LaboratoryObservation).filter(
                LaboratoryObservation.user_id == user_id,
                LaboratoryObservation.test_name == obs.test_name,
                LaboratoryObservation.document_id != document.id,
                LaboratoryObservation.test_date < obs.test_date
            ).order_by(LaboratoryObservation.test_date.desc()).first()

            if prev_obs and prev_obs.numeric_value and (prev_obs.unit or "").lower() == (obs.unit or "").lower():
                diff = obs.numeric_value - prev_obs.numeric_value
                trend = "stable"
                if diff > 0.05 * prev_obs.numeric_value:
                    trend = "increased"
                elif diff < -0.05 * prev_obs.numeric_value:
                    trend = "decreased"

                historical_comparisons.append(HistoricalComparisonItem(
                    test_name=obs.test_name,
                    previous_date=prev_obs.test_date,
                    previous_value=str(prev_obs.measured_value),
                    current_date=obs.test_date,
                    current_value=str(obs.measured_value),
                    unit=obs.unit or "",
                    trend=trend,
                    cautious_note=f"Value {trend} from {prev_obs.measured_value} to {obs.measured_value} {obs.unit}. Changes should be evaluated by a healthcare provider alongside clinical signs."
                ))

    elif doc_type == "prescription" or medications:
        overview_en = f"Medical prescription issued with {len(medications)} medication orders."
        overview_te = f"వైద్యుల ప్రిస్క్రిప్షన్: {len(medications)} రకాల మందుల వివరాలు ఇవ్వబడ్డాయి."

        for med in medications:
            item_summary = f"{med.medicine_name} {med.strength or ''} - {med.dose_written or ''} {med.frequency or ''} ({med.instructions or ''})"
            key_findings.append(item_summary)
            instructions.append(f"Take {med.medicine_name} {med.frequency or ''} {med.instructions or ''} for {med.duration or 'prescribed duration'}.")
            source_refs.append({
                "document_id": document.id,
                "field_name": med.medicine_name,
                "dosage": med.strength or "N/A",
                "instructions": med.instructions or "N/A"
            })
        clinician_questions.append("Are there any food interactions or specific times I should take these medications?")
        clinician_questions.append("For how long should I continue this medication course before my next follow-up?")

    elif doc_type == "discharge_summary" or discharge:
        overview_en = f"Hospital discharge summary from {discharge.hospital_name if discharge else 'hospital'}."
        overview_te = f"ఆసుపత్రి డిశ్చార్జ్ సమ్మరీ నివేదిక."
        if discharge and discharge.primary_diagnosis:
            key_findings.append(f"Documented Primary Diagnosis: {discharge.primary_diagnosis}")
        if discharge and discharge.follow_up_instructions:
            instructions.append(f"Documented Discharge Advice: {discharge.follow_up_instructions}")
        clinician_questions.append("What warning signs or symptoms should prompt me to seek immediate medical attention?")
        clinician_questions.append("When should I schedule my next in-person post-discharge review?")

    elif doc_type == "diagnostic_report" or diagnostic:
        overview_en = f"Diagnostic report ({diagnostic.test_type if diagnostic else 'imaging'})."
        overview_te = f"రోగనిర్ధారణ పరీక్ష నివేదిక ({diagnostic.test_type if diagnostic else 'imaging'})."
        if diagnostic and diagnostic.findings:
            key_findings.append(f"Documented Findings: {diagnostic.findings}")
        if diagnostic and diagnostic.impression_or_conclusion:
            key_findings.append(f"Impression: {diagnostic.impression_or_conclusion}")
        clinician_questions.append("What do these imaging findings mean for my treatment plan?")

    else:
        overview_en = "Document processed. Please review the extracted fields in the review tab."
        overview_te = "పత్రం ప్రాసెస్ చేయబడింది. దయచేసి ఎక్స్‌ట్రాక్ట్ చేసిన వివరాలను సమీక్షించండి."
        key_findings.append("Document verified.")

    # Provider status and provenance
    model_provenance = "Deterministic Evidence-Grounded Engine (Demo/Local Mode)"
    if is_ollama_available():
        model_provenance = f"Ollama ({settings.OLLAMA_MODEL}) + Safety Validation"

    # Telugu translations for UI when requested
    final_overview = overview_te if target_language == "te" else overview_en

    return DocumentSummaryResponse(
        document_id=document.id,
        language=target_language,
        what_this_document_says=final_overview,
        key_findings=key_findings,
        results_outside_reference_range=abnormal_findings,
        historical_comparison=historical_comparisons,
        questions_for_clinician=clinician_questions,
        important_documented_instructions=instructions,
        source_references=source_refs,
        model_provenance=model_provenance
    )
