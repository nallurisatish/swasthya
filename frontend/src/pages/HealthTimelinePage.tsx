import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCommit,
  Calendar,
  Filter,
  AlertTriangle,
  FileText,
  Pill,
  Hospital,
  Activity,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { TimelineEvent } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const HealthTimelinePage: React.FC = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, [selectedCategory, onlyAbnormal]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const data = await api.getTimeline({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        isAbnormal: onlyAbnormal ? true : undefined
      });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load timeline', err);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'lab_result':
        return <Activity className="w-4 h-4 text-sky-600" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-teal-600" />;
      case 'discharge':
        return <Hospital className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const categories = ['all', 'Endocrinology', 'Internal Medicine', 'Cardiology', 'Radiology', 'General'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.nav.timeline}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Unified longitudinal chronological history of all verified clinical events.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent py-1 pr-2 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Specialties' : c}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={onlyAbnormal}
              onChange={(e) => setOnlyAbnormal(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
            />
            <span>Only Abnormal / Flagged</span>
          </label>
        </div>
      </div>

      {/* Timeline Stream */}
      {events.length > 0 ? (
        <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6 py-2">
          {events.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center shadow-sm ${
                  evt.is_abnormal
                    ? 'border-rose-500 text-rose-600'
                    : 'border-teal-600 text-teal-600'
                }`}
              >
                {getEventIcon(evt.event_type)}
              </div>

              {/* Event Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {evt.clinical_category}
                    </span>
                    {evt.is_abnormal && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Abnormal</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{evt.event_date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {evt.summary}
                </p>

                {evt.document_id && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-mono">
                      Ref Doc: doc-{evt.document_id.slice(0, 8)}
                    </span>
                    <Link
                      to={`/documents/${evt.document_id}/review`}
                      className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-900"
                    >
                      <span>Open Verified Extraction</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No timeline events match the selected filter.
        </div>
      )}
    </div>
  );
};
