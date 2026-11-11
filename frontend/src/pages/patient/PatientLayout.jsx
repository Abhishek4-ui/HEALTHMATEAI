import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardTopNav from '../../components/layout/DashboardTopNav';
import { 
  Activity, 
  Bot, 
  FileText, 
  Calendar, 
  Video, 
  Pill, 
  Bell, 
  Heart, 
  Flame, 
  Moon, 
  FlaskConical, 
  ShieldAlert, 
  Users, 
  Settings, 
  ClipboardCheck, 
  Stethoscope, 
  Building2, 
  Clock,
  Scan,
  HeartPulse
} from 'lucide-react';

export const PATIENT_MODULES = [
  { id: 'dashboard', name: 'Overview', path: '/patient/dashboard', icon: Activity },
  { id: 'ai-assistant', name: 'AI Assistant', path: '/patient/ai-assistant', icon: Bot },
  { id: 'symptom-checker', name: 'Symptom Checker', path: '/patient/symptom-checker', icon: ClipboardCheck },
  { id: 'risk-assessment', name: 'Risk Assessment', path: '/patient/risk-assessment', icon: Heart },
  { id: 'reports', name: 'Report Analyzer', path: '/patient/reports', icon: FileText },
  { id: 'medical-imaging', name: 'Medical Imaging AI', path: '/patient/medical-imaging', icon: Scan },
  { id: 'cardiac-ecg', name: 'ECG & Cardiac AI', path: '/patient/cardiac-ecg', icon: HeartPulse },
  { id: 'doctors', name: 'Find Doctors', path: '/patient/doctors', icon: Stethoscope },
  { id: 'hospitals', name: 'Find Hospitals', path: '/patient/hospitals', icon: Building2 },
  { id: 'appointments', name: 'Appointments', path: '/patient/appointments', icon: Calendar },
  { id: 'consultations', name: 'Consultations', path: '/patient/consultations', icon: Video },
  { id: 'prescriptions', name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
  { id: 'medicines', name: 'Medicines & Reminders', path: '/patient/medicines', icon: Clock },
  { id: 'health-metrics', name: 'Health Monitoring', path: '/patient/health-metrics', icon: Activity },
  { id: 'nutrition', name: 'Nutrition & Fitness', path: '/patient/nutrition', icon: Flame },
  { id: 'wellness', name: 'Sleep & Mental Wellness', path: '/patient/wellness', icon: Moon },
  { id: 'lab-tests', name: 'Lab Tests', path: '/patient/lab-tests', icon: FlaskConical },
  { id: 'emergency', name: 'Emergency SOS', path: '/patient/emergency', icon: ShieldAlert, badge: '112' },
  { id: 'family', name: 'Family Health', path: '/patient/family', icon: Users },
  { id: 'notifications', name: 'Notifications', path: '/patient/notifications', icon: Bell },
  { id: 'privacy', name: 'Privacy & Settings', path: '/patient/privacy', icon: Settings },
];

export default function PatientLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const activeModule = PATIENT_MODULES.find(m => m.path === location.pathname) || { name: 'Patient' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-aurora-midnight text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      <DashboardSidebar
        role="PATIENT"
        modules={PATIENT_MODULES}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <DashboardTopNav
          role="PATIENT"
          title={activeModule.name}
          setMobileOpen={setMobileOpen}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
