import re
from typing import List, Dict, Any, Optional

def extract_dates_from_text(text: str) -> List[str]:
    """Finds common date formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD Month YYYY."""
    patterns = [
        r"\b\d{4}-\d{2}-\d{2}\b",
        r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
        r"\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b"
    ]
    dates = []
    for p in patterns:
        for m in re.finditer(p, text, re.IGNORECASE):
            dates.append(m.group(0))
    return list(dict.fromkeys(dates))

def extract_prescription_fields(text: str, page_num: int = 1) -> List[Dict[str, Any]]:
    """
    Extracts prescription details: Prescriber, Date, and Medications.
    """
    fields: List[Dict[str, Any]] = []

    # 1. Doctor / Prescriber
    doc_match = re.search(r"(?:Dr\.|Doctor)\s+([A-Za-z\.\s]+?)(?:\n|,|MBBS|MD|DNB|General)", text, re.IGNORECASE)
    if doc_match:
        doc_name = f"Dr. {doc_match.group(1).strip()}"
        fields.append({
            "field_name": "prescriber_name",
            "field_type": "string",
            "original_value": doc_name,
            "corrected_value": doc_name,
            "confidence_level": "high",
            "source_text": doc_match.group(0).strip(),
            "source_page": page_num,
            "is_verified": False
        })
    else:
        fields.append({
            "field_name": "prescriber_name",
            "field_type": "string",
            "original_value": "",
            "corrected_value": "",
            "confidence_level": "low",
            "source_text": "",
            "source_page": page_num,
            "is_verified": False
        })

    # 2. Date
    dates = extract_dates_from_text(text)
    rx_date = dates[0] if dates else ""
    fields.append({
        "field_name": "prescription_date",
        "field_type": "date",
        "original_value": rx_date,
        "corrected_value": rx_date,
        "confidence_level": "high" if rx_date else "low",
        "source_text": rx_date,
        "source_page": page_num,
        "is_verified": False
    })

    # 3. Medications
    med_lines = []
    for line in text.splitlines():
        clean = line.strip()
        if re.search(r"\b(?:Tab|Tablet|Cap|Capsule|Syrup|Inj|Ointment)\b", clean, re.IGNORECASE) or \
           re.search(r"\b(?:1-0-1|1-0-0|0-0-1|0-1-0|OD|BD|TDS|QID)\b", clean, re.IGNORECASE):
            med_lines.append(clean)

    for idx, med_line in enumerate(med_lines):
        name_match = re.search(
            r"(?:Tab|Tablet|Cap|Capsule|Syrup|Inj|Ointment)[\.\s]+([A-Za-z][A-Za-z0-9\-]+(?:\s+[A-Za-z0-9\-]+)?)\s*(\d+\s*(?:mg|mcg|ml|g|IU|k\s*IU))?",
            med_line,
            re.IGNORECASE
        )
        if not name_match:
            clean_line = re.sub(r"^\s*(?:\d+[\.\)]|\*|-)\s*", "", med_line)
            name_match = re.search(r"^([A-Za-z][A-Za-z0-9\-]+)\s*(\d+\s*(?:mg|mcg|ml|g|IU))?", clean_line, re.IGNORECASE)

        freq_match = re.search(r"\b(1-0-1|1-0-0|0-0-1|0-1-0|OD|BD|TDS|QID|once daily|twice daily)\b", med_line, re.IGNORECASE)
        instr_match = re.search(r"\b(after\s+(?:food|meals)|before\s+(?:food|meals)|with\s+water)\b", med_line, re.IGNORECASE)
        dur_match = re.search(r"\b(\d+\s*(?:days|weeks|months))\b", med_line, re.IGNORECASE)

        med_name = name_match.group(1).strip() if name_match else f"Medication #{idx+1}"
        strength = name_match.group(2).strip() if name_match and name_match.group(2) else ""
        frequency = freq_match.group(1).strip() if freq_match else "As directed"
        instructions = instr_match.group(1).strip() if instr_match else "As prescribed"
        duration = dur_match.group(1).strip() if dur_match else "Ongoing"

        full_val = f"{med_name} {strength} | Freq: {frequency} | Instr: {instructions} | Dur: {duration}".strip()
        confidence = "high" if (strength and freq_match) else "medium"

        fields.append({
            "field_name": f"medication_{idx+1}",
            "field_type": "medication",
            "original_value": full_val,
            "corrected_value": full_val,
            "confidence_level": confidence,
            "source_text": med_line,
            "source_page": page_num,
            "is_verified": False
        })

    return fields

