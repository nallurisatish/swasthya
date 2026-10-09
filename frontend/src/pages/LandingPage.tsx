import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Sparkles,
  ShieldCheck,
  Languages,
  FileCheck2,
  LineChart,
  Share2,
  Lock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const LandingPage: React.FC = () => {
  const { loadDemoSession, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    await loadDemoSession();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-4 w-full">
        <DisclaimerBanner compact />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>AI-Powered Personal Health Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Your Health Records.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
              Clearly Connected.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Convert fragmented Indian medical prescriptions, laboratory reports, and hospital discharge summaries into traceable, plain-language health intelligence in English and Telugu.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDemoClick}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-lg shadow-teal-700/25 flex items-center gap-2 text-sm transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch 1-Click Interactive Demo</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="px-6 py-3.5 bg-white text-slate-800 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-sm transition-colors shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-6 py-3.5 bg-white text-slate-800 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-sm transition-colors shadow-sm"
              >
                Create Account
              </Link>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Grounded Evidence Tracing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> English & Telugu Multilingual
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ABDM / FHIR R4 Ready
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Human-in-the-Loop OCR Verification</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Side-by-side verification editor ensures you inspect and correct candidate medications and dosages with confidence indicators before saving.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4 border border-sky-100">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Longitudinal Laboratory Analytics</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Track HbA1c, glucose, lipid, and renal markers over time with report-specific reference intervals and source-linked citations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 border border-indigo-100">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ABDM & FHIR R4 Interoperability</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Export standardized clinical bundles with mock ABHA identifiers, Observation LOINC codes, and full provenance tracking.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
