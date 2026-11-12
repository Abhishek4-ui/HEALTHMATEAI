import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  X,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export default function DashboardSidebar({
  role = 'PATIENT',
  sections = [],
  modules = [],
  emergencyAction,
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) {
  const roleColors = {
    PATIENT: {
      accent: 'text-aurora-teal',
      badge: 'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/30',
      activeNav: 'bg-teal-600 text-white font-bold shadow-xs',
      inactiveNav: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60',
    },
  };

  const currentTheme = roleColors[role] || roleColors.PATIENT;

  // If sections are provided, use them; otherwise fallback to modules
  const sectionList = sections.length > 0 
    ? sections 
    : [{ title: 'NAVIGATION', items: modules }];

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
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white truncate">
                HealthMate<span className="text-teal-600 dark:text-teal-400">AI</span>
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

        {/* Modules Navigation List Grouped By Logical Section */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {sectionList.map((section, sIdx) => (
            <div key={section.title || sIdx} className="space-y-0.5">
              {!collapsed && section.title && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </div>
              )}
              {collapsed && sIdx > 0 && (
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              )}
              {section.items.map((mod) => {
                const Icon = mod.icon;
                return (
                  <NavLink
                    key={mod.id}
                    to={mod.path}
                    end={mod.path === '/patient/dashboard'}
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
                      <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/10 dark:bg-white/10 font-bold">
                        {mod.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Emergency SOS Prominent Single Action */}
        {emergencyAction && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <NavLink
              to={emergencyAction.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                  isActive 
                    ? 'bg-rose-600 text-white border-rose-600 shadow-rose-600/25' 
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? emergencyAction.name : undefined}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              {!collapsed && <span className="truncate">{emergencyAction.name}</span>}
              {!collapsed && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-mono font-bold">
                  112
                </span>
              )}
            </NavLink>
          </div>
        )}

        {/* Footer info in sidebar */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Patient Data Shield</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">v1.0</span>
          </div>
        )}
      </aside>
    </>
  );
}
