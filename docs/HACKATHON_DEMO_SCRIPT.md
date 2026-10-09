# Swasthya Copilot — 3-Minute Hackathon Presentation Script

## Judging Criteria Alignment Map

| Hackathon Criterion | Where Demonstrated in Demo | Key Visual / Technical Feature |
| :--- | :--- | :--- |
| **Technical Architecture** | Dashboard, Pipeline diagram | FastAPI + React 19 + SQLite ORM, 12-stage ingestion pipeline |
| **AI Utilization & Grounding** | Grounded Summaries & Insights | Multi-provider Ollama adapter + Deterministic engine; zero hallucinations |
| **Distinctive Differentiator** | "View Source" Evidence Modal | Every insight links directly to exact source field, document, and values |
| **User Experience & Safety** | Review Interface & Disclaimers | Side-by-side human-in-the-loop verification, persistent medical notices |
| **Multi-Language Support** | Language Switcher | Full **English & Telugu** UI and clinical summaries |
| **ABDM / FHIR R4 Bonus** | FHIR Bundle Explorer | Live FHIR R4 collection bundle export with mock ABHA identifier |

---

## The 3-Minute Presentation Walkthrough

### 0:00 – 0:30 | The Problem & 1-Click Launch
> *"Good morning judges. Patients in India carry plastic folders stuffed with disjointed prescriptions, lab reports, and discharge summaries. They struggle to understand technical jargon, identify out-of-range lab markers, or remember instructions. Welcome to **Swasthya Copilot** — Your Personal Health Intelligence Platform."*
- **Action**: Click **"Launch 1-Click Interactive Demo"** on the landing page.
- **Show**: Instant authentication into synthetic patient **Sita Ramanathan (48F, ABHA: 91-9876-5432-1098)**.

### 0:30 – 1:15 | Dashboard & Evidence-Linked Intelligence
> *"Notice our main differentiator: **Evidence-Linked Health Intelligence**. Look at this card explaining Sita's HbA1c drop from 8.2% to 7.1%. When the user clicks **'View Source'**, the platform opens a verified traceability modal showing the exact supporting measurements, report date, and the original document ID."*
- **Action**: Click **"View Source"** on the HbA1c Trend Alert insight.
- **Show**: Supporting verified values (`8.2%` vs `7.1%`, reference interval `4.0-5.6%`, engine provenance).

### 1:15 – 1:55 | Multilingual Experience (English & Telugu)
> *"Healthcare in India must speak the patient's language. With one click on our language switcher, the entire interface and clinical summaries transition between English and Telugu while preserving drug names and units."*
- **Action**: Click **"తెలుగు"** in the top navbar.
- **Show**: Instant translation of navigation, summaries, and terminology explanations into fluent Telugu.
- **Action**: Switch back to English or navigate to `/summary`.

### 1:55 – 2:30 | Mandatory Human-in-the-Loop Review & Trend Analytics
> *"We adhere strictly to safety: no AI can hallucinate or overwrite a medical record without human confirmation. Here is our side-by-side verification editor showing the raw OCR text alongside editable candidate fields with confidence badges."*
- **Action**: Click on **"Extraction Review"** for the pending document. Show High/Med/Low badges and click **"Confirm & Save"**.
- **Action**: Navigate to **"Lab Trends & Analytics"** (`/trends`). Show the Recharts time-series curve plotting Sita's HbA1c and Fasting Glucose across January and March 2026.

### 2:30 – 3:00 | ABDM & FHIR R4 Interoperability
> *"Finally, Swasthya Copilot is built for India's national health stack. Under **ABDM & FHIR R4**, we export the patient's complete longitudinal record as a valid HL7 FHIR Release 4 Collection Bundle with LOINC codings and mock ABHA number."*
- **Action**: Open `/fhir`. Show live JSON payload and click **"Copy JSON"** or **"Download Complete FHIR R4 Bundle"**.
- **Closing**: *"Thank you judges — Swasthya Copilot brings clarity, safety, and connection to personal health records."*
