import React from 'react';
import { 
  Bot, 
  Activity, 
  FileText, 
  Search, 
  Video, 
  FileCheck2, 
  ShieldAlert, 
  Cpu, 
  Trash2,
  MapPin,
  Calendar,
  Sparkles,
  Heart
} from 'lucide-react';
import Card from '../../components/ui/Card';

export default function FeaturesPage() {
  const patientFeatures = [
    { title: 'AI Health Copilot', desc: 'Multilingual conversational health assistant with Hindi and English support.', icon: Bot },
    { title: 'Explainable Symptom Checker', desc: 'Triage risk level scoring calibrated with SHAP feature attributions.', icon: Activity },
    { title: 'Medical Report OCR', desc: 'Automatic biomarker extraction (Hb, WBC, Glucose) via PaddleOCR.', icon: FileText },
    { title: 'Doctor & Hospital Discovery', desc: 'India-wide and radius-based geolocation search through Google Places and ABDM.', icon: MapPin },
    { title: 'Instant Ephemeral Purge', desc: 'Zero-trace session deletion wiping Redis keys on demand under DPDP 2023.', icon: Trash2 },
    { title: 'Vitals & Health Tracker', desc: 'Track blood pressure, heart rate, and glucose trends with authentic charts.', icon: Heart },
  ];

  const doctorFeatures = [
    { title: 'Clinical AI Copilot', desc: 'Automates consultation summarization and drafts SOAP clinical notes.', icon: Sparkles },
    { title: 'NMC Credential Verification', desc: 'State Medical Council number verification and qualification auditing.', icon: FileCheck2 },
    { title: 'Encrypted Telehealth', desc: 'Peer-to-peer WebRTC video and audio consultations with ICE relay.', icon: Video },
    { title: 'Digital Signed Prescriptions', desc: 'Issues tamper-evident, digitally hashed prescriptions to patients.', icon: FileCheck2 },
  ];

  const adminFeatures = [
    { title: 'Doctor Verification Queue', desc: 'State medical council document inspection and approval workflow.', icon: ShieldAlert },
    { title: 'MLOps Model Registry', desc: 'Real-time monitoring of model accuracy, ROC-AUC, latency, and drift.', icon: Cpu },
    { title: 'Facility Ingestion Pipeline', desc: 'Deduplicated synchronization of hospital and clinic registries.', icon: Search },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Platform Feature Architecture
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Comprehensive enterprise-grade features architected for the three authorized roles with strict privacy safeguards.
        </p>
      </div>

      {/* Patient Features */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-teal-950 text-aurora-teal border border-teal-200 dark:border-teal-800">
            PATIENT PORTAL
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">19 Integrated Patient Modules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {patientFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="p-6">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Doctor Features */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-aurora-blue border border-blue-200 dark:border-blue-800">
            DOCTOR PORTAL
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">13 Clinical Practice Modules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctorFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Admin Features */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-aurora-violet border border-purple-200 dark:border-purple-800">
            ADMINISTRATION PORTAL
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">14 Oversight & Governance Modules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="p-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
