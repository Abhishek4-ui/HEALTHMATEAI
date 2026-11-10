import React from 'react';
import { 
  Shield, 
  Lock, 
  Trash2, 
  EyeOff, 
  FileCheck2, 
  Server, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import Card from '../../components/ui/Card';

export default function PrivacySecurityPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-teal-950 text-aurora-teal text-xs font-bold mb-4 border border-teal-200 dark:border-teal-800">
          <Lock className="w-4 h-4" />
          Zero-Trust Ephemeral Architecture
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy, Security & DPDP Compliance
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          HealthMate AI is architected under the principle of ephemeral by default. We do not maintain permanent patient health history without explicit, affirmative, and recorded consent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-2">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Temporary by Default</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All symptom checks, conversations with the AI Health Copilot, vital inputs, and uploaded laboratory files exist exclusively in volatile memory buffers (Redis) with strict Time-To-Live (TTL) expiration rules.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Guest Triage Sessions: 60-minute automatic TTL eviction</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Uploaded Pathology Reports: 30-minute memory wipe</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Zero MongoDB writes during anonymous consultations</span>
            </li>
          </ul>
        </Card>

        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-aurora-red flex items-center justify-center mb-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Instant Session Purge ("Forget Me")</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Every user is equipped with an omnipresent "Forget Me" trigger. Activating this immediately sends a cryptographic purge command to Redis, evicting all keys associated with your active session in under 50 milliseconds.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Immediate Redis key eviction (`DEL session:*`)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>Local browser session storage wiped</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0" />
              <span>DPDP Section 12 Right to Erasure fully automated</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Transactional Exception Disclosure */}
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-aurora-navy/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-aurora-blue" />
          Legal Transactional Exception Disclosure
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          In strict compliance with Indian financial laws (Income Tax Act) and National Medical Commission (NMC) Telemedicine Practice Guidelines, the only records permanently retained in MongoDB Atlas are:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1">Confirmed Appointments</div>
            <div className="text-slate-500">Scheduled time, doctor ID, and consultation status for clinical accountability.</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1">Payment Ledgers</div>
            <div className="text-slate-500">Razorpay transaction IDs, timestamps, and statutory tax invoices.</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-white mb-1">Consent Logs</div>
            <div className="text-slate-500">Immutable timestamped records proving when patient consent was granted or revoked.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
