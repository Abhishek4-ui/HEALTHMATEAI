import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-aurora-midnight text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-aurora-teal to-aurora-blue p-0.5">
                <div className="w-full h-full bg-aurora-midnight rounded-[6px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-aurora-teal" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                HealthMate<span className="text-aurora-teal">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Healthcare management platform for patients, doctors, and administration.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-aurora-teal">
              <ShieldCheck className="w-4 h-4" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
          </div>

          {/* Portals */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Portals
            </h4>
            <ul className="space-y-2">
              <li><Link to="/patient" className="hover:text-aurora-teal transition-colors">Patient Portal</Link></li>
              <li><Link to="/doctor" className="hover:text-aurora-teal transition-colors">Doctor Portal</Link></li>
              <li><Link to="/admin" className="hover:text-aurora-teal transition-colors">Administration Portal</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-aurora-teal transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-aurora-teal transition-colors">How It Works</Link></li>
              <li><Link to="/ai-technology" className="hover:text-aurora-teal transition-colors">AI Technology</Link></li>
              <li><Link to="/about" className="hover:text-aurora-teal transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-aurora-teal transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal & Medical Warning */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-1">
              Privacy & Terms
            </h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-security" className="hover:text-aurora-teal transition-colors">Privacy & Security</Link></li>
              <li><Link to="/privacy" className="hover:text-aurora-teal transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-aurora-teal transition-colors">Terms of Service</Link></li>
            </ul>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-aurora-navy/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-normal">
              <strong>Emergency Notice:</strong> In medical emergencies, call 112 immediately. This platform is not a replacement for emergency care.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div>&copy; {new Date().getFullYear()} HealthMate AI. All rights reserved.</div>
          <div>BTech CSE Major Project (AI & ML)</div>
        </div>
      </div>
    </footer>
  );
}
