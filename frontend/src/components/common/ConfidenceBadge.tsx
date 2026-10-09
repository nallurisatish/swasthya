import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  level: 'high' | 'medium' | 'low';
  showLabel?: boolean;
}

export const ConfidenceBadge: React.FC<Props> = ({ level, showLabel = true }) => {
  const { t } = useLanguage();

  if (level === 'high') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        {showLabel && t.status.high}
      </span>
    );
  }

  if (level === 'medium') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
        <HelpCircle className="w-3 h-3 text-sky-600" />
        {showLabel && t.status.medium}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
      <AlertCircle className="w-3 h-3 text-amber-600" />
      {showLabel && t.status.low}
    </span>
  );
};
