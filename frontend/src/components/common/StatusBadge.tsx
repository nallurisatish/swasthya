import React from 'react';
import { Clock, CheckCircle, AlertTriangle, XCircle, FileSearch } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  status: 'uploaded' | 'processing' | 'review_required' | 'completed' | 'failed';
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const { t } = useLanguage();

  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          {t.status.completed}
        </span>
      );
    case 'review_required':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          {t.status.review_required}
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <FileSearch className="w-3.5 h-3.5 text-sky-600 animate-spin" />
          {t.status.processing}
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          {t.status.failed}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          {t.status.uploaded}
        </span>
      );
  }
};
