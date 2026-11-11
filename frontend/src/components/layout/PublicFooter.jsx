import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartHandshake, PhoneCall, Lock } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                HealthMate<span className="text-teal-600 dark:text-teal-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Integrated digital healthcare platform providing secure clinical triage, provider discovery, and health record management across India.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>DPDP Act 2023 Compliant • ISO 27001 Security</span>
            </div>
          </div>

          {/* Portals Access */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3.5">
              Healthcare Portals
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/login?role=PATIENT" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Patient Portal</Link></li>
              <li><Link to="/login?role=DOCTOR" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Doctor Portal</Link></li>
              <li><Link to="/login?role=ADMINISTRATION" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Administration Portal</Link></li>
              <li><Link to="/emergency" className="hover:text-rose-600 dark:hover:text-rose-400 font-semibold transition-colors flex items-center gap-1">Emergency SOS (112)</Link></li>
            </ul>
          </div>

          {/* Clinical Services (Replaces Features, AI Tech, How It Works) */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3.5">
              Clinical Services
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/login?role=PATIENT" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Doctor Discovery (36 States & UTs)</Link></li>
              <li><Link to="/login?role=PATIENT" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Hospital Directory</Link></li>
              <li><Link to="/login?role=PATIENT" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Diagnostic Report OCR & LOINC</Link></li>
              <li><Link to="/login?role=PATIENT" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Medical Imaging & ECG Analysis</Link></li>
              <li><Link to="/about" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">About Our Healthcare Network</Link></li>
            </ul>
          </div>

          {/* Legal, Security & Medical Warning */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-1">
              Privacy & Regulatory
            </h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-security" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy & Data Governance</Link></li>
              <li><Link to="/privacy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Terms of Medical Service</Link></li>
            </ul>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300 leading-normal">
              <strong>Emergency Direct Call:</strong> In life-threatening medical emergencies, dial <strong>112</strong> immediately. Algorithmic outputs are non-diagnostic screening assists.
            </div>
          </div>
        </div>

        {/* Professional Copyright Bar (BTech CSE Major Project removed) */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
          <div>&copy; {new Date().getFullYear()} HealthMate AI Healthcare Technologies Ltd. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-teal-600" /> End-to-End Encrypted</span>
            <span>•</span>
            <span>National Medical Commission Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
