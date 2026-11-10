import React, { useState } from 'react';
import { Calendar, Search, CheckCircle2, RotateCcw } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';

export default function AdminModule06_AppointmentMonitoring() {
  const [appointments, setAppointments] = useState([]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Appointments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global consultation bookings and telehealth status.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {appointments.length > 0 ? (
        <Card className="p-6">
          {/* Table */}
        </Card>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No active appointments"
          description="Appointments scheduled across the platform will appear here."
        />
      )}
    </div>
  );
}
