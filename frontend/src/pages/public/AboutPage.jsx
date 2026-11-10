import React from 'react';
import { Award, Cpu, Lock, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About HealthMate AI
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          An AI-powered healthcare ecosystem designed for patient convenience, clinical decision support, and administrative oversight.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Temporary Privacy</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Patient health sessions are temporary by default. Data is purged automatically after your session ends or immediately upon using the Forget Me button.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">AI-Assisted Guidance</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Intelligent symptom triage, lab report OCR parsing, and dual-provider language models provide grounded health information.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Verified Practitioners</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Doctors on the platform are verified against National Medical Commission (NMC) registration records before accepting appointments.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-aurora-navy/40 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Core Commitments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
            <span>Only verified doctors and hospital directories.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
            <span>No fabricated clinical diagnoses or mock ratings.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
            <span>Digital Personal Data Protection (DPDP) Act 2023 compliance.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
            <span>Instant session data deletion anytime.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
