import React from 'react';
import { 
  ShieldAlert, 
  UserCheck, 
  Database, 
  Cpu, 
  Coins, 
  History,
  CheckCircle2
} from 'lucide-react';

export default function AdminPortal() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 mb-4 border border-white/20">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            Governance, Oversight & MLOps (Role: ADMINISTRATION)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Administration & Governance Center
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Verify medical practitioner credentials against State Councils, monitor facility synchronization pipelines, supervise MLOps drift telemetry, and inspect DPDP audit trails.
          </p>
        </div>
      </div>

      {/* Admin Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Doctor Verification Queue</h3>
          <p className="text-xs text-slate-500 mb-3">Verify NMC registration numbers and medical degrees.</p>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Facility Ingestion Monitor</h3>
          <p className="text-xs text-slate-500 mb-3">Sync pipelines for Google Places & ABDM registries.</p>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">MLOps Model Registry</h3>
          <p className="text-xs text-slate-500 mb-3">Track accuracy, ROC-AUC, latency, and data drift.</p>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <History className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">DPDP Audit Trails</h3>
          <p className="text-xs text-slate-500 mb-3">Immutable access logs and consent withdrawal tracking.</p>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>
      </div>
    </div>
  );
}
