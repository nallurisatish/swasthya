import React, { useState } from 'react';
import { Sparkles, FileSearch, TrendingUp, AlertTriangle, Pill, ShieldCheck } from 'lucide-react';
import { HealthInsightItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { SourceEvidenceModal } from './SourceEvidenceModal';

interface Props {
  insight: HealthInsightItem;
}

export const EvidenceInsightCard: React.FC<Props> = ({ insight }) => {
  const { language, t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const explanation =
    language === 'te' ? insight.plain_language_explanation_te : insight.plain_language_explanation_en;

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'trend_alert':
        return { label: 'Trend Alert', icon: TrendingUp, color: 'text-sky-700 bg-sky-50 border-sky-200' };
      case 'abnormal_lab':
        return { label: 'Out of Range', icon: AlertTriangle, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'medication_adherence':
        return { label: 'Medication Instruction', icon: Pill, color: 'text-teal-700 bg-teal-50 border-teal-200' };
      default:
        return { label: 'Health Insight', icon: Sparkles, color: 'text-slate-700 bg-slate-50 border-slate-200' };
    }
  };

  const meta = getCategoryMeta(insight.insight_category);
  const Icon = meta.icon;

  return (
    <>
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${meta.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {meta.label}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Verified Source
            </span>
          </div>

          {/* Explanation */}
          <p className="text-sm text-slate-800 font-medium leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* Action footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
            Field: <span className="font-semibold text-slate-700">{insight.source_field || 'Clinical Findings'}</span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-200 transition-colors"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>{t.actions.viewSource}</span>
          </button>
        </div>
      </div>

      <SourceEvidenceModal
        insight={showModal ? insight : null}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
