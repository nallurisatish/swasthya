import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  TrendingDown,
  TrendingUp,
  Minus,
  FileText,
  Globe,
  ShieldAlert,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, HealthSummaryResponse } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const HealthSummaryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { language, setLanguage, t } = useLanguage();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [summary, setSummary] = useState<HealthSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialDocs();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      loadSummary(selectedDocId, language);
    }
  }, [selectedDocId, language]);

  const fetchInitialDocs = async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
      const paramDoc = searchParams.get('doc');
      if (paramDoc && docs.some((d) => d.id === paramDoc)) {
        setSelectedDocId(paramDoc);
      } else if (docs.length > 0) {
        setSelectedDocId(docs[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load documents list', err);
      setLoading(false);
    }
  };

  const loadSummary = async (docId: string, lang: string) => {
    setLoading(true);
    try {
      const data = await api.getDocumentSummary(docId, lang);
      setSummary(data);
    } catch (err) {
      console.error('Failed to generate summary', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header with Document Selector & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.summary.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded plain-language explanations with verified citations and historical tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Document Picker */}
          {documents.length > 0 && (
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_filename}
                </option>
              ))}
            </select>
          )}

          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                language === 'en' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                language === 'te' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center">
          <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Generating Grounded AI Summary...</h3>
          <p className="text-xs text-slate-500 mt-1">Synthesizing clinical findings and reference ranges.</p>
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Model Provenance Banner */}
          <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-200/80 flex items-center justify-between text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>
                Engine Provenance: <strong className="font-semibold">{summary.model_provenance}</strong>
              </span>
            </div>
            <span className="text-[11px] text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
              100% Grounded
            </span>
          </div>

          {/* Section 1: What this document says */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>{t.summary.whatDocSays}</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {summary.what_this_document_says}
            </p>
          </div>

          {/* Section 2: Key findings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.summary.keyFindings}</span>
            </h2>
            <ul className="space-y-2">
              {summary.key_findings.map((f, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Results outside reference range */}
          {summary.results_outside_reference_range.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{t.summary.abnormalResults}</span>
                </h2>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {summary.results_outside_reference_range.length} Flagged
                </span>
              </div>

              <div className="space-y-3">
                {summary.results_outside_reference_range.map((r, i) => (
                  <div key={i} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950">{r.test_name}</span>
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {r.measured_value} {r.unit} ({r.abnormal_flag})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Printed Laboratory Range: <strong>{r.reference_interval || 'Report specific'}</strong>
                    </div>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {r.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-[11px] text-amber-800 bg-amber-100/60 p-2.5 rounded-lg border border-amber-200">
                <strong>Clinical Note:</strong> A laboratory result outside printed intervals does not establish a medical diagnosis on its own. Always discuss with your clinician.
              </div>
            </div>
          )}

          {/* Section 4: Historical comparison */}
          {summary.historical_comparison.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>{t.summary.historicalTrend}</span>
              </h2>

              <div className="space-y-3">
                {summary.historical_comparison.map((h, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{h.test_name}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        {h.trend === 'decreased' && <TrendingDown className="w-4 h-4 text-emerald-600" />}
                        {h.trend === 'increased' && <TrendingUp className="w-4 h-4 text-rose-600" />}
                        {h.trend === 'stable' && <Minus className="w-4 h-4 text-slate-500" />}
                        <span className="capitalize">{h.trend}</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Previous: {h.previous_value} {h.unit} ({h.previous_date}) &rarr; Current: {h.current_value} {h.unit} ({h.current_date})
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">{h.cautious_note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Questions for Clinician */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>{t.summary.doctorQuestions}</span>
            </h2>
            <ul className="space-y-2">
              {summary.questions_for_clinician.map((q, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/60">
                  <span className="font-bold text-indigo-700">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 6: Important documented instructions */}
          {summary.important_documented_instructions.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-teal-600" />
                <span>{t.summary.documentedInstructions}</span>
              </h2>
              <ul className="space-y-2">
                {summary.important_documented_instructions.map((inst, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 7: Source references */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              {t.summary.sourceEvidence}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {summary.source_references.map((ref, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-600">
                  {Object.entries(ref).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-400 capitalize">{k}:</span> {String(v)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No document selected or summary available.
        </div>
      )}
    </div>
  );
};
