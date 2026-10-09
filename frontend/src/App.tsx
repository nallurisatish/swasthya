import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentUploadPage } from './pages/DocumentUploadPage';
import { DocumentLibraryPage } from './pages/DocumentLibraryPage';
import { DocumentReviewPage } from './pages/DocumentReviewPage';
import { HealthSummaryPage } from './pages/HealthSummaryPage';
import { HealthTimelinePage } from './pages/HealthTimelinePage';
import { LabTrendsPage } from './pages/LabTrendsPage';
import { HealthProfilePage } from './pages/HealthProfilePage';
import { FhirExportPage } from './pages/FhirExportPage';
import { PrivacyConsentPage } from './pages/PrivacyConsentPage';
import { ArchitecturePage } from './pages/ArchitecturePage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
            <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
            <Route path="/register" element={<AppLayout><RegisterPage /></AppLayout>} />

            {/* Application Pages */}
            <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/upload" element={<AppLayout><DocumentUploadPage /></AppLayout>} />
            <Route path="/documents" element={<AppLayout><DocumentLibraryPage /></AppLayout>} />
            <Route path="/documents/:id/review" element={<AppLayout><DocumentReviewPage /></AppLayout>} />
            <Route path="/summary" element={<AppLayout><HealthSummaryPage /></AppLayout>} />
            <Route path="/timeline" element={<AppLayout><HealthTimelinePage /></AppLayout>} />
            <Route path="/trends" element={<AppLayout><LabTrendsPage /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><HealthProfilePage /></AppLayout>} />
            <Route path="/preferences" element={<AppLayout><HealthProfilePage /></AppLayout>} />
            <Route path="/fhir" element={<AppLayout><FhirExportPage /></AppLayout>} />
            <Route path="/consent" element={<AppLayout><PrivacyConsentPage /></AppLayout>} />
            <Route path="/architecture" element={<AppLayout><ArchitecturePage /></AppLayout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
