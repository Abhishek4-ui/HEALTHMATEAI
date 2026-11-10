import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Eye, 
  AlertCircle, 
  Download 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function DocModule08_ConsentedReports() {
  const [reports, setReports] = useState([]);
  const { addToast } = useToast();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Consented Patient Diagnostic Records
            </h2>
            <Badge variant="teal">DPDP Access Token</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pathology and diagnostic reports shared under explicit, time-bounded patient consent.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-aurora-teal shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Zero-Knowledge Access Boundary:</strong> In accordance with India's DPDP Act 2023, doctors are granted read-only visibility into patient reports exclusively during the active consultation appointment window. Access is automatically revoked upon consultation completion.
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-4">
          {/* List of reports */}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No Active Patient Reports Shared"
          description="Reports uploaded by patients for active teleconsultation review will appear here once patient consent is confirmed."
        />
      )}
    </div>
  );
}