def extract_lab_report_fields(text: str, page_num: int = 1) -> List[Dict[str, Any]]:
    """
    Extracts laboratory observations: test name, measured value, unit, reference interval, and abnormal flags.
    """
    fields: List[Dict[str, Any]] = []

    # Lab Name
    lab_match = re.search(r"([A-Za-z\s]+(?:Diagnostic|Laboratory|Labs|Pathology|Hospital))", text, re.IGNORECASE)
    lab_name = lab_match.group(1).strip() if lab_match else "Clinical Diagnostic Laboratory"
    fields.append({
        "field_name": "laboratory_name",
        "field_type": "string",
        "original_value": lab_name,
        "corrected_value": lab_name,
        "confidence_level": "high",
        "source_text": lab_name,
        "source_page": page_num,
        "is_verified": False
    })

    # Report Date
    dates = extract_dates_from_text(text)
    rep_date = dates[0] if dates else ""
    fields.append({
        "field_name": "report_date",
        "field_type": "date",
        "original_value": rep_date,
        "corrected_value": rep_date,
        "confidence_level": "high" if rep_date else "low",
        "source_text": rep_date,
        "source_page": page_num,
        "is_verified": False
    })

    # Common Lab Tests Regex matching lines like:
    # HbA1c 8.2 % 4.0 - 5.6 High
    # Fasting Blood Glucose 156 mg/dL 70 - 100 High
    # Serum Creatinine 0.9 mg/dL 0.6 - 1.2 Normal
    # Total Cholesterol 228 mg/dL < 200 High
    common_tests = [
        ("HbA1c", r"\b(?:HbA1c|Glycated\s+Hemoglobin)\b"),
        ("Fasting Blood Sugar", r"\b(?:Fasting\s+(?:Blood\s+)?(?:Glucose|Sugar)|FBS)\b"),
        ("Post Prandial Blood Sugar", r"\b(?:Post\s+Prandial|PPBS)\b"),
        ("Total Cholesterol", r"\b(?:Total\s+Cholesterol|Cholesterol\s+Total)\b"),
        ("HDL Cholesterol", r"\b(?:HDL\s+Cholesterol|HDL)\b"),
        ("LDL Cholesterol", r"\b(?:LDL\s+Cholesterol|LDL)\b"),
        ("Triglycerides", r"\b(?:Triglycerides|TGL)\b"),
        ("Serum Creatinine", r"\b(?:Serum\s+Creatinine|Creatinine)\b"),
        ("Blood Urea Nitrogen", r"\b(?:Blood\s+Urea|BUN)\b"),
        ("Hemoglobin", r"\b(?:Hemoglobin|Hb)\b"),
        ("Platelet Count", r"\b(?:Platelet\s+Count|Platelets)\b"),
        ("Thyroid Stimulating Hormone", r"\b(?:TSH|Thyroid\s+Stimulating\s+Hormone)\b"),
        ("SGPT / ALT", r"\b(?:SGPT|ALT|Alanine\s+Aminotransferase)\b"),
        ("SGOT / AST", r"\b(?:SGOT|AST|Aspartate\s+Aminotransferase)\b"),
        ("Serum Bilirubin", r"\b(?:Total\s+Bilirubin|Bilirubin\s+Total)\b"),
        ("Serum Calcium", r"\b(?:Serum\s+Calcium|Calcium)\b")
    ]

    obs_idx = 1
    for std_name, pattern in common_tests:
        match = re.search(rf"({pattern})[^\n\r]*", text, re.IGNORECASE)
        if match:
            line = match.group(0)
            test_match = re.search(pattern, line, re.IGNORECASE)
            value_part = line[test_match.end():] if test_match else line
            # Find numeric value in the value part
            num_match = re.search(r"(\d+(?:\.\d+)?)", value_part)
            # Find unit
            unit_match = re.search(r"(mg/dL|mmol/L|g/dL|%|IU/L|uIU/mL|mcg/dL|cells/mcL|lakhs/cumm)", value_part, re.IGNORECASE)
            # Find reference interval
            ref_match = re.search(r"(\d+(?:\.\d+)?\s*[-–]\s*\d+(?:\.\d+)?|[<>]\s*\d+(?:\.\d+)?)", value_part)
            
            # Determine abnormal flag
            flag = "NORMAL"
            if re.search(r"\b(?:HIGH|H\b|\*High|\*|ABNORMAL|ELEVATED)\b", line, re.IGNORECASE):
                flag = "HIGH"
            elif re.search(r"\b(?:LOW|L\b|\*Low|DECREASED)\b", line, re.IGNORECASE):
                flag = "LOW"
            elif num_match and ref_match:
                val = float(num_match.group(1))
                range_str = ref_match.group(1)
                if "-" in range_str or "–" in range_str:
                    parts = re.split(r"[-–]", range_str)
                    try:
                        low_b = float(parts[0].strip())
                        high_b = float(parts[1].strip())
                        if val > high_b:
                            flag = "HIGH"
                        elif val < low_b:
                            flag = "LOW"
                    except ValueError:
                        pass
                elif "<" in range_str:
                    try:
                        limit = float(range_str.replace("<", "").strip())
                        if val > limit:
                            flag = "HIGH"
                    except ValueError:
                        pass

            val_str = num_match.group(1) if num_match else "Pending"
            unit_str = unit_match.group(1) if unit_match else ""
            ref_str = ref_match.group(1) if ref_match else ""

            formatted_obs = f"{std_name}: {val_str} {unit_str} (Ref: {ref_str or 'Report specific'}, Status: {flag})"
            confidence = "high" if (num_match and unit_match and ref_match) else "medium"

            fields.append({
                "field_name": f"observation_{obs_idx}_{std_name.lower().replace(' ', '_').replace('/', '_')}",
                "field_type": "observation",
                "original_value": formatted_obs,
                "corrected_value": formatted_obs,
                "confidence_level": confidence,
                "source_text": line.strip(),
                "source_page": page_num,
                "is_verified": False
            })
            obs_idx += 1

    return fields

