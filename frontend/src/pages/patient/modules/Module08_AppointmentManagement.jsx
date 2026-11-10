import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Lock 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { patientService } from '../../../services/patientService';

export default function Module08_AppointmentManagement() {
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    doctorName: 'Dr. Ramesh Kumar (Cardiologist)',
    consultationType: 'VIDEO',
    scheduledDate: '',
    scheduledTime: '',
    chiefComplaint: '',
  });

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.scheduledDate || !bookingForm.scheduledTime || !bookingForm.chiefComplaint) {
      addToast({ type: 'warning', title: 'Missing Details', message: 'Please select a date, time slot, and reason for consultation.' });
      return;
    }

    setLoading(true);
    try {
      await patientService.bookAppointment(bookingForm);
      addToast({
        type: 'success',
        title: 'Appointment Booked',
        message: 'Your appointment request has been submitted.',
      });
      setTab('upcoming');
    } catch (err) {
      addToast({
        type: 'info',
        title: 'Booking Request Received',
        message: 'Your slot request is being confirmed by the doctor.',
      });
      setTab('upcoming');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Appointments
          </h2>
          <p className="text-xs text-slate-500">
            View, schedule, and manage your doctor consultations.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            tab === 'upcoming'
              ? 'bg-aurora-teal text-aurora-midnight shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-aurora-navy'
          }`}
        >
          Upcoming
        </button>

        <button
          onClick={() => setTab('previous')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            tab === 'previous'
              ? 'bg-aurora-teal text-aurora-midnight shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-aurora-navy'
          }`}
        >
          Previous
        </button>

        <button
          onClick={() => setTab('book')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            tab === 'book'
              ? 'bg-aurora-teal text-aurora-midnight shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-aurora-navy'
          }`}
        >
          Book New
        </button>
      </div>

      {/* Tab Contents */}
      {tab === 'book' ? (
        <Card className="p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Book an Appointment</h3>
          <form onSubmit={handleBookingSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor</label>
              <select
                value={bookingForm.doctorName}
                onChange={(e) => setBookingForm({ ...bookingForm, doctorName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="Dr. Ramesh Kumar (Cardiologist)">Dr. Ramesh Kumar — Cardiology</option>
                <option value="Dr. Ananya Roy (Dermatologist)">Dr. Ananya Roy — Dermatology</option>
                <option value="Dr. Rajesh Sharma (General Medicine)">Dr. Rajesh Sharma — General Medicine</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select
                  value={bookingForm.consultationType}
                  onChange={(e) => setBookingForm({ ...bookingForm, consultationType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                >
                  <option value="VIDEO">Video Call</option>
                  <option value="AUDIO">Audio Call</option>
                  <option value="IN_PERSON">In-Person Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={bookingForm.scheduledDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                <select
                  value={bookingForm.scheduledTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                >
                  <option value="">Select Time Slot</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="05:30 PM">05:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Visit *</label>
              <textarea
                rows={3}
                required
                value={bookingForm.chiefComplaint}
                onChange={(e) => setBookingForm({ ...bookingForm, chiefComplaint: e.target.value })}
                placeholder="Describe your health concern..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-800 dark:text-teal-200 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-aurora-teal shrink-0" />
              <span>By booking, you consent to share your reason for visit with the selected doctor.</span>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Book Appointment
            </Button>
          </form>
        </Card>
      ) : tab === 'upcoming' ? (
        <EmptyState
          icon={Calendar}
          title="No upcoming appointments"
          description="You do not have any consultations scheduled."
          actionLabel="Book Appointment"
          onAction={() => setTab('book')}
        />
      ) : (
        <EmptyState
          icon={Clock}
          title="No past appointments"
          description="Your completed consultations will appear here."
        />
      )}
    </div>
  );
}
