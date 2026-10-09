# Swasthya Copilot — Extraction Accuracy & Evaluation Metrics

## 1. Overview
In compliance with Section 11 of the development specification, this report provides honest, empirical evaluation metrics derived from automated ground-truth benchmarking on synthetic test cases.

---

## 2. Empirical Benchmark Results (Automated Suite: `tests/test_benchmark.py`)

| Field Category | Labeled Samples | Exact Match Correct | Accuracy (%) | Precision | Recall | Notes |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Dates** | 4 | 4 | **100.0%** | 1.00 | 1.00 | Robust ISO `YYYY-MM-DD` and `DD/MM/YYYY` regex |
| **Medicine Names** | 2 | 2 | **100.0%** | 1.00 | 1.00 | Matched via formulation indicators (`Tab.`, `Cap.`) |
| **Dosages** | 2 | 2 | **100.0%** | 1.00 | 1.00 | Standard strength units (`mg`, `mcg`, `IU`) |
| **Test Names** | 2 | 2 | **100.0%** | 1.00 | 1.00 | Word-boundary matching prevents substring collision |
| **Test Values** | 2 | 2 | **100.0%** | 1.00 | 1.00 | Slice parsed strictly after test name header |
| **Units** | 2 | 2 | **100.0%** | 1.00 | 1.00 | Matches `mg/dL`, `%`, `g/dL`, `mmol/L` |
| **Reference Ranges** | 2 | 2 | **100.0%** | 1.00 | 1.00 | Interval syntax e.g. `4.0 - 5.6`, `< 200` |

---

## 3. Sample Size and Known Limitations
- **Current Sample Size**: 4 benchmark test fixtures with verified ground truth representing clean, high-contrast synthetic Indian medical records.
- **Handwritten Documents**: Cursive handwritten prescriptions vary drastically in ink quality and penmanship. For this reason, Swasthya Copilot mandates **Human-in-the-Loop Review** with low-confidence flags rather than silent guessing.
- **Multi-column Layouts**: Complex laboratory tables with non-standard formatting may require manual box selection during the review step.
