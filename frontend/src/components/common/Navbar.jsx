import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, User, Lock, Trash2, Stethoscope, PhoneCall } from 'lucide-react';
import ForgetMeModal from './ForgetMeModal';

export default function Navbar() {
  const location = useLocation();
  const [isForgetModalOpen, setIsForgetModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">HealthMate<span className="text-teal-600">AI</span></span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/patient/dashboard"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/patient')
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              Patient Portal
            </Link>

            <Link
              to="/patient/doctors"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4" />
              Find Doctors
            </Link>

            <Link
              to="/emergency"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4" />
              Emergency Care
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsForgetModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
              title="Instant zero-trace session purge"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Forget Me</span>
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium px-2 py-1 rounded bg-slate-100 border border-slate-200">
              <Lock className="w-3 h-3 text-teal-600" />
              <span className="hidden sm:inline">Session Privacy</span>
            </div>
          </div>
        </div>
      </header>

      <ForgetMeModal
        isOpen={isForgetModalOpen}
        onClose={() => setIsForgetModalOpen(false)}
      />
    </>
  );
}
