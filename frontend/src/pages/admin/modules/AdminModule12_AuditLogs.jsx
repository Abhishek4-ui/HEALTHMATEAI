import React, { useState } from 'react';
import { History, Search, Download, ShieldCheck } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function AdminModule12_AuditLogs() {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const { addToast } = useToast();

  const auditLogs = [
    {
      id: 'log_01',
      timestamp: '2026-11-10T10:15:30Z',
      actorRole: 'PATIENT',
      action: 'PURGE_EPHEMERAL_SESSION',
      target: 'session:guest:e98f7c10b4a8',
      ip: '203.0.113.195',
      status: 200,
    },
    {
      id: 'log_02',
      timestamp: '2026-11-10T09:45:12Z',
      actorRole: 'ADMINISTRATION',
      action: 'APPROVE_DOCTOR_CREDENTIALS',
      target: 'doctor:6730ab9f1c4e7a892b10ef12',
      ip: '198.51.100.88',
      status: 200,
    },
    {
      id: 'log_03',
      timestamp: '2026-11-10T08:30:00Z',
      actorRole: 'SYSTEM_CRON',
      action: 'DISCOVERY_DELTA_SYNC',
      target: 'health_facilities (ABDM/Places)',
      ip: '127.0.0.1',
      status: 200,
    }
  ];

  const filtered = auditLogs.filter(l => roleFilter === 'ALL' || l.actorRole === roleFilter);

  const handleExport = () => {
    addToast({
      type: 'success',
      title: 'Audit Trail Exported',
      message: 'Immutable DPDP compliance audit log downloaded as JSON.',
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              DPDP Compliance & Access Audit Trails
            </h2>
            <Badge variant="teal">Immutable Records</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cryptographically sealed access trails documenting administrative actions and patient consent changes.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log</span>
        </Button>
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
        {['ALL', 'PATIENT', 'DOCTOR', 'ADMINISTRATION', 'SYSTEM_CRON'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              roleFilter === r
                ? 'bg-aurora-violet text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-aurora-navy'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Timestamp</th>
                <th className="py-2.5">Actor Role</th>
                <th className="py-2.5">Action Executed</th>
                <th className="py-2.5">Target Resource</th>
                <th className="py-2.5">IP Address</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-aurora-midnight/50">
                  <td className="py-3 text-slate-400">{log.timestamp}</td>
                  <td className="py-3 font-sans">
                    <Badge variant="blue">{log.actorRole}</Badge>
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white font-sans">{log.action}</td>
                  <td className="py-3 text-slate-500 truncate max-w-xs">{log.target}</td>
                  <td className="py-3 text-slate-400">{log.ip}</td>
                  <td className="py-3 text-right">
                    <span className="text-emerald-600 font-bold font-sans">HTTP {log.status}</span>
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
