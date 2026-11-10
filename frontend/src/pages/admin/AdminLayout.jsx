import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardTopNav from '../../components/layout/DashboardTopNav';
import { 
  ShieldAlert, 
  UserCheck, 
  Award, 
  Building2, 
  Users, 
  Calendar, 
  FileText, 
  Cpu, 
  Database, 
  Radio, 
  History, 
  BarChart2, 
  Settings, 
  Activity 
} from 'lucide-react';

export const ADMIN_MODULES = [
  { id: 'dashboard', name: 'Overview', path: '/admin/dashboard', icon: Activity },
  { id: 'doctors', name: 'Doctor Management', path: '/admin/doctors', icon: UserCheck },
  { id: 'doctor-verification', name: 'Doctor Verification', path: '/admin/doctor-verification', icon: Award },
  { id: 'hospitals', name: 'Hospital Directory', path: '/admin/hospitals', icon: Building2 },
  { id: 'patients', name: 'Patient Accounts', path: '/admin/patients', icon: Users },
  { id: 'appointments', name: 'Appointments', path: '/admin/appointments', icon: Calendar },
  { id: 'content', name: 'Content Management', path: '/admin/content', icon: FileText },
  { id: 'ai-models', name: 'AI Models', path: '/admin/ai-models', icon: Cpu },
  { id: 'datasets', name: 'Datasets', path: '/admin/datasets', icon: Database },
  { id: 'integrations', name: 'API Integrations', path: '/admin/integrations', icon: Radio },
  { id: 'security', name: 'Security Monitoring', path: '/admin/security', icon: ShieldAlert },
  { id: 'audit-logs', name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
  { id: 'reports', name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart2 },
  { id: 'settings', name: 'System Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const activeModule = ADMIN_MODULES.find(m => m.path === location.pathname) || { name: 'Administration' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-aurora-midnight text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      <DashboardSidebar
        role="ADMINISTRATION"
        modules={ADMIN_MODULES}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <DashboardTopNav
          role="ADMINISTRATION"
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
