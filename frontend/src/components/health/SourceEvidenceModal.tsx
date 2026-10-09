import React from 'react';
import { X, ExternalLink, ShieldCheck, FileText, Calendar, Hash, ArrowUpRight } from 'lucide-react';
import { HealthInsightItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

interface Props {
  insight: HealthInsightItem | null;
  onClose: () => void;
}

export const SourceEvidenceModal: React.FC<Props> = ({ insight, onClose }) => {
  const { language } = useLanguage();

  if (!insight) return null;

  const explanation =
    language === 'te' ? insight.plain_language_explanation_te : insight.plain_language_explanation_en;

  const vals = insight.supporting_values || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-700 text-teal-100 border border-teal-500/30">
                Evidence Provenance Trace
              </span>
              <span className="text-xs text-slate-300">ID: {insight.id.slice(0, 8)}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1.5">
              Verified Source & Traceability Data
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Plain language finding */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Health Finding ({language === 'te' ? 'తెలుగు' : 'English'})
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* Supporting Verified Values */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Supporting Verified Values (From Database)
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {Object.entries(vals).map(([key, value]) => (
                <div key={key} className="bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                  <div className="font-semibold text-teal-900 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="font-bold text-slate-800 mt-0.5 text-sm">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Document Traceability */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-500">
                <FileText className="w-4 h-4 text-teal-600" /> Source Document
              </span>
              <span className="font-semibold text-slate-800 font-mono">
                {insight.document_id ? `doc-${insight.document_id.slice(0, 8)}` : 'Verified Clinical Record'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Hash className="w-4 h-4 text-teal-600" /> Source Page / Field
              </span>
              <span className="font-semibold text-slate-800">
                Page {insight.source_page || 1} &bull; {insight.source_field || 'Clinical Findings'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verification Status
              </span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {insight.review_status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Model / Engine Provenance:</span>
              <span className="font-mono text-teal-700 font-semibold">{insight.model_or_template_provenance}</span>
            </div>
          </div>

          {/* Safety note */}
          <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs leading-relaxed">
            <span className="font-bold block text-amber-800">Safety & Clinical Boundary:</span>
            {insight.safety_note}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {insight.document_id ? (
            <Link
              to={`/documents/${insight.document_id}/review`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              <span>Inspect Source Document</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
