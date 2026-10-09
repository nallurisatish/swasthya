import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileSearch,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  History,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, ExtractedField } from '../types';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useLanguage } from '../context/LanguageContext';

export const DocumentReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [pagesText, setPagesText] = useState<Array<{ page_number: number; raw_text: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDocData(id);
    }
  }, [id]);

  const loadDocData = async (docId: string) => {
    setLoading(true);
    try {
      const [docData, pagesRes] = await Promise.all([
        api.getDocument(docId),
        fetch(`/api/documents/${docId}/pages`).then((r) => r.json())
      ]);
      setDocument(docData);
      setFields(docData.extracted_fields || []);
      setPagesText(pagesRes || []);
    } catch (err) {
      console.error('Failed to load document review data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, newValue: string) => {
    setFields(
      fields.map((f) => (f.id === fieldId ? { ...f, corrected_value: newValue } : f))
    );
  };

  const handleConfirmSave = async () => {
    if (!document) return;
    setSaving(true);
    try {
      const updates = fields.map((f) => ({
        id: f.id,
        corrected_value: f.corrected_value || f.original_value || ''
      }));
      const updatedDoc = await api.confirmExtractions(document.id, updates, reviewNotes);
      setDocument(updatedDoc);
      setSuccessMessage('Medical extractions successfully verified and persisted to health profile!');
      setTimeout(() => {
        navigate(`/summary?doc=${document.id}`);
      }, 1200);
    } catch (err) {
      alert('Failed to save verified fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading document extractions...
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Document not found.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/documents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Archive</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {t.review.title}
            </h1>
            <StatusBadge status={document.processing_status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.review.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleConfirmSave}
            disabled={saving}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Persisting...' : t.actions.confirmAndSave}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Side-by-Side Verification Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Original Document / Raw OCR Source */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">{t.review.originalDocPreview}</h3>
            </div>
            <a
              href={`/api/documents/${document.id}/original`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Open Original
            </a>
          </div>

          <div className="flex-1 bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-y-auto max-h-[550px] leading-relaxed whitespace-pre-wrap selection:bg-teal-600">
            {pagesText.length > 0
              ? pagesText.map((p) => (
                  <div key={p.page_number} className="mb-4">
                    <div className="text-[10px] text-teal-400 font-bold mb-1 pb-1 border-b border-slate-800">
                      --- PAGE {p.page_number} (OCR Engine: {document.ocr_engine_used}) ---
                    </div>
                    {p.raw_text}
                  </div>
                ))
              : 'No raw page text available for preview.'}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              Compare the candidate fields on the right against the source text above. OCR never overwrites records without user confirmation.
            </span>
          </div>
        </div>

        {/* Right Panel: Editable Structured Fields */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">{t.review.extractedFields}</h3>
            </div>
            <span className="text-xs text-slate-500">
              {fields.length} candidate fields parsed
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[550px] pr-1">
            {fields.map((fld) => (
              <div
                key={fld.id}
                className={`p-4 rounded-xl border transition-colors ${
                  fld.confidence_level === 'low'
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {fld.field_name}
                  </span>
                  <ConfidenceBadge level={fld.confidence_level} />
                </div>

                {fld.source_text && (
                  <div className="mb-2 text-[11px] text-slate-500 italic bg-white/70 p-2 rounded-lg border border-slate-200/50">
                    Source quote: "{fld.source_text}"
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Verified Value (Editable)
                  </label>
                  <input
                    type="text"
                    value={fld.corrected_value || fld.original_value || ''}
                    onChange={(e) => handleFieldChange(fld.id, e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Review Notes & Audit Remarks
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="e.g. Corrected handwritten dosage from 10mg to 40mg per doctor note."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <button
              onClick={handleConfirmSave}
              disabled={saving}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'Persisting...' : t.actions.confirmAndSave}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
