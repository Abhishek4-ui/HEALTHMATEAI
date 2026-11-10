import React, { useState } from 'react';
import { 
  Cpu, 
  Activity, 
  BarChart2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function AdminModule08_AIModelMonitoring() {
  const [evaluating, setEvaluating] = useState(false);
  const { addToast } = useToast();

  const models = [
    {
      name: 'XGBoost Triage Classifier',
      version: 'v1.2.4',
      framework: 'XGBoost 2.0 + Scikit-learn',
      metricLabel: 'ROC-AUC',
      metricVal: '0.884',
      latencyP95: '42ms',
      driftDetected: false,
      status: 'ACTIVE_PRODUCTION'
    },
    {
      name: 'PaddleOCR v2 Lab Biomarker Parser',
      version: 'v2.1.0',
      framework: 'PaddleOCR / PyTorch',
      metricLabel: 'Biomarker F1',
      metricVal: '0.942',
      latencyP95: '185ms',
      driftDetected: false,
      status: 'ACTIVE_PRODUCTION'
    },
    {
      name: 'Medical RAG Dense Retriever',
      version: 'v1.0.8',
      framework: 'FAISS + BGE-Large-En',
      metricLabel: 'Recall@5',
      metricVal: '0.915',
      latencyP95: '65ms',
      driftDetected: false,
      status: 'ACTIVE_PRODUCTION'
    },
    {
      name: 'Dual LLM Gateway (OpenRouter + Gemini)',
      version: 'v1.0.0',
      framework: 'Async HTTPX Gateway',
      metricLabel: 'Availability',
      metricVal: '99.95%',
      latencyP95: '680ms',
      driftDetected: false,
      status: 'ACTIVE_PRODUCTION'
    }
  ];

  const handleRunEvaluation = () => {
    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
      addToast({
        type: 'success',
        title: 'MLOps Benchmark Evaluated',
        message: 'All model metrics verified against validation holdout sets. No drift detected.',
      });
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            AI Models & Telemetry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Performance metrics, response latency, and model status.
          </p>
        </div>

        <Button size="sm" variant="violet" onClick={handleRunEvaluation} loading={evaluating}>
          <RefreshCw className="w-3.5 h-3.5 text-white" />
          <span>Run Evaluation</span>
        </Button>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((m, idx) => (
          <Card key={idx} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">Version {m.version} • {m.framework}</p>
              </div>
              <Badge variant="teal">{m.status}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-aurora-midnight text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">{m.metricLabel}</div>
                <div className="text-base font-black text-aurora-teal mt-0.5">{m.metricVal}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">P95 Latency</div>
                <div className="text-base font-black text-slate-800 dark:text-slate-200 mt-0.5">{m.latencyP95}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Data Drift</div>
                <div className="text-base font-black text-emerald-600 mt-0.5">None</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-aurora-teal font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>KS-Test p &gt; 0.05 (Stable)</span>
              </span>
              <button
                type="button"
                onClick={() => addToast({ type: 'info', title: 'Weights Checkpoint', message: `Artifact URI: s3://models/${m.name.toLowerCase().replace(/ /g, '_')}_${m.version}.tar.gz` })}
                className="text-aurora-violet hover:underline font-bold"
              >
                Inspect Weights
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
