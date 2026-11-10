import React, { useState } from 'react';
import { Building2, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function AdminModule04_HospitalDirectory() {
  const [syncing, setSyncing] = useState(false);
  const { addToast } = useToast();

  const facilities = [
    { name: 'Apollo Hospitals Bannerghatta', type: 'HOSPITAL', city: 'Bengaluru', status: 'SOURCE_VERIFIED', departments: 14 },
    { name: 'Fortis Memorial Research Institute', type: 'HOSPITAL', city: 'Gurugram', status: 'SOURCE_VERIFIED', departments: 18 },
    { name: 'Manipal Hospital Indiranagar', type: 'HOSPITAL', city: 'Bengaluru', status: 'SOURCE_VERIFIED', departments: 12 }
  ];

  const handleTriggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      addToast({
        type: 'success',
        title: 'Sync Complete',
        message: 'Hospital directory updated.',
      });
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Hospital Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered hospitals and clinics across India.
          </p>
        </div>

        <Button size="sm" variant="blue" onClick={handleTriggerSync} loading={syncing}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Directory</span>
        </Button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Facility Name</th>
                <th className="py-2.5">Type</th>
                <th className="py-2.5">City</th>
                <th className="py-2.5">Departments</th>
                <th className="py-2.5 text-right">Accreditation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {facilities.map((fac, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-aurora-midnight/50">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{fac.name}</td>
                  <td className="py-3 text-slate-500">{fac.type}</td>
                  <td className="py-3 text-slate-500">{fac.city}</td>
                  <td className="py-3 font-mono">{fac.departments} Departments</td>
                  <td className="py-3 text-right">
                    <Badge variant="teal">{fac.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
