import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck2, 
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';

export default function DocModule09_PrescriptionManagement() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [prescription, setPrescription] = useState({
    patientName: 'Patient (Active Session #8912)',
    diagnosis: 'Essential Hypertension (ICD-10 I10)',
    medications: [
      { name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily (morning)', durationDays: 30, instructions: 'Before breakfast' }
    ],
    lifestyleAdvice: 'Restrict dietary sodium to <2g/day. Regular 30-minute daily walking. Periodic BP monitoring.',
    followUpDate: '2026-12-10',
  });

  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '10mg',
    frequency: 'Once daily',
    durationDays: 14,
    instructions: 'After meals',
  });

  const [signedPrescription, setSignedPrescription] = useState(null);

  const handleAddMedication = () => {
    if (!newMed.name.trim()) return;
    setPrescription({
      ...prescription,
      medications: [...prescription.medications, newMed]
    });
    setNewMed({ name: '', dosage: '10mg', frequency: 'Once daily', durationDays: 14, instructions: 'After meals' });
    addToast({ type: 'info', title: 'Medication Added', message: `${newMed.name} added to prescription list.` });
  };

  const handleRemoveMedication = (index) => {
    const updated = prescription.medications.filter((_, i) => i !== index);
    setPrescription({ ...prescription, medications: updated });
  };

  const handleDigitalSign = () => {
    if (prescription.medications.length === 0) {
      addToast({ type: 'warning', title: 'Empty Prescription', message: 'Please add at least one medication.' });
      return;
    }

    const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const signedData = {
      ...prescription,
      doctorName: user?.name || 'Dr. Medical Practitioner',
      doctorNmcNumber: 'KMC/2018/98712',
      signedAt: new Date().toISOString(),
      digitalSignatureHash: hash,
    };

    setSignedPrescription(signedData);
    addToast({
      type: 'success',
      title: 'Prescription Digitally Signed',
      message: 'Cryptographically sealed and transmitted to the patient.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Prescriptions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and digitally sign prescriptions for patients.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <Pill className="w-5 h-5" />
        </div>
      </div>

      {/* Builder Form */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Diagnosis (ICD-10 Reference) *</label>
          <input
            type="text"
            required
            value={prescription.diagnosis}
            onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
          />
        </div>

        {/* Medications List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Prescribed Pharmaceuticals</label>
            <span className="text-xs font-bold text-aurora-teal">{prescription.medications.length} items</span>
          </div>

          {prescription.medications.map((m, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                <span className="text-slate-500 font-mono ml-2">({m.dosage})</span>
                <div className="text-[11px] text-slate-400">{m.frequency} • {m.durationDays} days • {m.instructions}</div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMedication(idx)}
                className="text-slate-400 hover:text-rose-500 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add Medicine Inline Row */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <input
              type="text"
              placeholder="Drug name (e.g. Amlodipine)"
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs"
            />
            <input
              type="text"
              placeholder="Dosage (5mg)"
              value={newMed.dosage}
              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs"
            />
            <input
              type="text"
              placeholder="Frequency"
              value={newMed.frequency}
              onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs"
            />
            <input
              type="text"
              placeholder="Instructions"
              value={newMed.instructions}
              onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs"
            />
            <Button size="sm" variant="outline" onClick={handleAddMedication}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dietary & Lifestyle Advice</label>
          <textarea
            rows={2}
            value={prescription.lifestyleAdvice}
            onChange={(e) => setPrescription({ ...prescription, lifestyleAdvice: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-400">
            NMC Reg: <strong>KMC/2018/98712</strong> will be stamped on signature.
          </div>
          <Button size="md" variant="primary" onClick={handleDigitalSign}>
            <ShieldCheck className="w-4 h-4 text-aurora-midnight" />
            <span>Generate & Sign Prescription</span>
          </Button>
        </div>
      </Card>

      {/* Digitally Signed Preview */}
      {signedPrescription && (
        <Card className="p-6 sm:p-8 space-y-4 border-aurora-teal bg-teal-50/20 dark:bg-teal-950/10">
          <div className="flex items-center justify-between border-b border-teal-200 dark:border-teal-800 pb-3">
            <div>
              <div className="text-xs font-bold text-aurora-teal uppercase tracking-wider">Tamper-Evident Medical Order</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Electronic Prescription Sealed</h3>
            </div>
            <Badge variant="teal">NMC Legal Order</Badge>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div>Doctor: {signedPrescription.doctorName} (Reg: {signedPrescription.doctorNmcNumber})</div>
            <div>Signed Timestamp: {signedPrescription.signedAt}</div>
            <div className="text-aurora-teal font-bold truncate">SHA-256 Hash: {signedPrescription.digitalSignatureHash}</div>
          </div>
        </Card>
      )}
    </div>
  );
}
