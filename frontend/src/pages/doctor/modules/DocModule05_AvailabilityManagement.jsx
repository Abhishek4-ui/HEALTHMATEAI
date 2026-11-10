import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Save, 
  Trash2, 
  CheckCircle2, 
  IndianRupee 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function DocModule05_AvailabilityManagement() {
  const [slotDuration, setSlotDuration] = useState(20);
  const [fee, setFee] = useState(700);
  const [schedule, setSchedule] = useState([
    { day: 'Monday', enabled: true, start: '09:00', end: '13:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '13:00' },
    { day: 'Wednesday', enabled: true, start: '09:00', end: '13:00' },
    { day: 'Thursday', enabled: true, start: '14:00', end: '18:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '13:00' },
    { day: 'Saturday', enabled: true, start: '10:00', end: '14:00' },
    { day: 'Sunday', enabled: false, start: '09:00', end: '12:00' },
  ]);

  const { addToast } = useToast();

  const handleToggleDay = (index) => {
    const updated = [...schedule];
    updated[index].enabled = !updated[index].enabled;
    setSchedule(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Availability Published',
      message: 'Weekly clinical slot rules saved for patient discovery.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Availability & Hours
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Set consultation hours, session length, and fees.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Global Settings */}
        <Card className="p-6 sm:p-8 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Session Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Slot Duration</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="15">15 Minutes per Consultation</option>
                <option value="20">20 Minutes per Consultation (Standard)</option>
                <option value="30">30 Minutes per Consultation (Detailed)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Consultation Fee (INR ₹)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={fee}
                  onChange={(e) => setFee(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Weekly Day Slots */}
        <Card className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Availability Schedule</h3>
          <div className="space-y-3">
            {schedule.map((item, idx) => (
              <div
                key={item.day}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                  item.enabled
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-aurora-midnight'
                    : 'border-slate-100 dark:border-slate-900 opacity-50 bg-slate-50 dark:bg-aurora-midnight/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => handleToggleDay(idx)}
                    className="rounded border-slate-300 text-aurora-blue focus:ring-aurora-blue"
                  />
                  <span className="font-bold text-slate-900 dark:text-white w-24">{item.day}</span>
                </div>

                {item.enabled ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={item.start}
                      onChange={(e) => {
                        const copy = [...schedule];
                        copy[idx].start = e.target.value;
                        setSchedule(copy);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-navy text-xs text-slate-900 dark:text-white"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={item.end}
                      onChange={(e) => {
                        const copy = [...schedule];
                        copy[idx].end = e.target.value;
                        setSchedule(copy);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-navy text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                ) : (
                  <span className="text-slate-400 font-semibold italic text-[11px]">Clinic Closed</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="blue">
              <Save className="w-4 h-4 text-white" />
              <span>Publish Weekly Availability</span>
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