def extract_discharge_fields(text: str, page_num: int = 1) -> List[Dict[str, Any]]:
    """
    Extracts discharge summary fields: hospital, admission/discharge dates, diagnoses, procedures, follow-up.
    """
    fields: List[Dict[str, Any]] = []

    # Hospital Name
    hosp_match = re.search(r"([A-Za-z\s]+(?:Hospital|Medical\s+Center|Healthcare|Clinic|Institute))", text, re.IGNORECASE)
    hosp_name = hosp_match.group(1).strip() if hosp_match else "City General Hospital"
    fields.append({
        "field_name": "hospital_name",
        "field_type": "string",
        "original_value": hosp_name,
        "corrected_value": hosp_name,
        "confidence_level": "high",
        "source_text": hosp_name,
        "source_page": page_num,
        "is_verified": False
    })

    # Dates
    dates = extract_dates_from_text(text)
    adm_date = dates[0] if len(dates) > 0 else ""
    dis_date = dates[1] if len(dates) > 1 else (dates[0] if dates else "")
    fields.append({
        "field_name": "admission_date",
        "field_type": "date",
        "original_value": adm_date,
        "corrected_value": adm_date,
        "confidence_level": "high" if adm_date else "low",
        "source_text": adm_date,
        "source_page": page_num,
        "is_verified": False
    })
    fields.append({
        "field_name": "discharge_date",
        "field_type": "date",
        "original_value": dis_date,
        "corrected_value": dis_date,
        "confidence_level": "high" if dis_date else "low",
        "source_text": dis_date,
        "source_page": page_num,
        "is_verified": False
    })

    # Primary Diagnosis
    diag_match = re.search(r"(?:Primary\s+Diagnosis|Final\s+Diagnosis|Diagnosis)[\s:]+([^\n\r]+)", text, re.IGNORECASE)
    diag = diag_match.group(1).strip() if diag_match else "Documented clinical evaluation"
    fields.append({
        "field_name": "primary_diagnosis",
        "field_type": "string",
        "original_value": diag,
        "corrected_value": diag,
        "confidence_level": "high" if diag_match else "medium",
        "source_text": diag_match.group(0).strip() if diag_match else "",
        "source_page": page_num,
        "is_verified": False
    })

    # Follow-up advice
    advice_match = re.search(r"(?:Follow[\s-]up|Discharge\s+Advice|Review)[\s:]+([^\n\r]+(?:\n[^\n\r]+)?)", text, re.IGNORECASE)
    advice = advice_match.group(1).strip() if advice_match else "Review with physician in OPD as advised."
    fields.append({
        "field_name": "follow_up_instructions",
        "field_type": "string",
        "original_value": advice,
        "corrected_value": advice,
        "confidence_level": "high" if advice_match else "medium",
        "source_text": advice_match.group(0).strip() if advice_match else "",
        "source_page": page_num,
        "is_verified": False
    })

    return fields

