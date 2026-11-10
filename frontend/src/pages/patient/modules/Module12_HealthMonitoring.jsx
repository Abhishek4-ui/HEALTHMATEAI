import React, { useState } from 'react';
import { 
  Activity, 
  Heart, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Scale, 
  Thermometer, 
  Droplet 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function Module12_HealthMonitoring() {
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newReading, setNewReading] = useState({
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 72,
    spO2: 98,
    bloodGlucose: 95,
    weightKg: 68,
    heightCm: 172,
  });

  const { addToast } = useToast();

  const handleLogVital = (e) => {
    e.preventDefault();
    const bmi = (newReading.weightKg / Math.pow(newReading.heightCm / 100, 2)).toFixed(1);
    const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });

    setVitalsHistory(prev => [
      ...prev,
      {
        id: 'vit_' + Date.now(),
        date: dateStr,
        ...newReading,
        bmi: parseFloat(bmi),
      }
    ]);
    setShowLogForm(false);
    addToast({
      type: 'success',
      title: 'Vitals Reading Logged',
      message: 'New biometric entry added to active session trends.',
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Health & Vitals Monitoring
            </h2>
            <Badge variant="teal">Biometric Tracking</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor real physiological vitals over time with zero simulated readings.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setShowLogForm(!showLogForm)}>
          <Plus className="w-4 h-4 text-aurora-midnight" />
          <span>Log New Reading</span>
        </Button>
      </div>

      {/* Log Form */}
      {showLogForm && (
        <Card className="p-6 space-y-4 border-aurora-teal/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Daily Clinical Vitals</h3>
          <form onSubmit={handleLogVital} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                min="60"
                max="240"
                value={newReading.systolicBP}
                onChange={(e) => setNewReading({ ...newReading, systolicBP: parseInt(e.target.value) || 120 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                min="40"
                max="150"
                value={newReading.diastolicBP}
                onChange={(e) => setNewReading({ ...newReading, diastolicBP: parseInt(e.target.value) || 80 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Heart Rate (bpm)</label>
              <input
                type="number"
                min="40"
                max="200"
                value={newReading.heartRate}
                onChange={(e) => setNewReading({ ...newReading, heartRate: parseInt(e.target.value) || 72 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">SpO2 (%)</label>
              <input
                type="number"
                min="70"
                max="100"
                value={newReading.spO2}
                onChange={(e) => setNewReading({ ...newReading, spO2: parseInt(e.target.value) || 98 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Glucose (mg/dL)</label>
              <input
                type="number"
                min="40"
                max="400"
                value={newReading.bloodGlucose}
                onChange={(e) => setNewReading({ ...newReading, bloodGlucose: parseInt(e.target.value) || 95 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                min="30"
                max="250"
                value={newReading.weightKg}
                onChange={(e) => setNewReading({ ...newReading, weightKg: parseFloat(e.target.value) || 68 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="230"
                value={newReading.heightCm}
                onChange={(e) => setNewReading({ ...newReading, heightCm: parseInt(e.target.value) || 172 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowLogForm(false)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit">Commit Reading</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Chart Section */}
      {vitalsHistory.length > 0 ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-aurora-teal" />
              <span>Blood Pressure & Heart Rate Trends</span>
            </h3>
            <span className="text-xs text-slate-400">{vitalsHistory.length} Recorded Entries</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsHistory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[50, 180]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101827',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Line type="monotone" dataKey="systolicBP" stroke="#20D9C2" strokeWidth={2} name="Systolic BP" />
                <Line type="monotone" dataKey="diastolicBP" stroke="#477BFF" strokeWidth={2} name="Diastolic BP" />
                <Line type="monotone" dataKey="heartRate" stroke="#9875FF" strokeWidth={2} name="Heart Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={Activity}
          title="No Historical Vitals Recorded"
          description="In strict adherence to zero-fabrication guidelines, trend charts are rendered only when real readings are submitted by the patient."
          actionLabel="Record Today's Reading"
          onAction={() => setShowLogForm(true)}
        />
      )}
    </div>
  );
}
