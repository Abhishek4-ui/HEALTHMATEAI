import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Public Layout & Pages
import PublicLayout from './pages/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import FeaturesPage from './pages/public/FeaturesPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import AITechnologyPage from './pages/public/AITechnologyPage';
import PrivacySecurityPage from './pages/public/PrivacySecurityPage';
import ContactPage from './pages/public/ContactPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Auth Pages
import LoginPage from './pages/public/auth/LoginPage';
import RegisterPage from './pages/public/auth/RegisterPage';
import ForgotPasswordPage from './pages/public/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/auth/ResetPasswordPage';
import MobileOTPPage from './pages/public/auth/MobileOTPPage';
import EmailVerificationPage from './pages/public/auth/EmailVerificationPage';
import SessionExpiredPage from './pages/public/auth/SessionExpiredPage';
import LogoutConfirmPage from './pages/public/auth/LogoutConfirmPage';

// Patient Portal Layout & Modules
import PatientLayout from './pages/patient/PatientLayout';
import Module01_Dashboard from './pages/patient/modules/Module01_Dashboard';
import Module02_AIAssistant from './pages/patient/modules/Module02_AIAssistant';
import Module03_SymptomChecker from './pages/patient/modules/Module03_SymptomChecker';
import Module04_HealthRiskAssessment from './pages/patient/modules/Module04_HealthRiskAssessment';
import Module05_ReportAnalyzer from './pages/patient/modules/Module05_ReportAnalyzer';
import Module06_DoctorDiscovery from './pages/patient/modules/Module06_DoctorDiscovery';
import Module07_HospitalDiscovery from './pages/patient/modules/Module07_HospitalDiscovery';
import Module08_AppointmentManagement from './pages/patient/modules/Module08_AppointmentManagement';
import Module09_OnlineConsultation from './pages/patient/modules/Module09_OnlineConsultation';
import Module10_Prescriptions from './pages/patient/modules/Module10_Prescriptions';
import Module11_MedicinesReminders from './pages/patient/modules/Module11_MedicinesReminders';
import Module12_HealthMonitoring from './pages/patient/modules/Module12_HealthMonitoring';
import Module13_NutritionFitness from './pages/patient/modules/Module13_NutritionFitness';
import Module14_SleepMentalWellness from './pages/patient/modules/Module14_SleepMentalWellness';
import Module15_LabTests from './pages/patient/modules/Module15_LabTests';
import Module16_EmergencySOS from './pages/patient/modules/Module16_EmergencySOS';
import Module17_FamilyHealthcare from './pages/patient/modules/Module17_FamilyHealthcare';
import Module18_Notifications from './pages/patient/modules/Module18_Notifications';
import Module19_PrivacySettings from './pages/patient/modules/Module19_PrivacySettings';

// Doctor Portal Layout & Modules
import DoctorLayout from './pages/doctor/DoctorLayout';
import DocModule01_Dashboard from './pages/doctor/modules/DocModule01_Dashboard';
import DocModule02_Profile from './pages/doctor/modules/DocModule02_Profile';
import DocModule03_VerificationStatus from './pages/doctor/modules/DocModule03_VerificationStatus';
import DocModule04_AppointmentManagement from './pages/doctor/modules/DocModule04_AppointmentManagement';
import DocModule05_AvailabilityManagement from './pages/doctor/modules/DocModule05_AvailabilityManagement';
import DocModule06_PatientConsultation from './pages/doctor/modules/DocModule06_PatientConsultation';
import DocModule07_VideoConsultation from './pages/doctor/modules/DocModule07_VideoConsultation';
import DocModule08_ConsentedReports from './pages/doctor/modules/DocModule08_ConsentedReports';
import DocModule09_PrescriptionManagement from './pages/doctor/modules/DocModule09_PrescriptionManagement';
import DocModule10_ConsultationHistory from './pages/doctor/modules/DocModule10_ConsultationHistory';
import DocModule11_Notifications from './pages/doctor/modules/DocModule11_Notifications';
import DocModule12_EarningsPayments from './pages/doctor/modules/DocModule12_EarningsPayments';
import DocModule13_Settings from './pages/doctor/modules/DocModule13_Settings';

