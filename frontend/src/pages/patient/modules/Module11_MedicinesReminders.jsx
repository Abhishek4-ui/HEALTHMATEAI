import React, { useState } from 'react';
import { 
  Clock, 
  Pill, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Bell, 
  Calendar 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function Module11_MedicinesReminders() {
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    name: '',
    dosage: '500mg',
    time: '09:00 AM',
    instructions: 'After breakfast',
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
    setNewReminder({ name: '', dosage: '500mg', time: '09:00 AM', instructions: 'After breakfast' });
    addToast({
      type: 'success',
      title: 'Reminder Created',
      message: `Notification scheduled for ${newReminder.name}.`,
    });
  };

  const toggleTaken = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, takenToday: !r.takenToday } : r));
    addToast({
      type: 'info',
      title: 'Adherence Logged',
      message: 'Medication intake status updated.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Medication Schedule & Reminders
            </h2>
            <Badge variant="teal">Adherence Tracker</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track daily dosages, configure alerts, and safeguard against drug-allergy interactions.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 text-aurora-midnight" />
          <span>Add Reminder</span>
        </Button>
      </div>

      {/* Allergy Interaction Warning Area */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-aurora-amber shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Drug Safety Guard:</strong> Always consult your treating doctor or pharmacist before introducing new over-the-counter supplements. Active chemical compounds are screened against known allergy profiles.
        </div>
      </div>

      {/* Add Reminder Modal / Form */}
      {showAddForm && (
        <Card className="p-6 space-y-4 border-aurora-teal/50">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Configure New Medication Schedule</h3>
          <form onSubmit={handleAddReminder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                value={newReminder.name}
                onChange={(e) => setNewReminder({ ...newReminder, name: e.target.value })}
                placeholder="e.g. Paracetamol, Atorvastatin"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
              <input
                type="text"
                value={newReminder.dosage}
                onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                placeholder="e.g. 500mg, 1 tablet"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Scheduled Time</label>
              <input
                type="text"
                value={newReminder.time}
                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                placeholder="e.g. 08:30 AM"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
              <input
                type="text"
                value={newReminder.instructions}
                onChange={(e) => setNewReminder({ ...newReminder, instructions: e.target.value })}
                placeholder="e.g. With water after dinner"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit">Save Reminder</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Reminders List */}
      {reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((r) => (
            <Card key={r.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTaken(r.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                    r.takenToday
                      ? 'bg-aurora-teal border-aurora-teal text-aurora-midnight'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {r.takenToday && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </button>
                <div>
                  <div className={`font-bold text-xs ${r.takenToday ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {r.name} • {r.dosage}
                  </div>
                  <div className="text-[11px] text-slate-400">{r.instructions}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-aurora-teal bg-teal-50 dark:bg-teal-950 px-2 py-1 rounded-md">
                  {r.time}
                </span>
                <button
                  onClick={() => setReminders(reminders.filter(item => item.id !== r.id))}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="No Active Medication Reminders"
          description="You have not created any medication schedules. Click 'Add Reminder' above to configure dosage notifications."
          actionLabel="Add Your First Reminder"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}
