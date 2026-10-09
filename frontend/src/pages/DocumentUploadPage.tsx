import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const DocumentUploadPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const handleFileSelect = (file: File) => {
    setError(null);
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      setError('Unsupported file type. Please upload a PDF, JPG, JPEG, or PNG document.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(20);
    setError(null);

    try {
      setUploadProgress(50);
      const doc = await api.uploadDocument(selectedFile);
      setUploadProgress(100);

      // Redirect directly to the human-in-the-loop review interface
      setTimeout(() => {
        navigate(`/documents/${doc.id}/review`);
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and process document.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {t.actions.uploadDoc}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload medical prescriptions, laboratory reports, discharge summaries, or imaging tests.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-sm font-bold text-slate-900">
          Drag and drop your medical file here, or browse
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Supports PDF, JPG, JPEG, and PNG formats (up to 25MB)
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Encrypted storage with SHA-256 deduplication and private isolation</span>
        </div>
      </div>

      {/* Selected File Details & Upload Action */}
      {selectedFile && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex-shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 truncate max-w-sm">
                {selectedFile.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.type || 'Document'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadSubmit}
              disabled={uploading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Extraction...</span>
                </>
              ) : (
                <>
                  <span>Upload & Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Processing Explanation Steps */}
      <div className="bg-slate-100/70 p-6 rounded-2xl border border-slate-200/80">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Automated Processing Pipeline
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200/70">
            <span className="font-bold text-teal-800 block">1. File Validation</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">SHA-256 hash calculation and virus sanitization</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/70">
            <span className="font-bold text-teal-800 block">2. Text Extraction</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">PyMuPDF / OCR page rendering and deskewing</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/70">
            <span className="font-bold text-teal-800 block">3. Field Parsing</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Clinical classification and candidate field extraction</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/70">
            <span className="font-bold text-teal-800 block">4. Human Review</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Side-by-side verification before final persistence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
