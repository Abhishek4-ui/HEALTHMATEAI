import React from 'react';
import { BarChart2, TrendingUp, MapPin, Users, Activity } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';

export default function AdminModule13_ReportsAnalytics() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Specialty demand and regional utilization metrics.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center shrink-0">
          <BarChart2 className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Specialty Demand</div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">Cardiology & Dermatology</div>
          <p className="text-[11px] text-slate-500">Based on triage inquiries</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Regions</div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">Karnataka & Delhi NCR</div>
          <p className="text-[11px] text-slate-500">Active discovery queries</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Triage Latency</div>
          <div className="text-base font-extrabold text-aurora-teal">142ms</div>
          <p className="text-[11px] text-slate-500">Average response</p>
        </Card>
      </div>

      <Card className="p-8">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Regional Telehealth Distribution</h3>
        <EmptyState
          icon={Activity}
          title="No regional data yet"
          description="Regional consultation volume charts will appear as patient consultations are recorded."
        />
      </Card>
    </div>
  );
}
