# Swasthya Copilot — ABDM & FHIR R4 Interoperability Specification

## 1. Context and Objective
Under the **Ayushman Bharat Digital Mission (ABDM)**, health records must be interoperable across Health Information Providers (HIP) and Health Information Users (HIU). Swasthya Copilot maps internal database models to standardized **HL7 FHIR Release 4 (R4)** resources.

---

## 2. Resource Mapping Table

| Internal Model | FHIR R4 Resource | Standard Coding System | Mapping Description |
| :--- | :--- | :--- | :--- |
| `PatientProfile` / `User` | **Patient** | `https://healthid.ndhm.gov.in` (ABHA) | Patient name, gender, birth date, telecom, and mock ABHA number |
| `LaboratoryObservation` | **Observation** | `http://loinc.org`, `http://unitsofmeasure.org` | Diagnostic test names, quantitative values, units, reference intervals, and interpretation flags |
| `MedicationItem` | **MedicationRequest** | SNOMED-CT / RxNorm | Prescribed medication order, dosage instructions, frequency, and route |
| `DischargeSummary` | **Condition** | `http://hl7.org/fhir/sid/icd-10` | Documented primary & secondary discharge diagnoses |
| `Document` | **DocumentReference** | HL7 Attachment / MIME | Metadata regarding original uploaded medical file, mime type, and storage size |
| `AuditEvent` | **Provenance** | `http://terminology.hl7.org/CodeSystem/v3-DataOperation` | Originating actor, creation timestamp, and transformation integrity |

---

## 3. LOINC Codes for Common Indian Laboratory Investigations

```json
{
  "HbA1c": { "code": "4548-4", "display": "Hemoglobin A1c/Hemoglobin.total in Blood" },
  "Fasting Blood Sugar": { "code": "1558-6", "display": "Fasting glucose in Serum or Plasma" },
  "Total Cholesterol": { "code": "2093-3", "display": "Cholesterol in Serum or Plasma" },
  "Serum Creatinine": { "code": "2160-0", "display": "Creatinine in Serum or Plasma" },
  "Hemoglobin": { "code": "718-7", "display": "Hemoglobin in Blood" }
}
```

---

## 4. Live Export Endpoints
- **GET `/api/fhir/Bundle/{patient_id}`**: Returns the complete collection Bundle containing all resources for the patient.
- **GET `/api/fhir/mapping`**: Returns structured mapping metadata for automated conformance checks.
- **GET `/api/export/fhir`**: Triggers a direct JSON file download.
