import React, { useState } from 'react';
import { 
  Pill, 
  Download
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
      title: 'Downloading',
      message: 'Prescription PDF download started.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Prescriptions
          </h2>
          <p className="text-xs text-slate-500">
            Digital prescriptions issued by your doctors.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <Pill className="w-5 h-5" />
        </div>
      </div>

      {prescriptions.length > 0 ? (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <Card key={rx.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <h3 className="font-semibold text-xs text-slate-900 dark:text-white">{rx.doctorName}</h3>
                  <p className="text-[11px] text-slate-400">{rx.date}</p>
                </div>
                <Badge variant="teal">Signed</Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300">Medications:</div>
                {rx.medications?.map((m, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-aurora-midnight flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">{m.name}</span>
                      <span className="text-slate-500 ml-1.5">({m.dosage})</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{m.frequency}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1 border-t border-slate-100 dark:border-slate-800">
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
          title="No prescriptions found"
          description="Prescriptions issued after your doctor consultations will be saved here."
          actionLabel="Find a Doctor"
          onAction={() => window.location.href = '/patient/doctors'}
        />
      )}
    </div>
  );
}
