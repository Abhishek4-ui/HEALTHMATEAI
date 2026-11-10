import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, Trash2, ArrowRight } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aurora-teal via-aurora-blue to-aurora-violet p-0.5">
              <div className="w-full h-full bg-aurora-midnight rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-aurora-teal" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                HealthMate<span className="text-aurora-teal">AI</span>
              </span>
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
                    : 'text-slate-600 dark:text-slate-300 hover:text-aurora-teal'
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
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 transition-colors"
              title="Delete session data"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Forget Me</span>
            </button>

            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-aurora-teal text-aurora-midnight hover:bg-aurora-cyan transition-colors flex items-center gap-1"
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
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-aurora-midnight px-4 pt-3 pb-5 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold bg-aurora-teal text-aurora-midnight rounded-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <ForgetMeModal isOpen={forgetModalOpen} onClose={() => setForgetModalOpen(false)} />
    </>
  );
}
