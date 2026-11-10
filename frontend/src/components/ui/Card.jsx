import React from 'react';

export default function Card({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  ...props
}) {
  const baseStyles = 'rounded-3xl border transition-all duration-200';
  const surfaceStyles = glass
    ? 'glass-panel shadow-lg'
    : 'bg-white dark:bg-aurora-navy/80 border-slate-200 dark:border-slate-800 shadow-premium-card dark:shadow-premium-card-dark';
  const hoverStyles = hoverEffect
    ? 'hover:-translate-y-1 hover:border-aurora-teal/50 hover:shadow-xl'
    : '';

  return (
    <div className={`${baseStyles} ${surfaceStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
