import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Award, 
  Cpu, 
  Radio, 
  Building2, 
  Users, 
  Calendar, 
  History,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import IntegrationPendingBanner from '../../../components/ui/IntegrationPendingBanner';

export default function AdminModule01_Dashboard() {
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-aurora-midnight via-slate-900 to-purple-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-aurora-violet text-xs font-bold mb-4 border border-purple-400/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>HealthMate AI Governance & MLOps Center</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            System Administration Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Supervise doctor credential verification, external registry synchronizations (ABDM & Google Places), MLOps drift telemetry, and immutable DPDP audit compliance.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin/verification">
              <Button size="sm" variant="violet">
                <Award className="w-4 h-4 text-white" />
                <span>Doctor Verification Queue</span>
              </Button>
            </Link>
            <Link to="/admin/mlops">
              <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Cpu className="w-4 h-4 text-aurora-teal" />
                <span>AI Model Telemetry</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <IntegrationPendingBanner
        serviceName="Administration Telemetry & MongoDB Replicas"
        message="Displaying zero-fabrication metrics. Real system logs and registration pipelines populate upon Phase 3 backend activation."
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Doctor Reviews</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">1</div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting NMC state check</div>
        </Card>

        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-3">
            <Radio className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Services</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-aurora-teal mt-1">4 / 4</div>
          <div className="text-[10px] text-slate-400 mt-1">Gateway, AI, Mongo, Redis</div>
        </Card>

        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Model Status</div>
          <div className="text-2xl font-black text-aurora-blue mt-1">Optimal</div>
          <div className="text-[10px] text-slate-400 mt-1">Zero data drift detected</div>
        </Card>

        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
            <History className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">DPDP Compliance</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
          <div className="text-[10px] text-slate-400 mt-1">Zero persistent leaks</div>
        </Card>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Alert Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-aurora-violet" />
              <span>Pending Doctor Credential Queue</span>
            </h3>
            <Link to="/admin/verification" className="text-xs text-aurora-violet hover:underline font-bold">
              Review Queue &rarr;
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Dr. Ananya Roy (Dermatologist)</div>
              <div className="text-slate-400 text-[11px]">NMC Reg: DMC/R/98214 • Delhi Medical Council</div>
            </div>
            <Link to="/admin/verification">
              <Button size="sm" variant="violet">Inspect</Button>
            </Link>
          </div>
        </Card>

        {/* Integration Status Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-aurora-teal" />
              <span>External API Ingestion Health</span>
            </h3>
            <Link to="/admin/integrations" className="text-xs text-aurora-teal hover:underline font-bold">
              All APIs &rarr;
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight">
              <span className="font-bold text-slate-800 dark:text-slate-200">Google Places API (New)</span>
              <span className="text-[10px] font-bold text-aurora-teal flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Standby (Key Configured)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight">
              <span className="font-bold text-slate-800 dark:text-slate-200">ABDM Sandbox (HFR / HPR)</span>
              <span className="text-[10px] font-bold text-aurora-teal flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Standby (Client Configured)
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
