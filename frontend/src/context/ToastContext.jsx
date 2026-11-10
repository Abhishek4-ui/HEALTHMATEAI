import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            let icon = <Info className="w-5 h-5 text-aurora-blue" />;
            let borderColor = 'border-aurora-blue/30';
            let bgGlow = 'bg-white dark:bg-aurora-navy';

            if (toast.type === 'success') {
              icon = <CheckCircle2 className="w-5 h-5 text-aurora-teal" />;
              borderColor = 'border-aurora-teal/40';
            } else if (toast.type === 'warning') {
              icon = <AlertTriangle className="w-5 h-5 text-aurora-amber" />;
              borderColor = 'border-aurora-amber/40';
            } else if (toast.type === 'error') {
              icon = <AlertCircle className="w-5 h-5 text-aurora-red" />;
              borderColor = 'border-aurora-red/40';
            } else if (toast.type === 'emergency') {
              icon = <ShieldAlert className="w-5 h-5 text-aurora-red animate-pulse" />;
              borderColor = 'border-aurora-red';
              bgGlow = 'bg-rose-50 dark:bg-aurora-midnight';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto p-4 rounded-xl border shadow-xl ${borderColor} ${bgGlow} text-slate-800 dark:text-slate-100 flex items-start gap-3 relative`}
              >
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1 pr-4">
                  {toast.title && <div className="font-bold text-sm leading-tight mb-0.5">{toast.title}</div>}
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{toast.message}</div>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
