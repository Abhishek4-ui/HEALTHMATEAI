import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Shield, Stethoscope, User, Lock, Trash2 } from 'lucide-react';
import ForgetMeModal from './ForgetMeModal';

export default function Navbar() {
  const location = useLocation();
  const [isForgetModalOpen, setIsForgetModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-health-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-health-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">HealthMate<span className="text-health-600">AI</span></span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-health-50 text-health-700 border border-health-200">
                Phase 1 Active
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/patient"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/patient')
                  ? 'bg-health-50 text-health-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              Patient Portal
            </Link>

            <Link
              to="/doctor"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/doctor')
                  ? 'bg-health-50 text-health-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doctor Portal
            </Link>

            <Link
              to="/admin"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/admin')
                  ? 'bg-health-50 text-health-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsForgetModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
              title="Instant zero-trace ephemeral session purge"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Forget Me</span>
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium px-2 py-1 rounded bg-slate-100 border border-slate-200">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span className="hidden sm:inline">DPDP Protected</span>
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
