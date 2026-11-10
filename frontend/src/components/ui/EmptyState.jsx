import React from 'react';
import { Inbox, AlertCircle } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No Data Recorded Yet',
  description = 'There are no active records in this view. In accordance with zero-trust privacy, health data is never fabricated.',
  actionLabel,
  onAction,
  className = '',
  isIntegrationPending = false,
}) {
  return (
    <div className={`p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-white/40 dark:bg-aurora-navy/30 flex flex-col items-center justify-center ${className}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
        isIntegrationPending
          ? 'bg-amber-100 dark:bg-amber-950/50 text-aurora-amber'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
      }`}>
        {isIntegrationPending ? <AlertCircle className="w-7 h-7" /> : <Icon className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
