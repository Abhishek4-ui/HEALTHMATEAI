import React, { useState } from 'react';
import { 
  Clock, 
  Pill, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function Module11_MedicinesReminders() {
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    name: '',
    dosage: '500mg',
    time: '09:00 AM',
    instructions: 'After meal',
  });
  const { addToast } = useToast();

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newReminder.name.trim()) return;

    setReminders(prev => [
      ...prev,
      {
        id: 'rem_' + Date.now(),
        ...newReminder,
        takenToday: false,
      }
    ]);
    setShowAddForm(false);
    setNewReminder({ name: '', dosage: '500mg', time: '09:00 AM', instructions: 'After meal' });
    addToast({
      type: 'success',
      title: 'Reminder Added',
      message: `Reminder set for ${newReminder.name}.`,
    });
  };

  const toggleTaken = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, takenToday: !r.takenToday } : r));
  };

  const removeReminder = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Medicines & Reminders
          </h2>
          <p className="text-xs text-slate-500">
            Track daily medications and set reminders.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-3.5 h-3.5 text-aurora-midnight" />
          <span>Add Reminder</span>
        </Button>
      </div>

      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-aurora-amber shrink-0" />
        <span>Always verify dosages with your doctor or pharmacist.</span>
      </div>

      {showAddForm && (
        <Card className="p-5 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">New Medication Reminder</h3>
          <form onSubmit={handleAddReminder} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={newReminder.name}
                  onChange={(e) => setNewReminder({ ...newReminder, name: e.target.value })}
                  placeholder="e.g. Paracetamol"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                <input
                  type="text"
                  value={newReminder.dosage}
                  onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                  placeholder="e.g. 500mg, 1 tablet"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                <input
                  type="text"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  placeholder="e.g. 09:00 AM"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
                <input
                  type="text"
                  value={newReminder.instructions}
                  onChange={(e) => setNewReminder({ ...newReminder, instructions: e.target.value })}
                  placeholder="e.g. After meal"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="outline" type="button" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Save Reminder
              </Button>
            </div>
          </form>
        </Card>
      )}

      {reminders.length > 0 ? (
        <div className="space-y-2.5">
          {reminders.map((rem) => (
            <Card key={rem.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTaken(rem.id)}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                    rem.takenToday
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-700 hover:border-aurora-teal'
                  }`}
                  title={rem.takenToday ? 'Mark as pending' : 'Mark as taken'}
                >
                  {rem.takenToday && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <div>
                  <div className={`font-semibold text-xs ${rem.takenToday ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {rem.name} • {rem.dosage}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{rem.time} • {rem.instructions}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeReminder(rem.id)}
                className="text-slate-400 hover:text-rose-500 p-1"
                title="Delete Reminder"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Pill}
          title="No medicine reminders"
          description="Click Add Reminder to schedule your daily medicines."
          actionLabel="Add Reminder"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}
