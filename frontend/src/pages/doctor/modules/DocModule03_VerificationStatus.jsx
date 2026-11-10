import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Upload, 
  FileCheck2, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function DocModule03_VerificationStatus() {
  const [currentTier, setCurrentTier] = useState('CREDENTIAL_VERIFIED'); // DISCOVERED | SOURCE_VERIFIED | CREDENTIAL_VERIFIED | APPOINTMENT_ENABLED
  const [uploadedDocs, setUploadedDocs] = useState([
    { name: 'KMC_Registration_Certificate_2018.pdf', type: 'Medical Council Certificate', uploadedAt: '2026-11-09' },
    { name: 'MBBS_Degree_Certificate.pdf', type: 'University Degree', uploadedAt: '2026-11-09' }
  ]);
  const { addToast } = useToast();

  const tiers = [
    { id: 'DISCOVERED', name: 'Discovered', desc: 'Ingested via external registry. Not yet verified.' },
    { id: 'SOURCE_VERIFIED', name: 'Source Verified', desc: 'Matched against State Medical Council public register.' },
    { id: 'CREDENTIAL_VERIFIED', name: 'Credential Verified', desc: 'Degree certificates inspected and approved by Admin.' },
    { id: 'APPOINTMENT_ENABLED', name: 'Appointment Enabled', desc: 'Fully accredited. Public bookings and payouts live.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Medical Verification Status
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verification status of your medical licenses and certifications.
          </p>
        </div>
        <Badge variant="teal">Verified</Badge>
      </div>

      {/* Verification Pipeline Progress Bar */}
      <Card className="p-8 space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verification Tier Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {tiers.map((t, idx) => {
            const isCompleted = idx <= 2; // CREDENTIAL_VERIFIED
            const isCurrent = t.id === currentTier;

            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border text-xs space-y-1 transition-all ${
                  isCurrent
                    ? 'border-aurora-teal bg-teal-50/50 dark:bg-teal-950/30'
                    : isCompleted
                    ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-aurora-midnight'
                    : 'border-slate-200 dark:border-slate-800 opacity-50 bg-slate-50 dark:bg-aurora-midnight'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-slate-400">Tier 0{idx + 1}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-aurora-teal" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-[11px] text-slate-500">{t.desc}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Uploaded Documents */}
      <Card className="p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-aurora-blue" />
            <span>Submitted Credential Documentation</span>
          </h3>
          <Button size="sm" variant="outline" onClick={() => addToast({ type: 'info', title: 'File Dialog', message: 'Select additional degree or ID certificate.' })}>
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Additional Proof</span>
          </Button>
        </div>

        <div className="space-y-3">
          {uploadedDocs.map((doc, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{doc.name}</div>
                <div className="text-[11px] text-slate-400">{doc.type} • Uploaded {doc.uploadedAt}</div>
              </div>
              <Badge variant="teal">Verified by Administration</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
