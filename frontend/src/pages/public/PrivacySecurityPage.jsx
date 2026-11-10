import React from 'react';
import { 
  Lock, 
  Trash2, 
  EyeOff, 
  FileCheck2, 
  CheckCircle2
} from 'lucide-react';
import Card from '../../components/ui/Card';

export default function PrivacySecurityPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy & Data Protection
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          HealthMate AI is designed with temporary data handling under India's Digital Personal Data Protection (DPDP) Act 2023.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-1">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Temporary by Default</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All symptom evaluations, AI conversations, and uploaded test reports exist only during your active session.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Guest health sessions expire automatically.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Uploaded reports are wiped when the session closes.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>No permanent health records created without consent.</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-aurora-red flex items-center justify-center mb-1">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Instant Data Deletion ("Forget Me")</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            You can delete your active session data at any moment by clicking the "Forget Me" button in the navigation bar or settings.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Active symptoms and chat logs deleted immediately.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Local browser session storage cleared.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Compliant with DPDP Right to Erasure requirements.</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Transactional Records */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-aurora-navy/50 border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-aurora-blue" />
          Legally Retained Records
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          As required by healthcare telemedicine regulations and financial laws, only necessary transactional records are retained:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-white dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white mb-0.5">Confirmed Appointments</div>
            <div className="text-slate-500">Scheduled time, doctor details, and status for clinical accountability.</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white mb-0.5">Payment Invoices</div>
            <div className="text-slate-500">Transaction IDs and billing invoices for statutory tax records.</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <div className="font-semibold text-slate-900 dark:text-white mb-0.5">Consent Records</div>
            <div className="text-slate-500">Timestamped logs verifying when patient consent was provided or revoked.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
