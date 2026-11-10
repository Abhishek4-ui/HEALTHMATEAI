import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, Lock, ExternalLink } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-aurora-midnight text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aurora-teal to-aurora-blue p-0.5">
                <div className="w-full h-full bg-aurora-midnight rounded-[10px] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-aurora-teal" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                HealthMate<span className="text-aurora-teal">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade AI-powered healthcare ecosystem integrating Machine Learning, Deep Learning, Medical RAG, Computer Vision, and Explainable AI across exactly three authorized roles.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-aurora-teal">
              <ShieldCheck className="w-4 h-4" />
              <span>Digital Personal Data Protection (DPDP) Act 2023 Compliant</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-aurora-navy/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-700 dark:text-slate-300">Clinical Advisory:</strong> HealthMate AI provides preliminary triage and AI assistance. It does not replace certified in-person medical diagnosis or prescription.
            </div>
          </div>

          {/* Three Roles Navigation */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Authorized Portals
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/patient" className="hover:text-aurora-teal transition-colors flex items-center gap-1.5">
                  <span>Patient Portal</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-aurora-teal/10 text-aurora-teal font-bold">Role 1</span>
                </Link>
              </li>
              <li>
                <Link to="/doctor" className="hover:text-aurora-teal transition-colors flex items-center gap-1.5">
                  <span>Doctor Portal</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-aurora-blue/10 text-aurora-blue font-bold">Role 2</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-aurora-teal transition-colors flex items-center gap-1.5">
                  <span>Administration Portal</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-aurora-violet/10 text-aurora-violet font-bold">Role 3</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Technology */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Architecture
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/ai-technology" className="hover:text-aurora-teal transition-colors">Hybrid AI Engine</Link></li>
              <li><Link to="/how-it-works" className="hover:text-aurora-teal transition-colors">Triage & RAG Pipeline</Link></li>
              <li><Link to="/features" className="hover:text-aurora-teal transition-colors">Feature Capabilities</Link></li>
              <li><Link to="/about" className="hover:text-aurora-teal transition-colors">Project Specifications</Link></li>
            </ul>
          </div>

          {/* Governance & Privacy */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Privacy & Legal
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacy-security" className="hover:text-aurora-teal transition-colors">Zero-Trust Architecture</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-aurora-teal transition-colors">Data Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-aurora-teal transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-aurora-teal transition-colors">Contact Engineering</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} HealthMate AI. BTech Computer Science & Engineering Major Project (AI & ML Specialization).</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-aurora-teal">
              <Lock className="w-3 h-3" />
              Ephemeral Patient Data By Default
            </span>
            <span>•</span>
            <span>India-wide & Nearby Discovery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