// Administration Portal Layout & Modules
import AdminLayout from './pages/admin/AdminLayout';
import AdminModule01_Dashboard from './pages/admin/modules/AdminModule01_Dashboard';
import AdminModule02_DoctorManagement from './pages/admin/modules/AdminModule02_DoctorManagement';
import AdminModule03_DoctorVerification from './pages/admin/modules/AdminModule03_DoctorVerification';
import AdminModule04_HospitalDirectory from './pages/admin/modules/AdminModule04_HospitalDirectory';
import AdminModule05_PatientAccounts from './pages/admin/modules/AdminModule05_PatientAccounts';
import AdminModule06_AppointmentMonitoring from './pages/admin/modules/AdminModule06_AppointmentMonitoring';
import AdminModule07_ContentManagement from './pages/admin/modules/AdminModule07_ContentManagement';
import AdminModule08_AIModelMonitoring from './pages/admin/modules/AdminModule08_AIModelMonitoring';
import AdminModule09_DatasetManagement from './pages/admin/modules/AdminModule09_DatasetManagement';
import AdminModule10_APIIntegrationStatus from './pages/admin/modules/AdminModule10_APIIntegrationStatus';
import AdminModule11_SecurityMonitoring from './pages/admin/modules/AdminModule11_SecurityMonitoring';
import AdminModule12_AuditLogs from './pages/admin/modules/AdminModule12_AuditLogs';
import AdminModule13_ReportsAnalytics from './pages/admin/modules/AdminModule13_ReportsAnalytics';
import AdminModule14_SystemSettings from './pages/admin/modules/AdminModule14_SystemSettings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-aurora-midnight text-slate-800 dark:text-slate-100 transition-colors duration-200">
            <Routes>
              {/* Public Marketing Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/ai-technology" element={<AITechnologyPage />} />
                <Route path="/privacy-security" element={<PrivacySecurityPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                
                {/* Authentication Routes inside Public Layout */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-otp" element={<MobileOTPPage />} />
                <Route path="/verify-email" element={<EmailVerificationPage />} />
                <Route path="/session-expired" element={<SessionExpiredPage />} />
                <Route path="/logout-confirm" element={<LogoutConfirmPage />} />
              </Route>

              {/* Patient Portal Routes */}
              <Route path="/patient" element={<PatientLayout />}>
                <Route index element={<Navigate to="/patient/dashboard" replace />} />
                <Route path="dashboard" element={<Module01_Dashboard />} />
                <Route path="ai-assistant" element={<Module02_AIAssistant />} />
                <Route path="symptom-checker" element={<Module03_SymptomChecker />} />
                <Route path="risk-assessment" element={<Module04_HealthRiskAssessment />} />
                <Route path="reports" element={<Module05_ReportAnalyzer />} />
                <Route path="doctors" element={<Module06_DoctorDiscovery />} />
                <Route path="hospitals" element={<Module07_HospitalDiscovery />} />
                <Route path="appointments" element={<Module08_AppointmentManagement />} />
                <Route path="consultations" element={<Module09_OnlineConsultation />} />
                <Route path="prescriptions" element={<Module10_Prescriptions />} />
                <Route path="medicines" element={<Module11_MedicinesReminders />} />
                <Route path="health-metrics" element={<Module12_HealthMonitoring />} />
                <Route path="nutrition" element={<Module13_NutritionFitness />} />
                <Route path="wellness" element={<Module14_SleepMentalWellness />} />
                <Route path="lab-tests" element={<Module15_LabTests />} />
                <Route path="emergency" element={<Module16_EmergencySOS />} />
                <Route path="family" element={<Module17_FamilyHealthcare />} />
                <Route path="notifications" element={<Module18_Notifications />} />
                <Route path="privacy" element={<Module19_PrivacySettings />} />
              </Route>

              {/* Doctor Portal Routes */}
              <Route path="/doctor" element={<DoctorLayout />}>
                <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                <Route path="dashboard" element={<DocModule01_Dashboard />} />
                <Route path="profile" element={<DocModule02_Profile />} />
                <Route path="verification" element={<DocModule03_VerificationStatus />} />
                <Route path="appointments" element={<DocModule04_AppointmentManagement />} />
                <Route path="availability" element={<DocModule05_AvailabilityManagement />} />
                <Route path="consultation" element={<DocModule06_PatientConsultation />} />
                <Route path="video" element={<DocModule07_VideoConsultation />} />
                <Route path="patient-reports" element={<DocModule08_ConsentedReports />} />
                <Route path="prescriptions" element={<DocModule09_PrescriptionManagement />} />
                <Route path="history" element={<DocModule10_ConsultationHistory />} />
                <Route path="notifications" element={<DocModule11_Notifications />} />
                <Route path="earnings" element={<DocModule12_EarningsPayments />} />
                <Route path="settings" element={<DocModule13_Settings />} />
              </Route>

              {/* Administration Portal Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminModule01_Dashboard />} />
                <Route path="doctors" element={<AdminModule02_DoctorManagement />} />
                <Route path="doctor-verification" element={<AdminModule03_DoctorVerification />} />
                <Route path="hospitals" element={<AdminModule04_HospitalDirectory />} />
                <Route path="patients" element={<AdminModule05_PatientAccounts />} />
                <Route path="appointments" element={<AdminModule06_AppointmentMonitoring />} />
                <Route path="content" element={<AdminModule07_ContentManagement />} />
                <Route path="ai-models" element={<AdminModule08_AIModelMonitoring />} />
                <Route path="datasets" element={<AdminModule09_DatasetManagement />} />
                <Route path="integrations" element={<AdminModule10_APIIntegrationStatus />} />
                <Route path="security" element={<AdminModule11_SecurityMonitoring />} />
                <Route path="audit-logs" element={<AdminModule12_AuditLogs />} />
                <Route path="reports" element={<AdminModule13_ReportsAnalytics />} />
                <Route path="settings" element={<AdminModule14_SystemSettings />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
