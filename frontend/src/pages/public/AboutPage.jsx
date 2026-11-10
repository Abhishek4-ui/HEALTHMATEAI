import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, GraduationCap, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal text-xs font-bold mb-4">
          <GraduationCap className="w-4 h-4" />
          BTech CSE Major Project • AI & ML Specialization
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About HealthMate AI
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          HealthMate AI is an enterprise-grade, privacy-first healthcare ecosystem engineered to bridge the clinical and diagnostic disconnect in India through explainable artificial intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-5">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Zero-Trust Ephemeral Privacy</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            By default, all patient symptom evaluations, conversational context, and uploaded diagnostic reports reside strictly in memory-backed Redis with automatic TTL expiration. Zero persistent health records without explicit consent.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center mb-5">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Explainable Hybrid AI</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Combines classical Machine Learning (XGBoost), Deep Learning, PaddleOCR, and Large Language Models (OpenRouter & Gemini) with SHAP local explainability and medical guideline citations.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center mb-5">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Strict Tri-Role Boundary</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Strictly bounded between exactly three personas: Patient, Doctor, and Administration. Doctors undergo State Council NMC verification before being credential-verified.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-aurora-navy/40 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Engineering Standards & Zero-Fabrication Pledge</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0 mt-0.5" />
            <span>No fake doctors or fabricated medical qualifications.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0 mt-0.5" />
            <span>No synthetic hospital listings or forged ratings.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0 mt-0.5" />
            <span>No fabricated clinical diagnoses or mock prescriptions.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-aurora-teal shrink-0 mt-0.5" />
            <span>DPDP Act 2023 compliant data protection and instant session purging.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