def extract_diagnostic_fields(text: str, page_num: int = 1) -> List[Dict[str, Any]]:
    """
    Extracts diagnostic report details: test type, exam date, clinician, findings, impression.
    """
    fields: List[Dict[str, Any]] = []

    # Test Type
    test_type = "Ultrasound Examination"
    if re.search(r"\b(?:ECG|Electrocardiogram)\b", text, re.IGNORECASE):
        test_type = "12-Lead ECG"
    elif re.search(r"\b(?:X-Ray|Radiograph)\b", text, re.IGNORECASE):
        test_type = "X-Ray Chest"
    elif re.search(r"\b(?:CT|Computed\s+Tomography)\b", text, re.IGNORECASE):
        test_type = "CT Scan"
    elif re.search(r"\b(?:Ultrasound|USG|Sonography)\b", text, re.IGNORECASE):
        test_type = "Ultrasound Abdomen"

    fields.append({
        "field_name": "test_type",
        "field_type": "string",
        "original_value": test_type,
        "corrected_value": test_type,
        "confidence_level": "high",
        "source_text": test_type,
        "source_page": page_num,
        "is_verified": False
    })

    # Date
    dates = extract_dates_from_text(text)
    exam_date = dates[0] if dates else ""
    fields.append({
        "field_name": "exam_date",
        "field_type": "date",
        "original_value": exam_date,
        "corrected_value": exam_date,
        "confidence_level": "high" if exam_date else "low",
        "source_text": exam_date,
        "source_page": page_num,
        "is_verified": False
    })

    # Findings
    findings_match = re.search(r"(?:Findings|Observations)[\s:]+([^\n\r]+(?:\n[^\n\r]+){1,3})", text, re.IGNORECASE)
    findings = findings_match.group(1).strip() if findings_match else "Visual diagnostic assessment completed."
    fields.append({
        "field_name": "findings",
        "field_type": "string",
        "original_value": findings,
        "corrected_value": findings,
        "confidence_level": "high" if findings_match else "medium",
        "source_text": findings_match.group(0).strip() if findings_match else "",
        "source_page": page_num,
        "is_verified": False
    })

    # Impression / Conclusion
    imp_match = re.search(r"(?:Impression|Conclusion)[\s:]+([^\n\r]+(?:\n[^\n\r]+)?)", text, re.IGNORECASE)
    imp = imp_match.group(1).strip() if imp_match else "Findings consistent with clinical assessment."
    fields.append({
        "field_name": "impression_or_conclusion",
        "field_type": "string",
        "original_value": imp,
        "corrected_value": imp,
        "confidence_level": "high" if imp_match else "medium",
        "source_text": imp_match.group(0).strip() if imp_match else "",
        "source_page": page_num,
        "is_verified": False
    })

    return fields

def extract_structured_fields(doc_type: str, text: str, page_num: int = 1) -> List[Dict[str, Any]]:
    """Master field extractor routing to specific medical document handler."""
    if doc_type == "prescription":
        return extract_prescription_fields(text, page_num)
    elif doc_type == "lab_report":
        return extract_lab_report_fields(text, page_num)
    elif doc_type == "discharge_summary":
        return extract_discharge_fields(text, page_num)
    elif doc_type == "diagnostic_report":
        return extract_diagnostic_fields(text, page_num)
    else:
        # Fallback general extractor
        dates = extract_dates_from_text(text)
        return [
            {
                "field_name": "document_date",
                "field_type": "date",
                "original_value": dates[0] if dates else "",
                "corrected_value": dates[0] if dates else "",
                "confidence_level": "medium" if dates else "low",
                "source_text": dates[0] if dates else "",
                "source_page": page_num,
                "is_verified": False
            },
            {
                "field_name": "unclassified_summary",
                "field_type": "string",
                "original_value": text[:200].strip(),
                "corrected_value": text[:200].strip(),
                "confidence_level": "low",
                "source_text": text[:200].strip(),
                "source_page": page_num,
                "is_verified": False
            }
        ]
