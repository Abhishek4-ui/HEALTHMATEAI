import React from 'react';
import { 
  Cpu, 
  FileText, 
  Sparkles, 
  BarChart2, 
  ShieldCheck, 
  Layers,
  Database
} from 'lucide-react';
import Card from '../../components/ui/Card';

export default function AITechnologyPage() {
  const techStack = [
    {
      title: 'Machine Learning Models',
      category: 'Predictive Triage',
      desc: 'Trained on validated research datasets (PhysioNet, CDC) for symptom severity and chronic risk scoring.',
      icon: Cpu,
    },
    {
      title: 'Medical Document OCR',
      category: 'Computer Vision',
      desc: 'Extracts lab test values from medical reports and compares them against standard reference intervals.',
      icon: FileText,
    },
    {
      title: 'Medical Reference Retrieval',
      category: 'Knowledge Base',
      desc: 'Retrieves relevant clinical guidelines and reference standards for symptoms and medication safety.',
      icon: Database,
    },
    {
      title: 'Dual LLM Gateway',
      category: 'Language Models',
      desc: 'OpenRouter primary gateway with automatic failover to Google Gemini, with response timeouts and medical safeguards.',
      icon: Sparkles,
    },
    {
      title: 'Explainable AI',
      category: 'Model Transparency',
      desc: 'Computes feature attributions to show which patient inputs contributed to specific risk estimates.',
      icon: BarChart2,
    },
    {
      title: 'Model Quality Monitoring',
      category: 'MLOps',
      desc: 'Tracks inference latency, prediction confidence, and service availability across the platform.',
      icon: Layers,
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Technology
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Overview of the machine learning, computer vision, and language models powering HealthMate AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {techStack.map((tech, i) => {
          const Icon = tech.icon;
          return (
            <Card key={i} className="p-5">
              <div className="w-9 h-9 rounded-xl bg-aurora-teal/10 text-aurora-teal flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-semibold text-aurora-teal uppercase tracking-wide mb-1">
                {tech.category}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                {tech.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {tech.desc}
              </p>
            </Card>
          );
        })}
      </div>

      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
        <h4 className="font-bold text-sm mb-1.5 flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
          <ShieldCheck className="w-4 h-4" />
          Clinical Safety Notice
        </h4>
        <p>
          AI predictions are intended for triage assistance and informational guidance only. They do not replace certified medical diagnosis or treatment by licensed healthcare professionals.
        </p>
      </div>
    </div>
  );
}
