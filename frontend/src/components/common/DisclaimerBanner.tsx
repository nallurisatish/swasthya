import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>{t.disclaimer}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-slate-100 p-4 rounded-xl shadow-sm border border-teal-800 flex items-start gap-3">
      <div className="p-2 bg-teal-800/60 rounded-lg text-teal-300 flex-shrink-0 mt-0.5">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-teal-200">Clinical Informational Notice</h4>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
};
