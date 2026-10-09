import React, { useEffect, useState } from 'react';
import {
  Layers,
  Server,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Workflow,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const ArchitecturePage: React.FC = () => {
  const { t } = useLanguage();
  const [providerStatus, setProviderStatus] = useState<any>(null);

  useEffect(() => {
    api.getAiProviderStatus().then(setProviderStatus).catch(console.error);
  }, []);

  const pipelineSteps = [
    { num: 1, title: 'Document Upload & Storage', desc: 'MIME validation, SHA-256 deduplication, isolated filesystem storage.' },
    { num: 2, title: 'Text Extraction & Preprocessing', desc: 'PyMuPDF embedded text parsing; OpenCV contrast and deskewing for scans.' },
    { num: 3, title: 'OCR Engine Routing', desc: 'Tesseract OCR execution with language pack detection and diagnostic status.' },
    { num: 4, title: 'Clinical Classification', desc: 'Heuristic keyword parsing: Prescription, Lab, Discharge, or Diagnostic.' },
    { num: 5, title: 'Structured Field Parsing', desc: 'Extracts tests, values, units, reference intervals, medications, doses.' },
    { num: 6, title: 'Confidence Scoring', desc: 'High/Medium/Low confidence tags with source quotes for human scrutiny.' },
    { num: 7, title: 'Human-in-the-Loop Review', desc: 'Side-by-side verification editor; prevents unconfirmed AI overwrite.' },
    { num: 8, title: 'Verified Record Persistence', desc: 'Normalized relational storage (SQLAlchemy) with user-level data isolation.' },
    { num: 9, title: 'Evidence-Grounded AI Summary', desc: 'Ollama Qwen model or Deterministic Healthcare Reasoning Engine.' },
    { num: 10, title: 'Bilingual Multilingual Layer', desc: 'Full Telugu and English explanations preserving drug names and units.' },
    { num: 11, title: 'Timeline & Trend Analytics', desc: 'Longitudinal time-series plotting with unit compatibility validation.' },
    { num: 12, title: 'ABDM / FHIR R4 Export', desc: 'Standard HL7 FHIR Bundle generation with mock ABHA identifiers.' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Architecture & Data Pipeline
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          End-to-end technical overview of Swasthya Copilot processing, security boundaries, and AI governance.
        </p>
      </div>

      {/* System Status Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-900">
              Active AI Intelligence Engine: {providerStatus?.active_engine || 'Deterministic Grounded Engine'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {providerStatus?.mode_description || 'Zero external API dependencies required for full demo.'}
          </p>
        </div>

        <div className="text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
          Backend: FastAPI &bull; Python 3.14 &bull; SQLite ORM
        </div>
      </div>

      {/* Mermaid Architecture Flow Visualization */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-md">
        <h3 className="text-sm font-bold text-teal-300 mb-4 flex items-center gap-2">
          <Workflow className="w-4 h-4" />
          <span>Architecture Flow Diagram</span>
        </h3>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
{`+----------------------------------------------------------------------------------------------------+
|                                    SWASTHYA COPILOT ARCHITECTURE                                   |
+----------------------------------------------------------------------------------------------------+
 [User / Browser] 
        |
        |--- React 19 + TypeScript + Vite + Tailwind CSS + Lucide + Recharts
        v
 [FastAPI Backend Service] (Port 8000)
        |
        +---> [Security & Auth Layer]: PBKDF2-HMAC-SHA256, JWT Token Validation, User Data Isolation
        |
        +---> [Document Ingestion]: File Validation, SHA-256 Hash Deduplication, Secure Local Storage
        |
        +---> [Extraction Pipeline]: 
        |        |--> PyMuPDF (Text-based PDF) / Pillow & OpenCV Preprocessing
        |        |--> OCR Engine Routing (Tesseract / Scanned Image Fallback)
        |        |--> Heuristic Classification: Prescription | Lab | Discharge | Diagnostic
        |        |--> Field Regex & Clinical Parsing (High / Med / Low Confidence Scoring)
        |
        +---> [Human-in-the-Loop Review Interface]: Side-by-Side User Verification
        |
        +---> [Database Persistence]: SQLAlchemy ORM -> SQLite / PostgreSQL
        |
        +---> [AI Intelligence Layer]:
        |        |--> Multi-Provider Adapter (Ollama Local Qwen / Deterministic Grounded Engine)
        |        |--> 7 Structured Grounded Summary Sections
        |        |--> Multilingual Localization (English & Telugu)
        |
        +---> [ABDM & FHIR R4 Interoperability]:
                 |--> FHIR Bundle Serialization (Patient, Obs LOINC, MedRequest, Condition)
                 |--> JSON Download & Mock ABHA Identifiers`}
        </div>
      </div>

      {/* Step by step pipeline cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-600" />
          <span>12-Step Document-to-Intelligence Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pipelineSteps.map((step) => (
            <div key={step.num} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-teal-900 mb-1">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                  {step.num}
                </span>
                <span>{step.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-7">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
