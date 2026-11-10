import React from 'react';
import { 
  User, 
  Cpu, 
  Trash2, 
  Stethoscope, 
  ShieldCheck 
} from 'lucide-react';
import Card from '../../components/ui/Card';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Temporary Session Setup',
      description: 'Start as a guest or log in. Symptoms and conversations are held temporarily and are not permanently saved by default.',
      icon: User,
      color: 'text-aurora-teal',
      bg: 'bg-teal-50 dark:bg-teal-950/60'
    },
    {
      step: '02',
      title: 'Symptom & Report Input',
      description: 'Describe your symptoms or upload a lab report to extract key biomarkers and check normal reference ranges.',
      icon: Cpu,
      color: 'text-aurora-blue',
      bg: 'bg-blue-50 dark:bg-blue-950/60'
    },
    {
      step: '03',
      title: 'AI Health Assessment',
      description: 'Get an overview of possible conditions, severity levels, and guidance based on medical reference guidelines.',
      icon: ShieldCheck,
      color: 'text-aurora-violet',
      bg: 'bg-purple-50 dark:bg-purple-950/60'
    },
    {
      step: '04',
      title: 'Delete Data or Book a Doctor',
      description: 'Delete your session data instantly with the Forget Me option, or find and book a verified doctor near you.',
      icon: Trash2,
      color: 'text-aurora-amber',
      bg: 'bg-amber-50 dark:bg-amber-950/60'
    },
    {
      step: '05',
      title: 'Consultation & Prescription',
      description: 'Connect with a verified doctor via secure video or in-person consultation and receive a digital prescription.',
      icon: Stethoscope,
      color: 'text-aurora-teal',
      bg: 'bg-teal-50 dark:bg-teal-950/60'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How It Works
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          From symptom check to doctor consultation in five steps.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card key={idx} className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">
                  Step {s.step}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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
