import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, Stethoscope, Building2, PhoneCall, ArrowRight, User } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Clean, professional healthcare navigation links (NO 'Features', 'How It Works', 'AI Technology')
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Doctors', path: '/login?role=PATIENT' },
    { name: 'Hospitals', path: '/login?role=PATIENT' },
    { name: 'Emergency Care', path: '/emergency' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:bg-teal-500 transition">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              HealthMate<span className="text-teal-600 dark:text-teal-400">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-1">
              Healthcare Network
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-xs font-semibold tracking-wide transition-colors ${
                location.pathname === link.path
                  ? 'text-teal-600 dark:text-teal-400 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons: Sign In and Register (NO 'Forget Me', NO 'Get Started') */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm shadow-teal-600/30 flex items-center gap-1.5 transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </Link>
        </div>

        {/* Mobile & Tablet Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-600"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 py-2.5 text-center text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="flex-1 py-2.5 text-center text-xs font-semibold bg-teal-600 text-white rounded-xl"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
