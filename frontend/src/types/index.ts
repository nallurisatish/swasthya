export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_demo_user: boolean;
  profile?: PatientProfile;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  abha_id?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  preferred_language: string;
  chronic_conditions: string[];
  verified_allergies: string[];
}

export interface DocumentItem {
  id: string;
  user_id: string;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  mime_type: string;
  content_hash: string;
  page_count: number;
  document_type: 'prescription' | 'lab_report' | 'discharge_summary' | 'diagnostic_report' | 'unknown';
  processing_status: 'uploaded' | 'processing' | 'review_required' | 'completed' | 'failed';
  error_message?: string;
  ocr_engine_used: string;
  has_uncertain_fields: boolean;
  upload_timestamp: string;
  extracted_fields?: ExtractedField[];
}

export interface ExtractedField {
  id: string;
  document_id: string;
  field_name: string;
  field_type: string;
  original_value?: string;
  corrected_value?: string;
  confidence_level: 'high' | 'medium' | 'low';
  source_text?: string;
  source_page: number;
  bounding_box?: string;
  is_manually_corrected: boolean;
  is_verified: boolean;
}

export interface TimelineEvent {
  id: string;
  document_id?: string;
  event_date: string;
  event_type: 'prescription' | 'lab_result' | 'discharge' | 'diagnostic' | 'document_upload';
  title: string;
  summary: string;
  clinical_category: string;
  is_abnormal: boolean;
  is_verified: boolean;
  reference_id?: string;
  reference_type?: string;
}

export interface LabTrendPoint {
  date: string;
  value: number;
  display_value: string;
  unit: string;
  reference_low?: number;
  reference_high?: number;
  reference_interval_str?: string;
  abnormal_flag: string;
  document_id: string;
  document_name: string;
}

export interface LabTrendResponse {
  test_name: string;
  standardized_test_name: string;
  unit: string;
  data_points: LabTrendPoint[];
  has_incompatible_units: boolean;
  earliest_date?: string;
  latest_date?: string;
  trend_direction: 'increased' | 'decreased' | 'stable' | 'insufficient_data';
  clinical_caution: string;
}

export interface HealthInsightItem {
  id: string;
  document_id?: string;
  observation_id?: string;
  medication_id?: string;
  insight_category: string;
  plain_language_explanation_en: string;
  plain_language_explanation_te: string;
  language: string;
  supporting_values: Record<string, any>;
  source_page: number;
  source_field?: string;
  safety_note: string;
  model_or_template_provenance: string;
  review_status: string;
  created_at: string;
}

export interface HealthSummaryResponse {
  document_id: string;
  language: string;
  what_this_document_says: string;
  key_findings: string[];
  results_outside_reference_range: Array<{
    test_name: string;
    measured_value: string;
    unit?: string;
    reference_interval?: string;
    abnormal_flag: string;
    explanation: string;
  }>;
  historical_comparison: Array<{
    test_name: string;
    previous_date: string;
    previous_value: string;
    current_date: string;
    current_value: string;
    unit: string;
    trend: string;
    cautious_note: string;
  }>;
  questions_for_clinician: string[];
  important_documented_instructions: string[];
  source_references: Array<Record<string, any>>;
  disclaimer: string;
  model_provenance: string;
}

export interface HealthOverviewStats {
  total_documents: number;
  pending_review: number;
  completed_documents: number;
  abnormal_observations_count: number;
  active_medications_count: number;
  latest_health_events: TimelineEvent[];
}

export interface ConsentRecordItem {
  id: string;
  consent_type: string;
  status: 'granted' | 'revoked';
  details?: string;
  granted_at: string;
  revoked_at?: string;
}

export interface AuditEventItem {
  id: string;
  event_type: string;
  resource_type?: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}
