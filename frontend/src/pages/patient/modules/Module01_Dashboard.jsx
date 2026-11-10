import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Activity, 
  Calendar, 
  Search, 
  FileText, 
  Clock, 
  ShieldAlert, 
  Lock, 
  ArrowRight,
  Heart,
  Pill,
  Sparkles
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import IntegrationPendingBanner from '../../../components/ui/IntegrationPendingBanner';
import { useAuth } from '../../../context/AuthContext';

export default function Module01_Dashboard() {
  const { user, guestSession } = useAuth();

  return (
    <div className="space-y-8">
      {/* Personalized Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-aurora-midnight via-aurora-navy to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aurora-teal/15 text-aurora-teal text-xs font-bold mb-4 border border-aurora-teal/30">
            <Lock className="w-3.5 h-3.5" />
            <span>Active Ephemeral Session: {guestSession?.id || 'GUEST_ACTIVE'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Welcome, {user?.name || 'Patient'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            HealthMate AI provides privacy-first healthcare triage and clinical connections. Your personal symptom inputs remain strictly temporary in Redis cache unless explicitly saved.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/patient/copilot">
              <Button size="sm" variant="primary">
                <Bot className="w-4 h-4 text-aurora-midnight" />
                <span>Open AI Health Copilot</span>
              </Button>
            </Link>
            <Link to="/patient/symptoms">
              <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Activity className="w-4 h-4 text-aurora-teal" />
                <span>Check Symptoms</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <IntegrationPendingBanner
        serviceName="MongoDB & Redis Live Feeds"
        message="Displaying zero-fabrication state. Real clinical records populate upon Phase 3 backend and Phase 5 integration."
      />

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/patient/copilot" className="group">
          <Card className="p-5 hover:border-aurora-teal/50 transition-all h-full">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">AI Copilot</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Multilingual health consultation in English & Hindi.</p>
          </Card>
        </Link>

        <Link to="/patient/reports" className="group">
          <Card className="p-5 hover:border-aurora-violet/50 transition-all h-full">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Report OCR</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Extract biomarkers from lab reports via PaddleOCR.</p>
          </Card>
        </Link>

        <Link to="/patient/doctors" className="group">
          <Card className="p-5 hover:border-aurora-blue/50 transition-all h-full">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Discover Doctors</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Search India-wide and nearby NMC-verified physicians.</p>
          </Card>
        </Link>

        <Link to="/patient/emergency" className="group">
          <Card className="p-5 hover:border-aurora-red/50 transition-all h-full">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-aurora-red flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Emergency SOS</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">National helpline 112 routing & nearest hospitals.</p>
          </Card>
        </Link>
      </div>

      {/* Two Column Section: Upcoming Appointments & Recent Ephemeral Session Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-aurora-blue" />
              <span>Upcoming Consultations</span>
            </h3>
            <Link to="/patient/appointments" className="text-xs text-aurora-teal hover:underline font-bold">
              View All
            </Link>
          </div>

          <EmptyState
            icon={Calendar}
            title="No Scheduled Appointments"
            description="You have no upcoming doctor teleconsultations booked. Search verified doctors to schedule a consultation."
            actionLabel="Discover Doctors"
            onAction={() => window.location.href = '/patient/doctors'}
          />
        </Card>

        {/* Health Monitoring Snapshot */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-aurora-teal" />
              <span>Vital Readings Snapshot</span>
            </h3>
            <Link to="/patient/vitals" className="text-xs text-aurora-teal hover:underline font-bold">
              Open Tracker
            </Link>
          </div>

          <EmptyState
            icon={Activity}
            title="No Vitals Logged Today"
            description="Blood pressure, heart rate, and glucose metrics are only tracked upon patient submission and are never simulated."
            actionLabel="Log New Reading"
            onAction={() => window.location.href = '/patient/vitals'}
          />
        </Card>
      </div>
    </div>
  );
}
