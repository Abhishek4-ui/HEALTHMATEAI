import React from 'react';

export default function Badge({ children, variant = 'default', className = '' }) {
  const styles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    teal: 'bg-emerald-50 dark:bg-teal-950/60 text-aurora-teal border-emerald-200 dark:border-teal-800',
    violet: 'bg-purple-50 dark:bg-purple-950/60 text-aurora-violet border-purple-200 dark:border-purple-800',
    blue: 'bg-blue-50 dark:bg-blue-950/60 text-aurora-blue border-blue-200 dark:border-blue-800',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-aurora-amber border-amber-200 dark:border-amber-800',
    red: 'bg-rose-50 dark:bg-rose-950/60 text-aurora-red border-rose-200 dark:border-rose-800',
    ephemeral: 'bg-teal-50 dark:bg-aurora-navy text-teal-800 dark:text-aurora-cyan border-teal-300 dark:border-teal-700 font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant] || styles.default} ${className}`}>
      {children}
    </span>
  );
}
