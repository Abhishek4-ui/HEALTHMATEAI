import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  Check, 
  X, 
  RotateCcw, 
  AlertCircle 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function DocModule04_AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const { addToast } = useToast();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Doctor Appointment Management
            </h2>
            <Badge variant="blue">Clinical Roster</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Accept, reschedule, or cancel patient teleconsultations with synchronized calendar updates.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* Appointment Roster */}
      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <Card key={apt.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{apt.patientName}</h4>
                  <p className="text-xs text-slate-400">{apt.date} • {apt.timeSlot}</p>
                </div>
                <Badge variant="blue">{apt.status}</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Reason: {apt.chiefComplaint}</p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No Pending Appointment Requests"
          description="In strict adherence to zero-fabrication rules, fake patient appointments are never generated. Incoming patient bookings will appear here in real-time."
          actionLabel="Configure Availability Hours"
          onAction={() => window.location.href = '/doctor/availability'}
        />
      )}
    </div>
  );
}
