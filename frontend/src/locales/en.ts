export const en = {
  appName: "Swasthya Copilot",
  tagline: "Your Health Records. Clearly Connected.",
  disclaimer: "This AI-generated explanation is for informational purposes only. It is not a diagnosis or a substitute for advice from a qualified healthcare professional.",

  nav: {
    dashboard: "Dashboard",
    documents: "Document Archive",
    upload: "Upload Record",
    review: "Extraction Review",
    timeline: "Health Timeline",
    trends: "Lab Trends & Analytics",
    summary: "AI Health Summary",
    profile: "Unified Profile",
    fhir: "ABDM & FHIR R4",
    consent: "Privacy & Consent",
    architecture: "System Architecture",
    logout: "Log Out",
    login: "Log In",
    register: "Register"
  },

  actions: {
    uploadDoc: "Upload Document",
    loadDemo: "Load Demo Dataset",
    resetDemo: "Reset Demo Data",
    viewSource: "View Source",
    confirmAndSave: "Confirm & Save Records",
    saveChanges: "Save Changes",
    exportJson: "Export JSON Records",
    exportFhir: "Download FHIR Bundle",
    downloadOriginal: "Download Original File",
    inspect: "Inspect Evidence",
    filterAll: "All Categories",
    retry: "Retry Processing",
    delete: "Delete Record"
  },

  dashboard: {
    title: "Health Intelligence Overview",
    subtitle: "Real-time longitudinal clinical records and grounded AI insights",
    totalDocs: "Total Documents",
    pendingReview: "Review Required",
    completedDocs: "Verified Documents",
    abnormalValues: "Abnormal Observations",
    activeMedications: "Active Medications",
    quickActions: "Quick Actions",
    recentActivity: "Recent Clinical Timeline Activity",
    evidenceInsights: "Evidence-Linked Health Insights",
    noInsights: "No health insights generated yet. Upload a document or load the demo dataset.",
    emptyDocs: "No medical documents found. Get started by uploading your first lab report or prescription."
  },

  status: {
    uploaded: "Uploaded",
    processing: "Processing OCR",
    review_required: "Review Required",
    completed: "Verified & Saved",
    failed: "Processing Failed",
    high: "High Confidence",
    medium: "Medium Confidence",
    low: "Needs Human Review",
    normal: "NORMAL",
    abnormal: "ABNORMAL"
  },

  docTypes: {
    prescription: "Prescription",
    lab_report: "Laboratory Report",
    discharge_summary: "Discharge Summary",
    diagnostic_report: "Diagnostic Imaging / ECG",
    unknown: "Medical Document"
  },

  review: {
    title: "Human-in-the-Loop Extraction Review",
    subtitle: "Carefully inspect candidate medical extractions alongside the original document before confirming.",
    originalDocPreview: "Original Document Source",
    extractedFields: "Extracted Clinical Fields",
    fieldConfidence: "Confidence Level",
    sourceSnippet: "Source Text Snippet",
    valueAsWritten: "Value Extracted",
    correctedValue: "Corrected Value",
    confirmNotice: "Confirming will permanently save structured observations and update your health timeline."
  },

  summary: {
    title: "AI Plain-Language Summary",
    whatDocSays: "What This Document Says",
    keyFindings: "Key Documented Findings",
    abnormalResults: "Results Outside Laboratory Reference Range",
    historicalTrend: "Historical Comparison with Previous Records",
    doctorQuestions: "Questions to Discuss with Your Clinician",
    documentedInstructions: "Important Documented Instructions",
    sourceEvidence: "Verified Evidence Citations"
  },

  trends: {
    title: "Laboratory Trend Analytics",
    selectTest: "Select Diagnostic Test",
    referenceRange: "Laboratory Reference Interval",
    measuredDate: "Report Date",
    measuredValue: "Measured Value",
    trendNote: "Values plotted strictly against source laboratory report dates."
  },

  fhir: {
    title: "ABDM & FHIR R4 Interoperability",
    subtitle: "Standards-compliant healthcare data exchange ready for Ayushman Bharat Digital Mission",
    mockAbha: "Linked Mock ABHA Number",
    bundleExport: "Download Complete FHIR R4 Collection Bundle",
    resourceMapping: "Internal Entity to FHIR Resource Mapping"
  }
};
