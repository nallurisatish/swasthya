import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Pill,
  Upload,
  GitCommit,
  LineChart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { HealthOverviewStats, HealthInsightItem, TimelineEvent } from '../types';
import { EvidenceInsightCard } from '../components/health/EvidenceInsightCard';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const DashboardPage: React.FC = () => {
  const { user, loadDemoSession } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState<HealthOverviewStats | null>(null);
  const [insights, setInsights] = useState<HealthInsightItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, insightsData] = await Promise.all([
        api.getHealthSummaryStats(),
        api.getHealthInsights()
      ]);
      setStats(statsData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    await loadDemoSession();
    fetchDashboardData();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Notice */}
      <DisclaimerBanner />

      {/* Header Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.dashboard.subtitle} &bull; Patient: <span className="font-semibold text-slate-800">{user?.full_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.actions.uploadDoc}</span>
          </Link>
          {stats?.total_documents === 0 && (
            <button
              onClick={handleSeedDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.actions.loadDemo}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{t.dashboard.totalDocs}</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats ? stats.total_documents : 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Uploaded clinical records</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">{t.dashboard.pendingReview}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900">
            {stats ? stats.pending_review : 0}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1">Awaiting human confirmation</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold">{t.dashboard.abnormalValues}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-900">
            {stats ? stats.abnormal_observations_count : 0}
          </div>
          <div className="text-[11px] text-rose-700/80 mt-1">Flagged outside lab range</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between text-teal-700 mb-2">
            <span className="text-xs font-semibold">{t.dashboard.activeMedications}</span>
            <Pill className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-extrabold text-teal-900">
            {stats ? stats.active_medications_count : 0}
          </div>
          <div className="text-[11px] text-teal-700/80 mt-1">Documented prescriptions</div>
        </div>
      </div>

      {/* Main Section: Evidence-Linked Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t.dashboard.evidenceInsights}
            </h2>
          </div>
          <span className="text-xs text-slate-500">Traceable to verified medical records</span>
        </div>

        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <EvidenceInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center">
            <p className="text-xs text-slate-500">{t.dashboard.noInsights}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                to="/upload"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Upload First Report
              </Link>
              <button
                onClick={handleSeedDemo}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"
              >
                Load Demo Patient
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">{t.dashboard.recentActivity}</h3>
            <Link to="/timeline" className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1">
              <span>Full Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.latest_health_events && stats.latest_health_events.length > 0 ? (
            <div className="space-y-3">
              {stats.latest_health_events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                      {evt.is_abnormal && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Out of range
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{evt.summary}</p>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {evt.event_date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No recent timeline events recorded.
            </div>
          )}
        </div>

        {/* Quick Tools */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Clinical Tools</h3>

          <Link
            to="/trends"
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
              <LineChart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Lab Trend Analytics</div>
              <div className="text-[11px] text-slate-500">Visualize longitudinal blood markers</div>
            </div>
          </Link>

          <Link
            to="/documents"
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Document Archive</div>
              <div className="text-[11px] text-slate-500">Browse verified source records</div>
            </div>
          </Link>

          <Link
            to="/fhir"
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">FHIR R4 Bundle Export</div>
              <div className="text-[11px] text-slate-500">Download ABDM interoperable records</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
