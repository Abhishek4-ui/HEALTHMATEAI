import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ShieldCheck
} from 'lucide-react';

export default function DashboardSidebar({
  role = 'PATIENT',
  modules = [],
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) {
  const roleColors = {
    PATIENT: {
      accent: 'text-aurora-teal',
      badge: 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30',
      activeNav: 'bg-aurora-teal text-aurora-midnight font-bold shadow-sm',
      inactiveNav: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-aurora-navy',
    },
    DOCTOR: {
      accent: 'text-aurora-blue',
      badge: 'bg-aurora-blue/10 text-aurora-blue border-aurora-blue/30',
      activeNav: 'bg-aurora-blue text-white font-bold shadow-sm',
      inactiveNav: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-aurora-navy',
    },
    ADMINISTRATION: {
      accent: 'text-aurora-violet',
      badge: 'bg-aurora-violet/10 text-aurora-violet border-aurora-violet/30',
      activeNav: 'bg-aurora-violet text-white font-bold shadow-sm',
      inactiveNav: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-aurora-navy',
    },
  };

  const currentTheme = roleColors[role] || roleColors.PATIENT;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-aurora-midnight border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-aurora-teal to-aurora-blue p-0.5 shrink-0">
              <div className="w-full h-full bg-aurora-midnight rounded-[6px] flex items-center justify-center">
                <Activity className="w-4 h-4 text-aurora-teal" />
              </div>
            </div>
            {!collapsed && (
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white truncate">
                HealthMate<span className="text-aurora-teal">AI</span>
              </span>
            )}
          </NavLink>

          {/* Desktop Collapse / Mobile Close */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Modules Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <NavLink
                key={mod.id}
                to={mod.path}
                end={mod.path.endsWith(role.toLowerCase())}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive ? currentTheme.activeNav : currentTheme.inactiveNav
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? mod.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate">{mod.name}</span>
                )}
                {!collapsed && mod.badge && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-500 font-bold">
                    {mod.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-aurora-teal" />
              <span>DPDP Compliant</span>
            </span>
          </div>
        )}
      </aside>
    </>
  );
}
