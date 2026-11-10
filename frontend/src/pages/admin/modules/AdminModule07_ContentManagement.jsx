import React from 'react';
import { FileText, Plus, ExternalLink, ShieldCheck } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

export default function AdminModule07_ContentManagement() {
  const clinicalGuidelines = [
    { title: 'Standard Treatment Guidelines - Cardiovascular Health', source: 'MoHFW India', version: 'v3.2', status: 'INDEXED_IN_RAG' },
    { title: 'WHO Essential Medicines List (EML)', source: 'World Health Organization', version: '23rd List', status: 'INDEXED_IN_RAG' },
    { title: 'Telemedicine Practice Guidelines (2020)', source: 'Board of Governors / NMC', version: 'Official Gazetted', status: 'ACTIVE' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Clinical Guidelines
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard treatment guidelines and clinical reference documents.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-4">
        {clinicalGuidelines.map((g, i) => (
          <Card key={i} className="p-5 flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{g.title}</h4>
              <p className="text-slate-400">{g.source} • Version: {g.version}</p>
            </div>
            <Badge variant="teal">{g.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
