import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  Shield, 
  ArrowRight, 
  Calendar,
  FileText,
  Building2,
  HeartPulse,
  Brain,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  Bot,
  Scan,
  ShieldAlert
} from 'lucide-react';

export default function HomePage() {
  const specialties = [
    { name: 'Cardiology', desc: 'ECG, arrhythmia, and cardiovascular health evaluation', icon: HeartPulse, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50' },
    { name: 'Neurology', desc: 'Head CT, neuro-imaging, and acute vertigo screening', icon: Brain, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50' },
    { name: 'Radiology', desc: 'Chest X-Ray, CT density, MRI and scan interpretation', icon: Activity, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-900/50' },
    { name: 'General Medicine', desc: 'Comprehensive medical consultations & digital prescriptions', icon: Stethoscope, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' },
  ];

  const highlights = [
    { title: '36 States & UTs', subtitle: 'All-India doctor, clinic, and hospital directory across all states and territories' },
    { title: 'State Medical Councils', subtitle: 'Transparent practitioner registration numbers and council affiliations' },
    { title: 'Patient Data Privacy', subtitle: 'Explicit consent controls, temporary session memory, and strict access isolation' },
    { title: 'Multi-Modal AI Suite', subtitle: 'Clinical assistance for lab reports, 12-lead ECGs, and diagnostic imaging' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-14 lg:pt-20 lg:pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Factual Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-6 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Patient-First Healthcare • All-India Medical Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Modern Healthcare, Intelligent Diagnostics &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">
              Accessible Care
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Connecting patients with licensed medical practitioners, diagnostic laboratory report analyzers, multi-modal medical imaging, and 24/7 emergency response across all 36 Indian States and Union Territories.
          </p>

          {/* Primary Patient Action Doors */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/login">
              <button className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-600/25 flex items-center gap-2.5 transition transform hover:-translate-y-0.5">
                <Activity className="w-4 h-4" />
                <span>Enter Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link to="/patient/symptom-checker">
              <button className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-sm border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-2.5 transition transform hover:-translate-y-0.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>AI Symptom Triage</span>
              </button>
            </Link>

            <Link to="/patient/doctors">
              <button className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-2.5 transition transform hover:-translate-y-0.5">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>Find Doctors & Care</span>
              </button>
            </Link>
          </div>

          {/* Emergency Helpline Strip */}
          <div className="mt-10 max-w-2xl mx-auto p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-center gap-3">
            <PhoneCall className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Medical Emergency?</strong> Dial <strong className="font-mono text-sm underline">112</strong> or <strong className="font-mono text-sm underline">102</strong> immediately for national ambulance and hospital trauma support.
            </span>
          </div>
        </div>
      </section>

      {/* Network Verification Statistics Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((h, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{h.title}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {h.subtitle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Patient Healthcare Capabilities (Consolidated Patient-Only Presentation) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Comprehensive Patient Healthcare Suite</h2>
          <p className="text-xs text-slate-500 mt-1">End-to-end intelligent tools designed specifically for patient wellness, diagnostic review, and care delivery</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Clinical AI & Diagnostics */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center border border-teal-100 dark:border-teal-900">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clinical AI & Diagnostics</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Check symptoms in real-time, upload lab reports to extract LOINC biomarkers, and evaluate 12-lead ECGs and medical scans with AI assistance.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <li className="flex items-center gap-2">• Automated Laboratory Report OCR & LOINC standards</li>
                <li className="flex items-center gap-2">• Medical Imaging AI (Chest X-Ray, CT, Brain MRI)</li>
                <li className="flex items-center gap-2">• 12-Lead ECG rhythm and conduction review</li>
                <li className="flex items-center gap-2">• 24/7 Conversational AI Health Assistant</li>
              </ul>
            </div>
            <div className="pt-6">
              <Link to="/patient/ai-assistant">
                <button className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-xs transition">
                  Explore AI Diagnostics
                </button>
              </Link>
            </div>
          </div>

          {/* Card 2: Doctor & Hospital Discovery */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Doctor & Hospital Discovery</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Locate council-registered specialists, nearby clinics, and 24/7 hospital emergency departments across all 36 Indian States and Union Territories.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <li className="flex items-center gap-2">• Transparent Medical Council registration numbers</li>
                <li className="flex items-center gap-2">• Search by State, District, City, or Specialization</li>
                <li className="flex items-center gap-2">• Real consultation booking & time slot verification</li>
                <li className="flex items-center gap-2">• Dual-rail payments (Razorpay Test Mode & UPI)</li>
              </ul>
            </div>
            <div className="pt-6">
              <Link to="/patient/doctors">
                <button className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition">
                  Find Doctors & Hospitals
                </button>
              </Link>
            </div>
          </div>

          {/* Card 3: Telehealth & Health Management */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Telehealth & Monitoring</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect via encrypted video consultations, track vital indicators, set medication reminders, and maintain personal family health records.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <li className="flex items-center gap-2">• High-definition WebRTC video teleconsultation</li>
                <li className="flex items-center gap-2">• Digital prescriptions and medicine reminders</li>
                <li className="flex items-center gap-2">• Blood pressure, glucose, and vitals tracking</li>
                <li className="flex items-center gap-2">• Strict patient consent and session privacy controls</li>
              </ul>
            </div>
            <div className="pt-6">
              <Link to="/login">
                <button className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition">
                  Access Health Management
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Specialties Directory */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Clinical Specialties</span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">Specialized Care Directory</h2>
            </div>
            <Link to="/patient/doctors">
              <span className="text-xs font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1">
                Browse All Doctors & Hospitals Across India <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {specialties.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 hover:border-slate-600 transition">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${spec.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">{spec.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{spec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
