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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Patient Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Diagnostic reports shared by patients for consultation.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-4">
          {/* List of reports */}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No reports shared"
          description="Reports shared by patients will appear here during consultation."
        />
      )}
    </div>
  );
}
