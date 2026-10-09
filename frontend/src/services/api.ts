import axios from 'axios';
import {
  DocumentItem,
  TimelineEvent,
  LabTrendResponse,
  HealthInsightItem,
  HealthSummaryResponse,
  HealthOverviewStats,
  ConsentRecordItem,
  AuditEventItem,
  ExtractedField
} from '../types';

export const api = {
  // Documents
  getDocuments: async (): Promise<DocumentItem[]> => {
    const res = await axios.get('/api/documents');
    return res.data;
  },

  getDocument: async (id: string): Promise<DocumentItem> => {
    const res = await axios.get(`/api/documents/${id}`);
    return res.data;
  },

  uploadDocument: async (file: File): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  confirmExtractions: async (
    documentId: string,
    updates: Array<{ id: string; corrected_value: string }>,
    notes?: string
  ): Promise<DocumentItem> => {
    const res = await axios.post(`/api/documents/${documentId}/confirm`, {
      field_updates: updates,
      review_notes: notes
    });
    return res.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await axios.delete(`/api/documents/${id}`);
  },

  // Health Intelligence
  getTimeline: async (filters?: {
    category?: string;
    isAbnormal?: boolean;
  }): Promise<TimelineEvent[]> => {
    const params: any = {};
    if (filters?.category) params.clinical_category = filters.category;
    if (filters?.isAbnormal !== undefined) params.is_abnormal = filters.isAbnormal;
    const res = await axios.get('/api/health/timeline', { params });
    return res.data;
  },

  getHealthSummaryStats: async (): Promise<HealthOverviewStats> => {
    const res = await axios.get('/api/health/summary');
    return res.data;
  },

  getLabTrends: async (testName: string): Promise<LabTrendResponse> => {
    const res = await axios.get(`/api/health/trends/${encodeURIComponent(testName)}`);
    return res.data;
  },

  getHealthInsights: async (): Promise<HealthInsightItem[]> => {
    const res = await axios.get('/api/health/insights');
    return res.data;
  },

  // AI Summaries
  getDocumentSummary: async (documentId: string, language: string = 'en'): Promise<HealthSummaryResponse> => {
    const res = await axios.post(`/api/ai/summarize/${documentId}?language=${language}`);
    return res.data;
  },

  getAiProviderStatus: async () => {
    const res = await axios.get('/api/ai/provider-status');
    return res.data;
  },

  // Interoperability & Export
  getFhirBundle: async (patientId: string = 'current') => {
    const res = await axios.get(`/api/fhir/Bundle/${patientId}`);
    return res.data;
  },

  getFhirMappings: async () => {
    const res = await axios.get('/api/fhir/mapping');
    return res.data;
  },

  // Consent & Audit
  getConsents: async (): Promise<ConsentRecordItem[]> => {
    const res = await axios.get('/api/consent');
    return res.data;
  },

  updateConsent: async (type: string, status: 'granted' | 'revoked'): Promise<ConsentRecordItem> => {
    const res = await axios.post('/api/consent', { consent_type: type, status });
    return res.data;
  },

  getAuditEvents: async (): Promise<AuditEventItem[]> => {
    const res = await axios.get('/api/audit');
    return res.data;
  },

  // Demo Simulation
  loadDemoData: async () => {
    const res = await axios.post('/api/demo/load');
    return res.data;
  },

  resetDemoData: async () => {
    const res = await axios.post('/api/demo/reset');
    return res.data;
  }
};
