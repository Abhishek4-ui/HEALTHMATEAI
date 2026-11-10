import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Shield, 
  Stethoscope, 
  User, 
  Menu, 
  X, 
  Trash2, 
  Lock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import ForgetMeModal from '../common/ForgetMeModal';

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [forgetModalOpen, setForgetModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'AI Technology', path: '/ai-technology' },
    { name: 'Privacy & Security', path: '/privacy-security' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-aurora-midnight/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-aurora-teal via-aurora-blue to-aurora-violet p-0.5 shadow-glow-teal group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-aurora-midnight rounded-[14px] flex items-center justify-center">
                <Activity className="w-6 h-6 text-aurora-teal animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                  HealthMate<span className="text-transparent bg-clip-text bg-gradient-to-r from-aurora-teal to-aurora-cyan">AI</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/30">
                  AURORA
                </span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-400">
                Healthcare, Reimagined.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-semibold tracking-wide transition-colors ${
                  location.pathname === link.path
                    ? 'text-aurora-teal font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-aurora-teal dark:hover:text-aurora-cyan'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action Tools */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => setForgetModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Instant zero-trace ephemeral session purge (DPDP Act 2023)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Forget Me</span>
            </button>

            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-aurora-teal text-aurora-midnight hover:bg-aurora-cyan shadow-glow-teal transition-all flex items-center gap-1.5"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-aurora-midnight/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                    location.pathname === link.path
                      ? 'bg-aurora-teal/10 text-aurora-teal'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setForgetModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Forget Me (Purge Ephemeral Session)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-center text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-center text-xs font-bold rounded-xl bg-aurora-teal text-aurora-midnight"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <ForgetMeModal
        isOpen={forgetModalOpen}
        onClose={() => setForgetModalOpen(false)}
      />
    </>
  );
}
