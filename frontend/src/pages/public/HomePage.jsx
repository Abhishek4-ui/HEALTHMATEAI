import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldCheck, 
  Brain, 
  Cpu, 
  EyeOff, 
  MapPin, 
  Stethoscope, 
  FileText, 
  Lock, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  FileCheck2, 
  Sparkles,
  Search,
  MessageSquare,
  Flame
} from 'lucide-react';
import Button from '../../components/ui/Button';

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Subtle decorative background gradient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-aurora-teal/20 via-aurora-blue/15 to-aurora-violet/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal dark:text-aurora-cyan text-xs font-bold mb-8 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-aurora-teal" />
            <span>Digital Personal Data Protection (DPDP) Act 2023 Compliant</span>
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-teal animate-ping" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-5xl mx-auto"
          >
            Healthcare, Reimagined through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aurora-teal via-aurora-blue to-aurora-violet">
              Hybrid Artificial Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal"
          >
            An enterprise healthcare ecosystem integrating Machine Learning, Medical RAG, Computer Vision, and Explainable AI across exactly three certified roles with <strong>zero-trust ephemeral patient privacy</strong> by default.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/patient">
              <Button size="lg" variant="primary" className="shadow-glow-teal">
                <Activity className="w-5 h-5 text-aurora-midnight" />
                <span>Launch Patient Portal</span>
                <ArrowRight className="w-4 h-4 text-aurora-midnight" />
              </Button>
            </Link>

            <Link to="/doctor">
              <Button size="lg" variant="secondary" className="border border-slate-300 dark:border-slate-700">
                <Stethoscope className="w-5 h-5 text-aurora-blue" />
                <span>Doctor Workspace</span>
              </Button>
            </Link>

            <Link to="/admin">
              <Button size="lg" variant="outline">
                <Cpu className="w-5 h-5 text-aurora-violet" />
                <span>Administration & MLOps</span>
              </Button>
            </Link>
          </motion.div>

          {/* Animated AI Healthcare Orb Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 p-4 rounded-3xl bg-gradient-to-b from-white/80 to-white/30 dark:from-aurora-navy/60 dark:to-aurora-midnight/60 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-xl max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-left">
              <div className="p-4 rounded-2xl bg-white dark:bg-aurora-midnight/80 border border-slate-100 dark:border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-aurora-teal flex items-center justify-center mb-2">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Ephemeral Memory</div>
                <div className="text-[11px] text-slate-500">Redis TTL auto-purge</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-aurora-midnight/80 border border-slate-100 dark:border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center mb-2">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Real Discovery</div>
                <div className="text-[11px] text-slate-500">Google Places & ABDM</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-aurora-midnight/80 border border-slate-100 dark:border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center mb-2">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Explainable AI</div>
                <div className="text-[11px] text-slate-500">SHAP feature attribution</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-aurora-midnight/80 border border-slate-100 dark:border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Dual LLM Gateway</div>
                <div className="text-[11px] text-slate-500">OpenRouter + Gemini</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tri-Role Architecture Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-aurora-teal mb-2">Architectural Guarantee</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Strict Tri-Role Boundary Enforcement
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            HealthMate AI permits exactly three authenticated personas. No auxiliary or surrogate access tiers are permitted.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Patient Card */}
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-3xl bg-white dark:bg-aurora-navy/80 border border-slate-200 dark:border-slate-800 shadow-premium-card dark:shadow-premium-card-dark hover:border-aurora-teal/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 dark:bg-teal-950 text-aurora-teal border border-teal-200 dark:border-teal-800">
                  Role 1: PATIENT
                </span>
                <span className="text-[10px] text-slate-400 font-mono">19 Modules</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Patient Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Guest triage, multimodal symptom evaluations, lab report OCR, India-wide doctor discovery, and single-click zero-trace session deletion under India's DPDP Act 2023.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-teal" />
                  <span>Ephemeral by default in Redis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-teal" />
                  <span>Multilingual AI Copilot (Hindi / English)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-teal" />
                  <span>Verified India-wide doctor discovery</span>
                </li>
              </ul>
            </div>
            <Link to="/patient">
              <Button variant="primary" className="w-full">
                Enter Patient Portal
              </Button>
            </Link>
          </motion.div>

          {/* Doctor Card */}
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-3xl bg-white dark:bg-aurora-navy/80 border border-slate-200 dark:border-slate-800 shadow-premium-card dark:shadow-premium-card-dark hover:border-aurora-blue/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-aurora-blue border border-blue-200 dark:border-blue-800">
                  Role 2: DOCTOR
                </span>
                <span className="text-[10px] text-slate-400 font-mono">13 Modules</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Doctor Workspace</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                NMC credential review, encrypted WebRTC telemedicine rooms, AI clinical note drafter (SOAP), drug-drug interaction checker, and SHA-256 signed digital prescriptions.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-blue" />
                  <span>NMC registration verification queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-blue" />
                  <span>Clinical AI Copilot & SOAP note drafter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-blue" />
                  <span>Digital signed prescription builder</span>
                </li>
              </ul>
            </div>
            <Link to="/doctor">
              <Button variant="blue" className="w-full">
                Enter Doctor Workspace
              </Button>
            </Link>
          </motion.div>

          {/* Administration Card */}
          <motion.div
            variants={itemVariants}
            className="p-8 rounded-3xl bg-white dark:bg-aurora-navy/80 border border-slate-200 dark:border-slate-800 shadow-premium-card dark:shadow-premium-card-dark hover:border-aurora-violet/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-aurora-violet border border-purple-200 dark:border-purple-800">
                  Role 3: ADMINISTRATION
                </span>
                <span className="text-[10px] text-slate-400 font-mono">14 Modules</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Governance & MLOps</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Doctor qualification review, Google Places & ABDM synchronization monitoring, MLflow telemetry, data drift detection (KS-test), and immutable DPDP audit logs.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-violet" />
                  <span>Doctor credential review workflow</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-violet" />
                  <span>MLflow model registry & drift alarms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-aurora-violet" />
                  <span>Immutable DPDP audit trails</span>
                </li>
              </ul>
            </div>
            <Link to="/admin">
              <Button variant="violet" className="w-full">
                Enter Admin Portal
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Core Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-gradient-to-tr from-aurora-navy via-slate-900 to-aurora-midnight text-white border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-wider text-aurora-teal mb-2">Technical Rigor</div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Real Data, Real Models, Zero Fabrication
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              Under strict engineering rules, HealthMate AI does not fabricate patient records, dummy doctors, mock ratings, or fake diagnoses. All discoveries stem from verified registries; all AI predictions operate with confidence intervals and XAI explanations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-bold text-aurora-teal mb-1">XGBoost & SHAP Triage</div>
                <div className="text-slate-400">Calibrated risk classification with local feature attribution waterfall charts.</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-bold text-aurora-cyan mb-1">PaddleOCR v2 Document Intelligence</div>
                <div className="text-slate-400">Extracts lab biomarkers (Hb, Glucose, WBC) against authentic reference intervals.</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-bold text-aurora-blue mb-1">FAISS Medical RAG</div>
                <div className="text-slate-400">Grounded in Ministry of Health & WHO guidelines with citation traceability.</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-bold text-aurora-violet mb-1">Dual LLM Resilience</div>
                <div className="text-slate-400">OpenRouter primary gateway with automatic failover to Google Gemini.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
