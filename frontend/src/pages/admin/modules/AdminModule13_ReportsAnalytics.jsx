import React from 'react';
import { BarChart2, TrendingUp, MapPin, Users, Activity } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';

export default function AdminModule13_ReportsAnalytics() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Platform Analytics & Population Health Reports
            </h2>
            <Badge variant="violet">Aggregated Telemetry</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High-level epidemiological and clinical utilization trends across Indian states.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center shrink-0">
          <BarChart2 className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Specialty Demand</div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">Cardiology & Dermatology</div>
          <p className="text-[11px] text-slate-500">Based on anonymous triage recommendations</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Geographic Volume</div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">Karnataka & Delhi NCR</div>
          <p className="text-[11px] text-slate-500">Highest active registry queries</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Triage Latency</div>
          <div className="text-base font-extrabold text-aurora-teal">142ms</div>
          <p className="text-[11px] text-slate-500">FastAPI in-memory pipeline</p>
        </Card>
      </div>

      <Card className="p-8">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Anonymized Regional Telehealth Ratios</h3>
        <EmptyState
          icon={Activity}
          title="Telemetry Feed Ready"
          description="Regional consultation volume charts will render dynamically once production load begins in Phase 5."
        />
      </Card>
    </div>
  );
}
