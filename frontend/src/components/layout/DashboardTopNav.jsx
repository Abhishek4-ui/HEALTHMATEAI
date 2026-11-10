import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  Trash2, 
  Lock, 
  User, 
  LogOut, 
  CheckCircle2, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import ForgetMeModal from '../common/ForgetMeModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function DashboardTopNav({
  role = 'PATIENT',
  title = 'Dashboard',
  setMobileOpen,
}) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [forgetModalOpen, setForgetModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToast({
        type: 'info',
        title: 'Search Query Dispatched',
        message: `Searching records for "${searchQuery}"... Live backend search active in Phase 3.`,
      });
    }
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: 'success',
      title: 'Logged Out',
      message: 'Your authenticated session has ended securely.',
    });
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-20 bg-white/80 dark:bg-aurora-midnight/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4 transition-colors duration-200">
        {/* Left Section: Mobile toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-aurora-navy"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-400">
              {role} Workspace
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${role.toLowerCase()} records, modules or guidelines...`}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-aurora-navy/50 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
            />
          </div>
        </form>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3">
          {/* Ephemeral Session Indicator / Forget Me */}
          {role === 'PATIENT' && (
            <button
              onClick={() => setForgetModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Instant zero-trace ephemeral session purge"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Forget Me</span>
            </button>
          )}

          <ThemeToggle />

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-aurora-navy transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-aurora-teal to-aurora-blue text-aurora-midnight font-bold text-xs flex items-center justify-center shadow-sm">
                {user?.name ? user.name.charAt(0) : role.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.name || (role === 'DOCTOR' ? 'Dr. Practicing Physician' : role === 'ADMINISTRATION' ? 'Admin Officer' : 'Patient Session')}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-400 capitalize">
                  {user?.email || 'Authenticated Session'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-aurora-navy rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white">{user?.name || role}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Direct Role Access'}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-aurora-teal/10 text-aurora-teal">
                    Role: {role}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to={`/${role.toLowerCase()}/settings`}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-aurora-midnight"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile & Privacy Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setForgetModalOpen(true);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Temporary Session</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-aurora-midnight"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ForgetMeModal
        isOpen={forgetModalOpen}
        onClose={() => setForgetModalOpen(false)}
      />
    </>
  );
}
