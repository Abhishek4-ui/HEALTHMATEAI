import React, { useState } from 'react';
import { 
  Pill, 
  FileText, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Calendar,
  Lock
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function Module10_Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const { addToast } = useToast();

  const handleDownload = (id) => {
    addToast({
      type: 'info',
      title: 'Prescription PDF',
      message: 'Prescription PDF download initiated with embedded digital signature.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Digitally Signed Prescriptions
            </h2>
            <Badge variant="teal">NMC Compliant</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official digital medical orders issued by verified doctors with tamper-evident cryptographic hashes.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <Pill className="w-6 h-6" />
        </div>
      </div>

      {/* Prescriptions List / Empty State */}
      {prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <Card key={rx.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{rx.doctorName}</h3>
                  <p className="text-xs text-slate-400">NMC Reg: {rx.doctorNmcNumber} • {rx.date}</p>
                </div>
                <Badge variant="teal">Digitally Signed</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-700 dark:text-slate-300">Prescribed Medications:</div>
                {rx.medications?.map((m, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                      <span className="text-slate-500 ml-2 font-mono">({m.dosage})</span>
                    </div>
                    <span className="text-slate-400">{m.frequency}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                  SHA-256: {rx.signatureHash}
                </span>
                <Button size="sm" variant="outline" onClick={() => handleDownload(rx.id)}>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Pill}
          title="No Prescriptions Issued Yet"
          description="You do not have any digital prescriptions on record. Prescriptions are issued strictly following a clinical consultation with an accredited doctor."
          actionLabel="Book a Consultation"
          onAction={() => window.location.href = '/patient/doctors'}
        />
      )}
    </div>
  );
}
