import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  Shield, 
  ArrowRight, 
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react';
import Button from '../../components/ui/Button';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-10 pb-12 lg:pt-16 lg:pb-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Act 2023 Compliant • Privacy First</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Healthcare Management,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aurora-teal via-aurora-blue to-aurora-violet">
              Reimagined with AI
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Secure, intelligent healthcare support for patients, verified medical practitioners, and administrators.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login?role=PATIENT">
              <Button size="lg" variant="primary">
                <Activity className="w-4 h-4 text-aurora-midnight" />
                <span>Patient Portal</span>
                <ArrowRight className="w-4 h-4 text-aurora-midnight" />
              </Button>
            </Link>

            <Link to="/login?role=DOCTOR">
              <Button size="lg" variant="secondary" className="border border-slate-300 dark:border-slate-700">
                <Stethoscope className="w-4 h-4 text-aurora-blue" />
                <span>Doctor Portal</span>
              </Button>
            </Link>

            <Link to="/login?role=ADMINISTRATION">
              <Button size="lg" variant="outline">
                <Shield className="w-4 h-4 text-aurora-violet" />
                <span>Administration</span>
              </Button>
            </Link>
          </div>

          {/* Quick Notice */}
          <div className="mt-8 max-w-xl mx-auto p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>In medical emergencies, dial <strong>112</strong> immediately. This platform is not a substitute for emergency medicine.</span>
          </div>
        </div>
      </section>

      {/* Role Selection Cards */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient */}
          <div className="p-6 rounded-2xl bg-white dark:bg-aurora-navy/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-aurora-teal/10 text-aurora-teal flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Patient Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Check symptoms with AI, analyze medical reports, discover nearby doctors, and book appointments. Health data is temporary by default.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mb-6">
                <li>• AI Health Assistant & Symptom Checker</li>
                <li>• Lab Report Analyzer & Health Tracking</li>
                <li>• Doctor & Hospital Discovery across India</li>
                <li>• Instant session deletion with Forget Me</li>
              </ul>
            </div>
            <Link to="/login?role=PATIENT">
              <Button variant="primary" className="w-full">
                Enter Patient Portal
              </Button>
            </Link>
          </div>

          {/* Doctor */}
          <div className="p-6 rounded-2xl bg-white dark:bg-aurora-navy/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-aurora-blue/10 text-aurora-blue flex items-center justify-center mb-4">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Doctor Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Manage appointments, review patient records, conduct video consultations, and issue digital prescriptions.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mb-6">
                <li>• Appointment schedule & availability</li>
                <li>• Clinical consultation notes (SOAP)</li>
                <li>• Secure video & audio consultations</li>
                <li>• Digital prescriptions & earnings ledger</li>
              </ul>
            </div>
            <Link to="/login?role=DOCTOR">
              <Button variant="blue" className="w-full">
                Enter Doctor Portal
              </Button>
            </Link>
          </div>

          {/* Admin */}
          <div className="p-6 rounded-2xl bg-white dark:bg-aurora-navy/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-aurora-violet/10 text-aurora-violet flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Administration</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Oversee platform operations, verify doctor credentials, review hospital listings, and monitor AI model health.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mb-6">
                <li>• Doctor NMC registration verification</li>
                <li>• Hospital directory management</li>
                <li>• AI model performance monitoring</li>
                <li>• Security logs & DPDP compliance audits</li>
              </ul>
            </div>
            <Link to="/login?role=ADMINISTRATION">
              <Button variant="violet" className="w-full">
                Enter Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 text-white border border-slate-800">
          <h2 className="text-xl font-bold mb-4">Core Platform Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="font-semibold text-aurora-teal mb-1">AI Health Assistant</div>
              <div className="text-slate-400">Conversational health guidance in Hindi and English with clinical safeguards.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="font-semibold text-aurora-cyan mb-1">Report Analysis</div>
              <div className="text-slate-400">OCR report extraction with normal range checks for blood and lab biomarkers.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="font-semibold text-aurora-blue mb-1">Verified Doctors</div>
              <div className="text-slate-400">National Medical Commission (NMC) registration verification for all doctors.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="font-semibold text-aurora-violet mb-1">Temporary Privacy</div>
              <div className="text-slate-400">Session data is stored temporarily and can be wiped instantly on request.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
