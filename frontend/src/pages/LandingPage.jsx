import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  Stethoscope, 
  FileSearch, 
  UserCheck, 
  Lock, 
  Zap, 
  ArrowRight,
  Database,
  EyeOff
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-health-50 border border-health-200 text-health-800 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 text-health-600" />
            DPDP Act 2023 Compliant • Ephemeral Patient Data by Default
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Intelligent Healthcare Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-health-600 to-teal-500">Hybrid AI</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            HealthMate AI integrates Machine Learning, Deep Learning, Medical RAG, Computer Vision, and Explainable AI across exactly three certified roles with zero-trust privacy.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/patient"
              className="px-6 py-3.5 rounded-xl bg-health-600 hover:bg-health-700 text-white font-bold text-sm shadow-lg shadow-health-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              Enter Patient Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/doctor"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm flex items-center gap-2 transition-all hover:scale-105"
            >
              Doctor Clinical Workspace
            </Link>
            <Link
              to="/admin"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-105"
            >
              Administration & MLOps
            </Link>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Ephemeral by Default</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Patient symptom evaluations, lab reports, and AI chat sessions live in memory-backed Redis with automatic TTL expiration. No permanent health records without explicit consent.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">India-Wide & Nearby Discovery</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Automated ingestion pipelines connecting Google Places and ABDM official registries to discover certified doctors, hospitals, clinics, and pharmacies without fabricated records.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Explainable Hybrid AI</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              XGBoost triage risk scoring calibrated with SHAP feature attributions, PaddleOCR lab biomarker parsing, and clinical guideline RAG via OpenRouter and Gemini fallback.
            </p>
          </div>
        </div>
      </section>

      {/* Role Navigation Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Strictly Enforced Tri-Role Ecosystem</h2>
          <p className="text-sm text-slate-500 mt-1">Authorized access boundaries for Patient, Doctor, and Administration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/patient"
            className="group p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 hover:border-health-500 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-health-600 bg-health-50 px-2.5 py-1 rounded-md">Role 1</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-health-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Patient Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Guest triage sessions, AI Health Copilot, lab report OCR, vitals tracker, nearby healthcare discovery, and one-click data wipe.
            </p>
          </Link>

          <Link
            to="/doctor"
            className="group p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Role 2</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Doctor Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              NMC credential verification, appointment calendar, clinical consultation room, AI SOAP note builder, and digital signed prescriptions.
            </p>
          </Link>

          <Link
            to="/admin"
            className="group p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 hover:border-purple-500 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">Role 3</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Administration Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doctor qualification approval queue, facility sync pipeline monitor, MLOps model registry & drift alarms, and DPDP audit logs.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
