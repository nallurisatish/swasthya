import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  FileSearch,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useLanguage } from '../context/LanguageContext';

export const DocumentLibraryPage: React.FC = () => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document and its associated records?')) {
      try {
        await api.deleteDocument(id);
        setDocuments(documents.filter((d) => d.id !== id));
      } catch (err) {
        alert('Failed to delete document.');
      }
    }
  };

  const filteredDocs =
    filterType === 'all'
      ? documents
      : documents.filter((d) => d.document_type === filterType);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t.nav.documents}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and manage your uploaded clinical documents, extractions, and summaries.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{t.actions.uploadDoc}</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'lab_report', 'prescription', 'discharge_summary', 'diagnostic_report'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filterType === cat
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? t.actions.filterAll : t.docTypes[cat as keyof typeof t.docTypes]}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <StatusBadge status={doc.processing_status} />
                </div>

                <h3 className="text-sm font-bold text-slate-900 truncate" title={doc.original_filename}>
                  {doc.original_filename}
                </h3>

                <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Category:</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {doc.document_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File Size:</span>
                    <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="font-mono text-slate-600">{doc.ocr_engine_used}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/documents/${doc.id}/review`}
                    className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Review Extractions"
                  >
                    <FileSearch className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/summary?doc=${doc.id}`}
                    className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                    title="AI Health Summary"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Link>

                  <a
                    href={`/api/documents/${doc.id}/original`}
                    download={doc.original_filename}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Download Original"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">{t.dashboard.emptyDocs}</h3>
          <p className="text-xs text-slate-500 mt-1">Upload files to populate your health intelligence archive.</p>
          <div className="mt-4">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.actions.uploadDoc}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
