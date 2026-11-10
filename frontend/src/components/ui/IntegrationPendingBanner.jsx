import React from 'react';
import { Radio, ShieldAlert } from 'lucide-react';

export default function IntegrationPendingBanner({
  serviceName = 'Backend Service',
  message = 'Real-time database and service integration is pending Phase 3 connection. Mock data is never fabricated.',
  className = ''
}) {
  return (
    <div className={`p-3.5 rounded-xl border border-aurora-amber/40 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2.5">
        <Radio className="w-4 h-4 text-aurora-amber animate-pulse shrink-0" />
        <div>
          <span className="font-bold mr-1.5">[{serviceName} Standby]</span>
          <span>{message}</span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700">
        <ShieldAlert className="w-3 h-3" />
        AUTHENTIC DATA ONLY
      </div>
    </div>
  );
}
