import React, { useEffect, useState } from 'react';
import {
  Shield,
  Lock,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Eye,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { ConsentRecordItem, AuditEventItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyConsentPage: React.FC = () => {
  const { t } = useLanguage();
  const [consents, setConsents] = useState<ConsentRecordItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consentsData, auditData] = await Promise.all([
        api.getConsents(),
        api.getAuditEvents()
      ]);
      setConsents(consentsData);
      setAuditEvents(auditData);
    } catch (err) {
      console.error('Failed to load consent/audit data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = async (type: string, currentStatus: string) => {
    const newStatus = currentStatus === 'granted' ? 'revoked' : 'granted';
    try {
      await api.updateConsent(type, newStatus);
      setConsents(
        consents.map((c) =>
          c.consent_type === type ? { ...c, status: newStatus as 'granted' | 'revoked' } : c
        )
      );
    } catch (err) {
      alert('Failed to update consent.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {t.nav.consent}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Full patient control over health data sharing, AI processing permissions, and immutable audit logs.
        </p>
      </div>

      {/* Consent Directives */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>Patient Consent Directives</span>
        </h3>

        <div className="space-y-3">
          {consents.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-800 capitalize">
                  <span>{c.consent_type.replace(/_/g, ' ')}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.status === 'granted'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{c.details}</p>
              </div>

              <button
                onClick={() => handleToggleConsent(c.consent_type, c.status)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap self-start sm:self-auto ${
                  c.status === 'granted'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                {c.status === 'granted' ? 'Revoke Consent' : 'Grant Consent'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export & Privacy Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-teal-600" />
            <span>Data Portability & Export</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Download your full longitudinal record at any time in standardized formats.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <a
              href="/api/export/records"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors"
            >
              <span>Download Structured JSON Records</span>
              <FileText className="w-4 h-4 text-teal-600" />
            </a>
            <a
              href="/api/export/fhir"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors"
            >
              <span>Download Complete FHIR R4 Bundle</span>
              <Download className="w-4 h-4 text-teal-600" />
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            <span>Privacy & Processing Notice</span>
          </h3>
          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              &bull; <strong>Local Data Sovereignty:</strong> Medical records and OCR extractions reside securely within your local environment.
            </p>
            <p>
              &bull; <strong>AI Processing Boundaries:</strong> Plain language summaries are generated via deterministic grounded templates or your local Ollama instance. No private medical data is sold or dispatched to commercial third-party advertising brokers.
            </p>
          </div>
        </div>
      </div>

      {/* Security Audit Log Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Security & Access Audit Trail</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Resource Target</th>
                <th className="p-3">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-slate-800 uppercase">
                    {evt.event_type.replace(/_/g, ' ')}
                  </td>
                  <td className="p-3 text-slate-600">
                    {evt.resource_type ? `${evt.resource_type} (${evt.resource_id?.slice(0, 8)})` : '-'}
                  </td>
                  <td className="p-3 font-mono text-slate-400">{evt.ip_address || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
