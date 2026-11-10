import React from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Video, 
  FileCheck2, 
  AlertTriangle, 
  Wallet,
  Sparkles
} from 'lucide-react';

export default function DoctorPortal() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 mb-4 border border-white/20">
            <Stethoscope className="w-4 h-4 text-blue-300" />
            Clinical Practice Workspace (Role: DOCTOR)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Doctor Clinical Portal & AI Copilot
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Manage teleconsultations, conduct encrypted WebRTC sessions, draft SOAP notes with the clinical AI copilot, and generate digitally signed e-prescriptions.
          </p>
        </div>
      </div>

      {/* Doctor Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Schedule & Availability</h3>
          <p className="text-xs text-slate-500 mb-3">Configure consultation hours and slot durations.</p>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Telehealth Room</h3>
          <p className="text-xs text-slate-500 mb-3">Encrypted WebRTC video/audio clinical consultations.</p>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">AI Clinical Copilot</h3>
          <p className="text-xs text-slate-500 mb-3">Draft SOAP clinical notes and check drug interactions.</p>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Digital Prescriptions</h3>
          <p className="text-xs text-slate-500 mb-3">Issue NMC-compliant digitally signed prescriptions.</p>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>
      </div>
    </div>
  );
}
