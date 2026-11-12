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
import EmergencyPage from './pages/public/EmergencyPage';
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
import ProtectedRoute from './components/auth/ProtectedRoute';

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
import Module20_MedicalImagingCenter from './pages/patient/modules/Module20_MedicalImagingCenter';
import Module21_ECGCardiacCenter from './pages/patient/modules/Module21_ECGCardiacCenter';


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
                <Route path="/emergency" element={<EmergencyPage />} />
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
              <Route path="/patient" element={
                <ProtectedRoute allowedRole="PATIENT">
                  <PatientLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/patient/dashboard" replace />} />
                <Route path="dashboard" element={<Module01_Dashboard />} />
                <Route path="ai-assistant" element={<Module02_AIAssistant />} />
                <Route path="symptom-checker" element={<Module03_SymptomChecker />} />
                <Route path="risk-assessment" element={<Module04_HealthRiskAssessment />} />
                <Route path="reports" element={<Module05_ReportAnalyzer />} />
                <Route path="medical-imaging" element={<Module20_MedicalImagingCenter />} />
                <Route path="cardiac-ecg" element={<Module21_ECGCardiacCenter />} />
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

              {/* Doctor and Admin routes redirected to maintain Patient-Only Public Ecosystem */}
              <Route path="/doctor/*" element={<Navigate to="/login" replace />} />
              <Route path="/admin/*" element={<Navigate to="/login" replace />} />
              <Route path="/administration/*" element={<Navigate to="/login" replace />} />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
