import React from 'react';
import { 
  Bot, 
  Activity, 
  FileText, 
  Video, 
  FileCheck2, 
  ShieldAlert, 
  Cpu, 
  Trash2,
  MapPin,
  Heart
} from 'lucide-react';
import Card from '../../components/ui/Card';

export default function FeaturesPage() {
  const patientFeatures = [
    { title: 'AI Health Assistant', desc: 'Conversational health support in Hindi and English.', icon: Bot },
    { title: 'Symptom Checker', desc: 'Step-by-step symptom assessment and urgency rating.', icon: Activity },
    { title: 'Report Analyzer', desc: 'Extracts lab values and compares them against standard reference ranges.', icon: FileText },
    { title: 'Doctor Discovery', desc: 'Find verified doctors and clinics nearby or across India.', icon: MapPin },
    { title: 'Session Privacy', desc: 'Delete your temporary health data with one click.', icon: Trash2 },
    { title: 'Health Tracking', desc: 'Record and track blood pressure, glucose, and vitals over time.', icon: Heart },
  ];

  const doctorFeatures = [
    { title: 'Clinical Notes', desc: 'Draft structured clinical notes and consultation summaries.', icon: FileText },
    { title: 'NMC Verification', desc: 'Verify medical registration numbers with national registries.', icon: FileCheck2 },
    { title: 'Video Consultations', desc: 'Conduct online video and audio consultations with patients.', icon: Video },
    { title: 'Digital Prescriptions', desc: 'Issue digital prescriptions directly to patients.', icon: FileCheck2 },
  ];

  const adminFeatures = [
    { title: 'Doctor Verification Queue', desc: 'Review doctor registration certificates and verify qualifications.', icon: ShieldAlert },
    { title: 'AI Model Monitoring', desc: 'Monitor AI response quality, service latency, and system health.', icon: Cpu },
    { title: 'Hospital Directory', desc: 'Manage verified hospital and medical facility listings.', icon: FileText },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Platform Features
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Tools for patients, doctors, and administrators.
        </p>
      </div>

      {/* Patient Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patient Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patientFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="p-5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Doctor Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Doctor Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctorFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="p-5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Admin Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Administration Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adminFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} className="p-5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
