import React, { useState } from 'react';
import { Users, Search, ShieldCheck, Lock, Trash2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';

export default function AdminModule05_PatientAccounts() {
  const [patients, setPatients] = useState([
    { id: 'pat_1', email: 'verified.patient@healthmate.ai', registeredAt: '2026-11-09', dpdpConsent: 'ACTIVE', status: 'ACTIVE' }
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Patient Account Administration
            </h2>
            <Badge variant="teal">DPDP Compliant</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registered patient authentication accounts and statutory consent records.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
        <strong>Privacy Protocol:</strong> In accordance with zero-trust privacy, administrators do not possess access to raw patient symptom histories, AI chat dialogues, or uploaded medical files. Only authenticated account metadata is accessible.
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Account ID</th>
                <th className="py-2.5">Email Address</th>
                <th className="py-2.5">Registered Date</th>
                <th className="py-2.5">DPDP Consent</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {patients.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 font-mono text-slate-400">{p.id}</td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{p.email}</td>
                  <td className="py-3 text-slate-500">{p.registeredAt}</td>
                  <td className="py-3">
                    <Badge variant="teal">{p.dpdpConsent}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Badge variant="blue">{p.status}</Badge>
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
