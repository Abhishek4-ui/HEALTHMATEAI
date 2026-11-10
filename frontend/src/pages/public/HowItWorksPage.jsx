import React from 'react';
import { 
  ArrowRight, 
  User, 
  Cpu, 
  Trash2, 
  Stethoscope, 
  FileCheck2, 
  ShieldCheck 
} from 'lucide-react';
import Card from '../../components/ui/Card';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Ephemeral Health Session Initiation',
      description: 'The patient opens an anonymous or authenticated triage session. An encrypted Redis session is allocated with a 60-minute TTL. No permanent database records are created.',
      icon: User,
      color: 'text-aurora-teal',
      bg: 'bg-teal-50 dark:bg-teal-950/60'
    },
    {
      step: '02',
      title: 'Multimodal AI Triage & Document OCR',
      description: 'Patient submits symptoms, biometrics, or pathology reports. The Python FastAPI microservice runs calibrated XGBoost risk scoring and PaddleOCR extraction.',
      icon: Cpu,
      color: 'text-aurora-blue',
      bg: 'bg-blue-50 dark:bg-blue-950/60'
    },
    {
      step: '03',
      title: 'Explainable AI Output & Clinical Citations',
      description: 'The patient receives an explainable triage summary highlighting the top contributing factors via SHAP and medical guidance retrieved via FAISS RAG from WHO/Ministry of Health corpora.',
      icon: ShieldCheck,
      color: 'text-aurora-violet',
      bg: 'bg-purple-50 dark:bg-purple-950/60'
    },
    {
      step: '04',
      title: 'Patient Choice: Purge or Consult',
      description: 'The patient can click "Forget Me" to instantly purge all Redis keys, or proceed to book a teleconsultation with a verified doctor across India (Transactional Exception).',
      icon: Trash2,
      color: 'text-aurora-amber',
      bg: 'bg-amber-50 dark:bg-amber-950/60'
    },
    {
      step: '05',
      title: 'Encrypted Telehealth & Digital Prescription',
      description: 'The doctor connects via peer-to-peer WebRTC, reviews the patient context with AI Copilot assistance, and issues an immutable, digitally signed prescription.',
      icon: Stethoscope,
      color: 'text-aurora-teal',
      bg: 'bg-teal-50 dark:bg-teal-950/60'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How HealthMate AI Works
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          From ephemeral symptom triage to verified clinical teleconsultations: a transparent, privacy-first healthcare continuum.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card key={idx} className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0 font-extrabold text-lg`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Step {s.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
