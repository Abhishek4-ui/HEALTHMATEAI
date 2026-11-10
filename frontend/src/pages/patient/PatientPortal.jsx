import React from 'react';
import { 
  Bot, 
  Activity, 
  FileText, 
  Search, 
  Calendar, 
  Heart, 
  Trash2, 
  ShieldCheck,
  Languages,
  Mic
} from 'lucide-react';

export default function PatientPortal() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Patient Header Banner */}
      <div className="bg-gradient-to-r from-health-800 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-teal-100 mb-4 border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Active Session: Ephemeral (Zero MongoDB Retention)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome to HealthMate AI Patient Portal
          </h1>
          <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
            Assess symptoms with Explainable AI, consult your multilingual health copilot, parse diagnostic lab reports, or book consultations with verified doctors across India.
          </p>
        </div>
      </div>

      {/* Feature Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-health-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-health-50 text-health-600 flex items-center justify-center mb-4">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">AI Health Copilot</h3>
          <p className="text-xs text-slate-500 mb-3">Multilingual assistant supporting Hindi, English, and voice input.</p>
          <span className="text-xs font-semibold text-health-700 bg-health-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-health-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Symptom Checker</h3>
          <p className="text-xs text-slate-500 mb-3">Triage risk scoring with SHAP feature attributions.</p>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-health-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Medical Report OCR</h3>
          <p className="text-xs text-slate-500 mb-3">Ephemeral lab biomarker extraction with reference intervals.</p>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-health-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Doctor Discovery</h3>
          <p className="text-xs text-slate-500 mb-3">India-wide and nearby verified practitioners & clinics.</p>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">Scaffold Ready (Phase 1)</span>
        </div>
      </div>
    </div>
  );
}
