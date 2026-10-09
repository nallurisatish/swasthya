import React, { useEffect, useState } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  FileCode,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const FhirExportPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [bundle, setBundle] = useState<any>(null);
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadFhirData();
  }, [user]);

  const loadFhirData = async () => {
    setLoading(true);
    try {
      const [bundleData, mapData] = await Promise.all([
        api.getFhirBundle(user?.id || 'current'),
        api.getFhirMappings()
      ]);
      setBundle(bundleData);
      setMappings(mapData);
    } catch (err) {
      console.error('Failed to load FHIR data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!bundle) return;
    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!bundle) return;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhir_bundle_${user?.id?.slice(0, 8) || 'patient'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              Module J &bull; Interoperability Layer
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            {t.fhir.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.fhir.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJson}
            disabled={!bundle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            disabled={!bundle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.fhir.bundleExport}</span>
          </button>
        </div>
      </div>

      {/* ABDM Readiness Architecture Card */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>National Health Stack (NDHM / ABDM) Alignment</span>
            </div>
            <h2 className="text-base font-bold text-white mt-1.5">
              Standardized FHIR R4 Bundle Serialization
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Swasthya Copilot structures patient records with valid FHIR resource types (Patient, Observation with LOINC codes, MedicationRequest, Condition, and Provenance audit headers) ready for linking with the ABDM Health Information Provider (HIP) and Health Information User (HIU) interfaces.
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/10 text-xs space-y-1.5 font-mono">
            <div>Resource Type: <strong className="text-teal-300">Bundle (Collection)</strong></div>
            <div>Total Resources: <strong className="text-white">{bundle?.total || 0}</strong></div>
            <div>Mock ABHA: <strong className="text-white">{user?.profile?.abha_id || '91-9876-5432-1098'}</strong></div>
          </div>
        </div>
      </div>

      {/* JSON Viewer and Resource Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Live JSON Code Viewer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-600" />
              <span>FHIR R4 Bundle JSON Payload</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              application/fhir+json
            </span>
          </div>

          <pre className="flex-1 bg-slate-900 text-teal-300 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[500px] selection:bg-teal-700">
            {loading ? 'Serializing FHIR Bundle...' : JSON.stringify(bundle, null, 2)}
          </pre>
        </div>

        {/* Right: Internal-to-FHIR Mapping Schema Documentation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>{t.fhir.resourceMapping}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Field correspondences between Swasthya Copilot database entities and HL7 FHIR R4 standard.
            </p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {mappings.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{m.entity_name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    FHIR: {m.fhir_resource_type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mb-2">{m.description}</p>
                <div className="bg-white p-2 rounded-lg border border-slate-200/60 font-mono text-[10px] text-slate-700 space-y-0.5">
                  {m.mapping_rules.map((rule: string, rIdx: number) => (
                    <div key={rIdx} className="truncate">&bull; {rule}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regulatory Limitation Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-3">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>
          <strong>ABDM Note:</strong> This local demonstration generates authentic FHIR R4 compliant schemas with synthetic ABHA identifiers. Live integration with the ABDM Gateway requires active sandbox API client credentials.
        </span>
      </div>
    </div>
  );
};
