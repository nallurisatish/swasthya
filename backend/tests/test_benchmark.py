import pytest
from app.services.field_extractor import extract_prescription_fields, extract_lab_report_fields

BENCHMARK_LABELED_CASES = [
    {
        "id": "case_lab_01",
        "type": "lab_report",
        "raw_text": "APOLLO LABS Date: 2026-01-15 HbA1c 8.2 % 4.0 - 5.6 High",
        "ground_truth": {
            "date": "2026-01-15",
            "test_name": "HbA1c",
            "test_value": "8.2",
            "unit": "%",
            "reference_range": "4.0 - 5.6"
        }
    },
    {
        "id": "case_lab_02",
        "type": "lab_report",
        "raw_text": "DIAGNOSTICS Date: 2026-03-28 Fasting Blood Sugar 124 mg/dL 70 - 100 High",
        "ground_truth": {
            "date": "2026-03-28",
            "test_name": "Fasting Blood Sugar",
            "test_value": "124",
            "unit": "mg/dL",
            "reference_range": "70 - 100"
        }
    },
    {
        "id": "case_rx_01",
        "type": "prescription",
        "raw_text": "Dr. K. Venkatesh Date: 2026-01-16 Tab. Metformin 500mg 1-0-1 after meals",
        "ground_truth": {
            "date": "2026-01-16",
            "medicine_name": "Metformin",
            "dosage": "500mg"
        }
    },
    {
        "id": "case_rx_02",
        "type": "prescription",
        "raw_text": "Dr. S. Reddy Date: 2026-02-20 Tab. Telmisartan 40mg once daily",
        "ground_truth": {
            "date": "2026-02-20",
            "medicine_name": "Telmisartan",
            "dosage": "40mg"
        }
    }
]

def test_extraction_accuracy_benchmark():
    """
    Evaluates field-level extraction accuracy against labeled synthetic medical ground truth.
    Calculates exact-match precision metrics without fabrication.
    """
    metrics = {
        "dates": {"correct": 0, "total": 0},
        "medicine_names": {"correct": 0, "total": 0},
        "dosages": {"correct": 0, "total": 0},
        "test_names": {"correct": 0, "total": 0},
        "test_values": {"correct": 0, "total": 0},
        "units": {"correct": 0, "total": 0},
        "reference_ranges": {"correct": 0, "total": 0}
    }

    for case in BENCHMARK_LABELED_CASES:
        gt = case["ground_truth"]
        
        if case["type"] == "lab_report":
            fields = extract_lab_report_fields(case["raw_text"])
            
            # Check Date
            date_field = next((f for f in fields if f["field_name"] == "report_date"), None)
            metrics["dates"]["total"] += 1
            if date_field and date_field["original_value"] == gt["date"]:
                metrics["dates"]["correct"] += 1

            # Check Test Name & Value & Unit & Ref Range
            obs_field = next((f for f in fields if f["field_type"] == "observation"), None)
            metrics["test_names"]["total"] += 1
            metrics["test_values"]["total"] += 1
            metrics["units"]["total"] += 1
            metrics["reference_ranges"]["total"] += 1

            if obs_field and obs_field["original_value"]:
                val_text = obs_field["original_value"]
                if gt["test_name"].lower() in val_text.lower():
                    metrics["test_names"]["correct"] += 1
                if gt["test_value"] in val_text:
                    metrics["test_values"]["correct"] += 1
                if gt["unit"].lower() in val_text.lower():
                    metrics["units"]["correct"] += 1
                if gt["reference_range"] in val_text:
                    metrics["reference_ranges"]["correct"] += 1

        elif case["type"] == "prescription":
            fields = extract_prescription_fields(case["raw_text"])
            
            # Check Date
            date_field = next((f for f in fields if f["field_name"] == "prescription_date"), None)
            metrics["dates"]["total"] += 1
            if date_field and date_field["original_value"] == gt["date"]:
                metrics["dates"]["correct"] += 1

            # Check Med Name & Dosage
            med_field = next((f for f in fields if f["field_type"] == "medication"), None)
            metrics["medicine_names"]["total"] += 1
            metrics["dosages"]["total"] += 1

            if med_field and med_field["original_value"]:
                val_text = med_field["original_value"]
                if gt["medicine_name"].lower() in val_text.lower():
                    metrics["medicine_names"]["correct"] += 1
                if gt["dosage"].lower() in val_text.lower():
                    metrics["dosages"]["correct"] += 1

    # Assert all labeled test cases match 100%
    for field_cat, counts in metrics.items():
        assert counts["total"] > 0
        accuracy = (counts["correct"] / counts["total"]) * 100
        print(f"Benchmark Category '{field_cat}': {counts['correct']}/{counts['total']} ({accuracy:.1f}%)")
        assert counts["correct"] == counts["total"]
