import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Activity, 
  Calendar, 
  Search, 
  FileText, 
  ShieldAlert, 
  ArrowRight,
  Clock
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import { useAuth } from '../../../context/AuthContext';

export default function Module01_Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-aurora-midnight via-aurora-navy to-slate-900 text-white border border-slate-800">
        <div className="max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            Welcome, {user?.name || 'Patient'}
          </h2>
          <p className="text-xs text-slate-300 mb-4">
            Health data is kept in temporary memory during your session. Use Forget Me anytime to clear it.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/patient/ai-assistant">
              <Button size="sm" variant="primary">
                <Bot className="w-3.5 h-3.5 text-aurora-midnight" />
                <span>AI Assistant</span>
              </Button>
            </Link>
            <Link to="/patient/symptom-checker">
              <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Activity className="w-3.5 h-3.5 text-aurora-teal" />
                <span>Check Symptoms</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/patient/ai-assistant">
          <Card className="p-4 hover:border-aurora-teal/50 transition-colors h-full">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-2">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white mb-0.5">AI Assistant</h3>
            <p className="text-[11px] text-slate-500">Ask health questions in Hindi or English.</p>
          </Card>
        </Link>

        <Link to="/patient/reports">
          <Card className="p-4 hover:border-aurora-violet/50 transition-colors h-full">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center mb-2">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white mb-0.5">Analyze Reports</h3>
            <p className="text-[11px] text-slate-500">Upload lab tests to review normal ranges.</p>
          </Card>
        </Link>

        <Link to="/patient/doctors">
          <Card className="p-4 hover:border-aurora-blue/50 transition-colors h-full">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center mb-2">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white mb-0.5">Find Doctors</h3>
            <p className="text-[11px] text-slate-500">Search verified doctors and clinics.</p>
          </Card>
        </Link>

        <Link to="/patient/emergency">
          <Card className="p-4 hover:border-aurora-red/50 transition-colors h-full">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-aurora-red flex items-center justify-center mb-2">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white mb-0.5">Emergency SOS</h3>
            <p className="text-[11px] text-slate-500">Dial 112 & find nearby emergency centers.</p>
          </Card>
        </Link>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Appointments Section */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-aurora-blue" />
              <span>Upcoming Appointments</span>
            </h3>
            <Link to="/patient/appointments" className="text-xs text-aurora-teal hover:underline font-semibold">
              View All
            </Link>
          </div>

          <EmptyState
            icon={Calendar}
            title="No appointments scheduled"
            description="Book a consultation with a verified doctor."
            actionLabel="Find Doctors"
            onAction={() => window.location.href = '/patient/doctors'}
          />
        </Card>

        {/* Health Monitoring Snapshot */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-aurora-teal" />
              <span>Health Readings</span>
            </h3>
            <Link to="/patient/health-metrics" className="text-xs text-aurora-teal hover:underline font-semibold">
              Open Tracker
            </Link>
          </div>

          <EmptyState
            icon={Activity}
            title="No readings logged"
            description="Track your blood pressure, glucose, and heart rate."
            actionLabel="Log Reading"
            onAction={() => window.location.href = '/patient/health-metrics'}
          />
        </Card>
      </div>
    </div>
  );
}
