import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl transition-all duration-200 border text-slate-600 dark:text-slate-300 hover:text-aurora-teal dark:hover:text-aurora-teal bg-white/80 dark:bg-aurora-navy/80 border-slate-200 dark:border-slate-700/60 shadow-sm ${className}`}
      aria-label="Toggle visual theme"
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-aurora-amber transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-aurora-midnight transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
