import re
from typing import Tuple, Dict

DOCUMENT_TYPES = [
    "prescription",
    "lab_report",
    "discharge_summary",
    "diagnostic_report"
]

KEYWORDS: Dict[str, list[tuple[str, int]]] = {
    "discharge_summary": [
        (r"\bdischarge\s+summary\b", 10),
        (r"\badmission\s+date\b", 6),
        (r"\bdischarge\s+date\b", 6),
        (r"\bhospital\s+course\b", 6),
        (r"\bprimary\s+diagnosis\b", 5),
        (r"\bdischarge\s+condition\b", 5),
        (r"\bdischarge\s+advice\b", 4),
        (r"\bip\s*no\b|\binpatient\b", 4),
    ],
    "lab_report": [
        (r"\breference\s+(?:interval|range)\b", 8),
        (r"\blaboratory\s+(?:report|investigation)\b", 8),
        (r"\bspecimen\b", 5),
        (r"\btest\s+name\b", 5),
        (r"\bbio-chemistry|hematology|pathology\b", 6),
        (r"\bhba1c|glucose|creatinine|cholesterol|hemoglobin|bilirubin\b", 4),
        (r"\bmg/dl|mmol/l|g/dl|iu/l\b", 4),
    ],
    "diagnostic_report": [
        (r"\bdiagnostic\s+report\b", 8),
        (r"\bultrasound|sonography|usg\b", 8),
        (r"\belectrocardiogram|ecg|ekg\b", 8),
        (r"\bx-ray|radiograph|radiology\b", 7),
        (r"\bct\s+scan|computed\s+tomography\b", 7),
        (r"\bmri\s+scan|magnetic\s+resonance\b", 7),
        (r"\bimpression\b", 5),
        (r"\bfindings\b", 4),
        (r"\bclinical\s+indication\b", 4),
    ],
    "prescription": [
        (r"\b(?:rx|℞)\b", 8),
        (r"\bprescription\b", 8),
        (r"\bdr\.\s+[a-z]+", 5),
        (r"\btab\b|\bcapsule\b|\bsyrup\b|\binj\b", 5),
        (r"\bonce\s+daily\b|\btwice\s+daily\b|\b1-0-1\b|\b1-0-0\b|\b0-0-1\b", 5),
        (r"\bafter\s+food\b|\bbefore\s+food\b|\bafter\s+meals\b|\bbefore\s+meals\b", 5),
        (r"\bdosage|frequency|route\b", 4),
    ]
}

def classify_medical_document(text: str) -> Tuple[str, float]:
    """
    Classifies raw medical document text into one of the four categories.
    Returns (document_type, confidence_score between 0.0 and 1.0).
    """
    if not text or len(text.strip()) < 15:
        return "unknown", 0.0

    lower_text = text.lower()
    scores: Dict[str, int] = {k: 0 for k in KEYWORDS}

    for doc_type, patterns in KEYWORDS.items():
        for pattern, weight in patterns:
            matches = len(re.findall(pattern, lower_text))
            scores[doc_type] += min(matches, 3) * weight

    best_type = max(scores, key=scores.get)
    max_score = scores[best_type]

    if max_score < 6:
        return "unknown", 0.2

    confidence = min(0.98, max(0.55, max_score / 25.0))
    return best_type, round(confidence, 2)
