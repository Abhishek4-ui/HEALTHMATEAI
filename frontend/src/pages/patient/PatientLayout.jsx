import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardTopNav from '../../components/layout/DashboardTopNav';
import { 
  Activity, 
  Bot, 
  FileText, 
  MapPin, 
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
  Clock 
} from 'lucide-react';

export const PATIENT_MODULES = [
  { id: 'dashboard', name: 'Health Overview', path: '/patient', icon: Activity },
  { id: 'copilot', name: 'AI Health Assistant', path: '/patient/copilot', icon: Bot, badge: 'AI' },
  { id: 'symptoms', name: 'Symptom Checker', path: '/patient/symptoms', icon: ClipboardCheck },
  { id: 'risk', name: 'Risk Assessment', path: '/patient/risk', icon: Heart },
  { id: 'reports', name: 'Report OCR Analyzer', path: '/patient/reports', icon: FileText, badge: 'OCR' },
  { id: 'doctors', name: 'Doctor Discovery', path: '/patient/doctors', icon: Stethoscope },
  { id: 'hospitals', name: 'Hospital Discovery', path: '/patient/hospitals', icon: Building2 },
  { id: 'appointments', name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
  { id: 'consultation', name: 'Teleconsultation Room', path: '/patient/consultation', icon: Video },
  { id: 'prescriptions', name: 'Digital Prescriptions', path: '/patient/prescriptions', icon: Pill },
  { id: 'medicines', name: 'Medicine Reminders', path: '/patient/medicines', icon: Clock },
  { id: 'vitals', name: 'Health Monitoring', path: '/patient/vitals', icon: Activity },
  { id: 'nutrition', name: 'Nutrition & Fitness', path: '/patient/nutrition', icon: Flame },
  { id: 'sleep', name: 'Sleep & Mental Wellness', path: '/patient/sleep', icon: Moon },
  { id: 'labs', name: 'Lab Test Booking', path: '/patient/labs', icon: FlaskConical },
  { id: 'emergency', name: 'Emergency SOS', path: '/patient/emergency', icon: ShieldAlert, badge: '112' },
  { id: 'family', name: 'Family Healthcare', path: '/patient/family', icon: Users },
  { id: 'notifications', name: 'Notification Center', path: '/patient/notifications', icon: Bell },
  { id: 'settings', name: 'Privacy & Settings', path: '/patient/settings', icon: Settings },
];

export default function PatientLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Find active module title
  const activeModule = PATIENT_MODULES.find(m => m.path === location.pathname) || { name: 'Patient Portal' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-aurora-midnight text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <DashboardSidebar
        role="PATIENT"
        modules={PATIENT_MODULES}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <DashboardTopNav
          role="PATIENT"
          title={activeModule.name}
          setMobileOpen={setMobileOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
