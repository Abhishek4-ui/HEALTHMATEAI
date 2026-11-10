import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = '',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-aurora-navy/30 flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
