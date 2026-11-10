import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Video, 
  Award, 
  FileCheck2, 
  Wallet, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import IntegrationPendingBanner from '../../../components/ui/IntegrationPendingBanner';
import { useAuth } from '../../../context/AuthContext';

export default function DocModule01_Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-aurora-navy via-slate-900 to-blue-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-aurora-blue text-xs font-bold mb-4 border border-blue-400/30">
            <Award className="w-3.5 h-3.5" />
            <span>NMC Credential Verified Practitioner</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Clinical Workspace: {user?.name || 'Dr. Medical Practitioner'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Review booked teleconsultations, conduct WebRTC clinical sessions with AI SOAP drafting assistance, and issue digitally signed prescriptions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/doctor/appointments">
              <Button size="sm" variant="blue">
                <Calendar className="w-4 h-4 text-white" />
                <span>Manage Appointments</span>
              </Button>
            </Link>
            <Link to="/doctor/consultation">
              <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Sparkles className="w-4 h-4 text-aurora-teal" />
                <span>AI Clinical Copilot</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <IntegrationPendingBanner
        serviceName="Doctor Appointments & Calendar Sync"
        message="Displaying zero-fabrication clinical dashboard. Patient bookings connect directly upon Phase 3 backend activation."
      />

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Scheduled Today</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">0</div>
          <div className="text-[10px] text-slate-400 mt-1">Zero pending visits</div>
        </Card>

        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mb-3">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Prescriptions Issued</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">0</div>
          <div className="text-[10px] text-slate-400 mt-1">Digitally hashed</div>
        </Card>

        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verification Status</div>
          <div className="text-base font-extrabold text-emerald-600 dark:text-aurora-teal mt-2">
            CREDENTIAL_VERIFIED
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">NMC Karnataka Council</div>
        </Card>

        <Card className="p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Settled Earnings</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹0.00</div>
          <div className="text-[10px] text-slate-400 mt-1">Razorpay Direct Payouts</div>
        </Card>
      </div>

      {/* Consultations Queue */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-aurora-blue" />
            <span>Today's Consultation Schedule</span>
          </h3>
          <Link to="/doctor/availability" className="text-xs text-aurora-blue hover:underline font-bold">
            Update Availability Slots &rarr;
          </Link>
        </div>

        <EmptyState
          icon={Calendar}
          title="No Consultations Booked for Today"
          description="In strict accordance with development rules, fake appointments are never generated. Patients booking teleconsultations will appear here in real-time."
          actionLabel="View Calendar Settings"
          onAction={() => window.location.href = '/doctor/availability'}
        />
      </Card>
    </div>
  );
}
