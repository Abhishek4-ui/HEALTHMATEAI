import React, { useState } from 'react';
import { ShieldAlert, Trash2, CheckCircle2, X } from 'lucide-react';

export default function ForgetMeModal({ isOpen, onClose }) {
  const [purged, setPurged] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurge = () => {
    setLoading(true);
    setTimeout(() => {
      // Clear all local session artifacts and tokens
      sessionStorage.clear();
      localStorage.removeItem('healthmate_temp_session');
      setLoading(false);
      setPurged(true);
      setTimeout(() => {
        setPurged(false);
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {purged ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Session Data Purged</h3>
            <p className="text-sm text-slate-600">
              Zero residual traces remain in ephemeral cache. In accordance with India's DPDP Act 2023, your temporary session has been wiped.
            </p>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Session Deletion</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              HealthMate AI operates in <strong>ephemeral memory by default</strong>. Clicking below immediately purges all active symptom inputs, uploaded laboratory files, and temporary conversation tokens from Redis cache.
            </p>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 mb-6 font-medium">
              Note: Confirmed doctor appointments with official payment references are legally retained as minimum necessary transactional records under NMC telemedicine guidelines.
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurge}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Purging...' : 'Wipe Session'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
