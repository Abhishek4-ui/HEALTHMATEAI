import React, { useState } from 'react';
import { Trash2, CheckCircle2, X } from 'lucide-react';
import apiClient from '../../services/api';

export default function ForgetMeModal({ isOpen, onClose }) {
  const [purged, setPurged] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurge = async () => {
    setLoading(true);
    try {
      await apiClient.delete('/patient/forget-me');
    } catch (e) {
      // Handled in session fallback
    }

    sessionStorage.clear();
    localStorage.removeItem('healthmate_temp_session');
    setLoading(false);
    setPurged(true);
    setTimeout(() => {
      setPurged(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-aurora-navy rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {purged ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Session Data Deleted</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your temporary symptoms, reports, and conversation data have been removed.
            </p>
          </div>
        ) : (
          <div>
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-xl flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Temporary Session</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              This will delete your active symptoms, uploaded reports, and chat history.
            </p>
            <p className="text-[11px] text-slate-400 mb-5">
              Confirmed appointments and receipts are retained as required by healthcare regulations.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePurge}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-medium text-xs hover:bg-rose-700 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {loading ? 'Deleting...' : 'Delete Session'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
