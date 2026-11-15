import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Activity, 
  Calendar, 
  Search, 
  FileText, 
  ShieldAlert, 
  ArrowRight,
  Clock,
  Sparkles,
  HeartPulse,
  User,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  UploadCloud,
  Scan,
  Heart,
  Pill,
  Camera
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useAuth } from '../../../context/AuthContext';
import { patientService } from '../../../services/patientService';

export default function Module01_Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [apptsRes, vitalsRes] = await Promise.allSettled([
          patientService.getAppointments(),
          patientService.getVitals()
        ]);

        if (apptsRes.status === 'fulfilled') {
          const list = apptsRes.value?.data?.appointments || apptsRes.value?.data || [];
          setAppointments(Array.isArray(list) ? list.slice(0, 3) : []);
        }

        if (vitalsRes.status === 'fulfilled') {
          const data = vitalsRes.value?.data || vitalsRes.value;
          if (data && (data.heartRate || data.bloodPressure || data.glucose)) {
            setVitals(data);
          }
        }
      } catch (err) {
        // Fallback to empty states
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome & Patient Profile Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 text-white border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Verified Patient Account</span>
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-400">ID: {user?.id ? user.id.slice(0, 8) + '...' : 'PT-ACTIVE'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome, {user?.name || user?.fullName || 'Patient'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access your medical records, run clinical AI screenings, and consult with accredited healthcare providers across India.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link to="/patient/ai-assistant">
              <Button size="sm" variant="primary">
                <Bot className="w-3.5 h-3.5 text-slate-950" />
                <span>AI Assistant</span>
              </Button>
            </Link>
            <Link to="/patient/symptom-checker">
              <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Check Symptoms</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Quick Access Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Link to="/patient/ai-assistant" className="group">
          <Card className="p-4 hover:border-teal-500/50 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1">AI Assistant</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Ask clinical health questions with bilingual support.</p>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-teal-600 dark:text-teal-400">
              <span>Start Consultation</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </div>
          </Card>
        </Link>

        <Link to="/patient/symptom-checker" className="group">
          <Card className="p-4 hover:border-cyan-500/50 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1">Symptom Checker</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Multi-factor triage, red-flag screening, and guidance.</p>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
              <span>Check Symptoms</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </div>
          </Card>
        </Link>

        <Link to="/patient/doctors" className="group">
          <Card className="p-4 hover:border-blue-500/50 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1">Find Doctors & Care</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">All-India registered doctors, clinics & hospitals.</p>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <span>Search Providers</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </div>
          </Card>
        </Link>

        <Link to="/patient/emergency" className="group">
          <Card className="p-4 hover:border-rose-500/50 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1">Emergency SOS</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Direct 112 ambulance response & trauma network.</p>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <span>Emergency Center</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Quick Universal Upload Hub Banner */}
      <Card className="p-5 border-teal-500/30 bg-gradient-to-r from-teal-950/20 via-slate-900/40 to-slate-850">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Universal Medical Document & Scan Ingestion</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quickly digitize documents using device upload, live camera capture, or document scanning filters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link to="/patient/imaging">
              <Button size="sm" variant="outline" className="text-xs border-teal-500/40 hover:bg-teal-500/10">
                <Scan className="w-3.5 h-3.5 text-teal-500 mr-1" />
                <span>Radiology & X-Ray</span>
              </Button>
            </Link>
            <Link to="/patient/reports">
              <Button size="sm" variant="outline" className="text-xs border-purple-500/40 hover:bg-purple-500/10">
                <FileText className="w-3.5 h-3.5 text-purple-400 mr-1" />
                <span>Lab Report OCR</span>
              </Button>
            </Link>
            <Link to="/patient/cardiac-ecg">
              <Button size="sm" variant="outline" className="text-xs border-rose-500/40 hover:bg-rose-500/10">
                <Heart className="w-3.5 h-3.5 text-rose-500 mr-1" />
                <span>ECG Rhythm</span>
              </Button>
            </Link>
            <Link to="/patient/prescriptions">
              <Button size="sm" variant="outline" className="text-xs border-amber-500/40 hover:bg-amber-500/10">
                <Pill className="w-3.5 h-3.5 text-amber-500 mr-1" />
                <span>Scan Prescription</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Appointments Section */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Appointments</span>
            </h3>
            <Link to="/patient/appointments" className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1">
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {appointments.length > 0 ? (
            <div className="space-y-2.5">
              {appointments.map((appt) => (
                <div key={appt._id || appt.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Dr. {appt.doctorId?.fullName || 'Specialist Consultation'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {appt.scheduledDate ? new Date(appt.scheduledDate).toDateString() : 'Upcoming'} • {appt.timeSlot}
                    </p>
                  </div>
                  <Badge variant={appt.status === 'CONFIRMED' ? 'teal' : 'amber'} className="text-[10px]">
                    {appt.status || 'SCHEDULED'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No appointments scheduled"
              description="Book a verified teleconsultation or clinic visit with a registered doctor."
              actionLabel="Book Consultation"
              onAction={() => window.location.href = '/patient/appointments'}
            />
          )}
        </Card>

        {/* Recent Medical Reports Section */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Recent Medical Reports</span>
            </h3>
            <Link to="/patient/reports" className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <EmptyState
            icon={FileText}
            title="No medical reports uploaded"
            description="Upload laboratory tests or diagnostic scans for automated LOINC biomarker extraction."
            actionLabel="Upload Report"
            onAction={() => window.location.href = '/patient/reports'}
          />
        </Card>

        {/* Health Readings Section */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Health Readings</span>
            </h3>
            <Link to="/patient/health-metrics" className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1">
              <span>Open Tracker</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {vitals ? (
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Heart Rate</span>
                <p className="text-sm font-bold text-rose-600 mt-1">{vitals.heartRate || '--'} bpm</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Blood Pressure</span>
                <p className="text-sm font-bold text-blue-600 mt-1">{vitals.bloodPressure || '--'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Blood Glucose</span>
                <p className="text-sm font-bold text-teal-600 mt-1">{vitals.glucose || '--'} mg/dL</p>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No readings logged"
              description="Record your blood pressure, heart rate, or blood glucose to monitor health trends."
              actionLabel="Log First Reading"
              onAction={() => window.location.href = '/patient/health-metrics'}
            />
          )}
        </Card>

        {/* Quick Diagnostic Screening Copilot */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>AI Health Screening</span>
            </h3>
            <Link to="/patient/ai-assistant" className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1">
              <span>Open Chat</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/30 space-y-3">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Have a clinical question or experiencing symptoms? Our AI clinical copilot provides preliminary triage and specialist referral guidance.
            </p>
            <div className="flex items-center gap-2">
              <Link to="/patient/ai-assistant" className="flex-1">
                <Button size="sm" variant="primary" className="w-full justify-center">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask Clinical Question</span>
                </Button>
              </Link>
              <Link to="/patient/cardiac-ecg">
                <Button size="sm" variant="outline">
                  <span>ECG Scan</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}