export const te = {
  appName: "స్వాస్థ్య కోపైలట్ (Swasthya Copilot)",
  tagline: "మీ ఆరోగ్య రికార్డులు. స్పష్టంగా మరియు సురక్షితంగా అనుసంధానించబడ్డాయి.",
  disclaimer: "ఈ AI వివరణ కేవలం సమాచార ప్రయోజనాల కొరకు మాత్రమే. ఇది వైద్య నిర్ధారణ కాదు మరియు లైసెన్స్ పొందిన వైద్యుని సలహాకు ప్రత్యామ్నాయం కాదు.",

  nav: {
    dashboard: "డ్యాష్‌బోర్డ్ (Dashboard)",
    documents: "పత్రాల ఆర్కైవ్ (Documents)",
    upload: "రికార్డు అప్‌లోడ్ (Upload)",
    review: "వివరాల సమీక్ష (Review)",
    timeline: "ఆరోగ్య టైమ్‌లైన్ (Timeline)",
    trends: "ల్యాబ్ ట్రెండ్స్ (Lab Trends)",
    summary: "AI ఆరోగ్య సారాంశం (Summary)",
    profile: "ఆరోగ్య ప్రొఫైల్ (Profile)",
    fhir: "ABDM & FHIR R4",
    consent: "గోప్యత & సమ్మతి (Consent)",
    architecture: "వ్యవస్థ నిర్మాణం (Architecture)",
    logout: "లాగ్ అవుట్ (Log Out)",
    login: "లాగిన్ (Log In)",
    register: "నమోదు (Register)"
  },

  actions: {
    uploadDoc: "పత్రం అప్‌లోడ్ చేయండి",
    loadDemo: "డెమో డేటాను లోడ్ చేయండి",
    resetDemo: "డెమో డేటాను రీసెట్ చేయండి",
    viewSource: "ఆధారం చూడండి (View Source)",
    confirmAndSave: "సరిచూసి సేవ్ చేయండి",
    saveChanges: "మార్పులను భద్రపరచండి",
    exportJson: "JSON రికార్డులను డౌన్‌లోడ్ చేయండి",
    exportFhir: "FHIR బండిల్‌ను డౌన్‌లోడ్ చేయండి",
    downloadOriginal: "అసలు పత్రాన్ని డౌన్‌లోడ్ చేయండి",
    inspect: "ఆధారాన్ని తనిఖీ చేయండి",
    filterAll: "అన్ని రకాలు",
    retry: "మళ్లీ ప్రయత్నించండి",
    delete: "రికార్డును తొలగించండి"
  },

  dashboard: {
    title: "ఆరోగ్య సమాచార విశ్లేషణ",
    subtitle: "నిజ-సమయ వైద్య రికార్డులు మరియు సాక్ష్యాల ఆధారిత AI సారాంశం",
    totalDocs: "మొత్తం పత్రాలు",
    pendingReview: "సమీక్ష అవసరమైనవి",
    completedDocs: "ధృవీకరించబడిన పత్రాలు",
    abnormalValues: "పరిధి వెలుపల ఉన్న పరీక్షలు",
    activeMedications: "ప్రస్తుత మందులు",
    quickActions: "త్వరిత చర్యలు",
    recentActivity: "ఇటీవలి ఆరోగ్య సంఘటనలు",
    evidenceInsights: "సాక్ష్యాలతో కూడిన ఆరోగ్య విశ్లేషణలు",
    noInsights: "ఇంకా ఆరోగ్య విశ్లేషణలు రూపొందించబడలేదు. పత్రాన్ని అప్‌లోడ్ చేయండి లేదా డెమో డేటాను లోడ్ చేయండి.",
    emptyDocs: "వైద్య పత్రాలు లేవు. మీ మొదటి ల్యాబ్ రిపోర్ట్ లేదా ప్రిస్క్రిప్షన్‌ను అప్‌లోడ్ చేయడం ద్వారా ప్రారంభించండి."
  },

  status: {
    uploaded: "అప్‌లోడ్ చేయబడింది",
    processing: "OCR ప్రాసెసింగ్ జరుగుతోంది",
    review_required: "సమీక్ష అవసరం",
    completed: "ధృవీకరించి సేవ్ చేయబడింది",
    failed: "ప్రాసెసింగ్ విఫలమైంది",
    high: "అధిక ఖచ్చితత్వం (High)",
    medium: "మధ్యస్థ ఖచ్చితత్వం (Medium)",
    low: "మానవ సమీక్ష అవసరం (Low)",
    normal: "సాధారణం (NORMAL)",
    abnormal: "పరిధి బయట (ABNORMAL)"
  },

  docTypes: {
    prescription: "ప్రిస్క్రిప్షన్ (Prescription)",
    lab_report: "ల్యాబ్ నివేదిక (Lab Report)",
    discharge_summary: "డిశ్చార్జ్ సమ్మరీ (Discharge Summary)",
    diagnostic_report: "డయాగ్నస్టిక్ ఇమేజింగ్ / ECG",
    unknown: "వైద్య పత్రం"
  },

  review: {
    title: "ఎక్స్‌ట్రాక్ట్ చేసిన వివరాల ప్రత్యక్ష సమీక్ష",
    subtitle: "ధృవీకరించే ముందు అసలు పత్రంతో పోల్చి చూసి అవసరమైతే విలువలను సరిచేయండి.",
    originalDocPreview: "అసలు పత్రం ప్రివ్యూ",
    extractedFields: "ఎక్స్‌ట్రాక్ట్ చేయబడిన వివరాలు",
    fieldConfidence: "ఖచ్చితత్వ స్థాయి",
    sourceSnippet: "మూల పత్రంలోని వాక్యం",
    valueAsWritten: "పత్రంలోని విలువ",
    correctedValue: "సవరించిన విలువ",
    confirmNotice: "ధృవీకరించిన తర్వాత ఈ వివరాలు మీ ఆరోగ్య టైమ్‌లైన్‌లో శాశ్వతంగా భద్రపరచబడతాయి."
  },

  summary: {
    title: "AI సులభ భాషా సారాంశం",
    whatDocSays: "ఈ పత్రం ఏమి చెబుతోంది?",
    keyFindings: "ముఖ్యమైన వైద్య ఫలితాలు",
    abnormalResults: "ల్యాబ్ రిఫరెన్స్ పరిధి వెలుపల ఉన్న ఫలితాలు",
    historicalTrend: "గత నివేదికలతో చారిత్రక పోలిక",
    doctorQuestions: "వైద్యుడితో చర్చించవలసిన ప్రశ్నలు",
    documentedInstructions: "పత్రంలో పేర్కొన్న ముఖ్యమైన సూచనలు",
    sourceEvidence: "ధృవీకరించబడిన మూల ఆధారాలు"
  },

  trends: {
    title: "ల్యాబ్ ట్రెండ్స్ & విశ్లేషణ",
    selectTest: "పరీక్షను ఎంచుకోండి",
    referenceRange: "ల్యాబ్ సూచించిన సాధారణ పరిధి",
    measuredDate: "పరీక్ష తేదీ",
    measuredValue: "కొలిచిన విలువ",
    trendNote: "ల్యాబ్ నివేదికలలోని వాస్తవ తేదీలు మరియు విలువల ఆధారంగా మాత్రమే చార్ట్ ప్రదర్శించబడుతుంది."
  },

  fhir: {
    title: "ABDM & FHIR R4 ఇంటర్‌ఆపరేబిలిటీ",
    subtitle: "ఆయుష్మాన్ భారత్ డిజిటల్ మిషన్ (ABDM) ప్రమాణాలకు అనుగుణమైన ఆరోగ్య డేటా మార్పిడి",
    mockAbha: "అనుసంధానించబడిన మాక్ ABHA నంబర్",
    bundleExport: "పూర్తి FHIR R4 కలెక్షన్ బండిల్‌ను డౌన్‌లోడ్ చేయండి",
    resourceMapping: "అంతర్గత వివరాలు మరియు FHIR రీసోర్స్ మ్యాపింగ్"
  }
};
