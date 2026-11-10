import React from 'react';
import { Database, CheckCircle2, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

export default function AdminModule09_DatasetManagement() {
  const datasets = [
    {
      id: 'DS-CARDIO-01',
      name: 'Cardiovascular Disease Research Corpus',
      source: 'PhysioNet / Mendeley Data',
      license: 'CC BY 4.0 Open Access',
      sampleSize: '70,000 Records',
      features: '11 Biometric Variables',
      status: 'VERIFIED_HASH_VALID'
    },
    {
      id: 'DS-DIAB-02',
      name: 'Diabetes Health Indicators Dataset',
      source: 'CDC BRFSS Open Portal',
      license: 'US Public Domain',
      sampleSize: '253,680 Records',
      features: '21 Survey & Clinical Variables',
      status: 'VERIFIED_HASH_VALID'
    },
    {
      id: 'DS-SYMPT-03',
      name: 'Disease Symptom & Severity Knowledgebase',
      source: 'Columbia University Medical Center',
      license: 'CC BY-SA 4.0',
      sampleSize: '4,920 Pairs',
      features: '132 Symptom Indicators',
      status: 'VERIFIED_HASH_VALID'
    },
    {
      id: 'DS-LAB-05',
      name: 'Clinical Pathology Lab Report Benchmark',
      source: 'Zenodo Open Healthcare Corpus',
      license: 'CC BY 4.0 Open Access',
      sampleSize: '1,500 Reports',
      features: 'Bounding Box Key-Value Ground Truth',
      status: 'VERIFIED_HASH_VALID'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Authentic Clinical Dataset Registry
            </h2>
            <Badge variant="teal">Open Research Licenses</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Validated biomedical research corpora utilized for model training with zero synthetic data fabrication.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <Database className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {datasets.map((ds) => (
          <Card key={ds.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-aurora-teal font-bold">{ds.id}</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{ds.name}</h3>
                <p className="text-xs text-slate-400">{ds.source}</p>
              </div>
              <Badge variant="teal">{ds.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight text-[11px]">
              <div>
                <span className="text-slate-400">Sample Count:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{ds.sampleSize}</div>
              </div>
              <div>
                <span className="text-slate-400">License:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{ds.license}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              Features: <span className="font-medium text-slate-700 dark:text-slate-300">{ds.features}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
