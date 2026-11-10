import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Trash2, 
  User, 
  LogOut, 
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
        title: 'Search',
        message: `Searching for "${searchQuery}"...`,
      });
    }
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: 'success',
      title: 'Logged Out',
      message: 'You have signed out.',
    });
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-aurora-midnight/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors duration-200">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-aurora-navy"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-aurora-navy/60 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-aurora-teal"
            />
          </div>
        </form>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2.5">
          {role === 'PATIENT' && (
            <button
              onClick={() => setForgetModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 transition-colors"
              title="Delete temporary data"
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
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-aurora-navy transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-aurora-teal to-aurora-blue text-aurora-midnight font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0) : role.charAt(0)}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user?.name || (role === 'DOCTOR' ? 'Doctor' : role === 'ADMINISTRATION' ? 'Admin' : 'Patient')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-aurora-navy rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.name || role}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || role}</p>
                </div>

                <div className="py-1">
                  <Link
                    to={`/${role.toLowerCase()}/settings`}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-aurora-midnight"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </Link>
                  {role === 'PATIENT' && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setForgetModalOpen(true);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Session</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50"
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
