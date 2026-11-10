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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Appointments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View and manage patient appointments and consultation bookings.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
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
          title="No appointments"
          description="Upcoming appointments will appear here."
          actionLabel="Set Availability"
          onAction={() => window.location.href = '/doctor/availability'}
        />
      )}
    </div>
  );
}
