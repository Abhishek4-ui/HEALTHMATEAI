import React from 'react';
import { Radio } from 'lucide-react';

export default function IntegrationPendingBanner({
  serviceName = 'Live Service',
  message = 'Connecting to real-time service. Please wait or refresh shortly.',
  className = ''
}) {
  return (
    <div className={`p-3 rounded-xl border border-aurora-amber/30 bg-aurora-amber/10 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5 ${className}`}>
      <Radio className="w-3.5 h-3.5 text-aurora-amber animate-pulse shrink-0" />
      <div>
        <span className="font-semibold">{serviceName}: </span>
        <span>{message}</span>
      </div>
    </div>
  );
}
