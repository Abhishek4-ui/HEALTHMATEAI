import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardTopNav from '../../components/layout/DashboardTopNav';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  Pill, 
  History, 
  Bell, 
  Wallet, 
  Settings, 
  UserCheck, 
  Activity, 
  Award 
} from 'lucide-react';

export const DOCTOR_MODULES = [
  { id: 'dashboard', name: 'Overview', path: '/doctor/dashboard', icon: Activity },
  { id: 'profile', name: 'Profile', path: '/doctor/profile', icon: UserCheck },
  { id: 'verification', name: 'NMC Verification', path: '/doctor/verification', icon: Award },
  { id: 'appointments', name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
  { id: 'availability', name: 'Availability', path: '/doctor/availability', icon: Clock },
  { id: 'consultation', name: 'Clinical Notes', path: '/doctor/consultation', icon: Stethoscope },
  { id: 'video', name: 'Video Consultation', path: '/doctor/video', icon: Video },
  { id: 'patient-reports', name: 'Patient Reports', path: '/doctor/patient-reports', icon: FileText },
  { id: 'prescriptions', name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
  { id: 'history', name: 'Consultation History', path: '/doctor/history', icon: History },
  { id: 'notifications', name: 'Notifications', path: '/doctor/notifications', icon: Bell },
  { id: 'earnings', name: 'Earnings & Payments', path: '/doctor/earnings', icon: Wallet },
  { id: 'settings', name: 'Settings', path: '/doctor/settings', icon: Settings },
];

export default function DoctorLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const activeModule = DOCTOR_MODULES.find(m => m.path === location.pathname) || { name: 'Doctor' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-aurora-midnight text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      <DashboardSidebar
        role="DOCTOR"
        modules={DOCTOR_MODULES}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <DashboardTopNav
          role="DOCTOR"
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
