import React from 'react';
import { ShieldAlert, Lock, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

export default function AdminModule11_SecurityMonitoring() {
  const securityEvents = [
    { type: 'RATE_LIMIT', ip: '203.0.113.195', route: '/api/v1/auth/login', status: 'BLOCKED_BY_REDIS', time: '10 mins ago' },
    { type: 'EPHEMERAL_PURGE', ip: '198.51.100.42', route: '/api/v1/patient/session', status: 'PURGE_SUCCESSFUL', time: '22 mins ago' },
    { type: 'SIGNATURE_VERIFIED', ip: '52.66.182.90', route: '/api/v1/payments/razorpay-webhook', status: 'HMAC_VALID', time: '1 hour ago' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Security & Events
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rate limiting, webhook verification, and access logs.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Recent Security & Filter Incidents</h3>
        <div className="space-y-3 text-xs">
          {securityEvents.map((ev, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{ev.type}</span>
                <span className="text-slate-400 font-mono ml-2">[{ev.ip}]</span>
                <div className="text-[11px] text-slate-500 font-mono">{ev.route}</div>
              </div>
              <div className="text-right">
                <Badge variant={ev.status.includes('BLOCKED') ? 'amber' : 'teal'}>{ev.status}</Badge>
                <div className="text-[10px] text-slate-400 mt-1">{ev.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
