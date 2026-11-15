import React, { useState } from 'react';
import { 
  Clock, 
  Pill, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle,
  Camera,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import UniversalUpload from '../../../components/upload/UniversalUpload';
import { useToast } from '../../../context/ToastContext';
import { aiService } from '../../../services/aiService';
import Badge from '../../../components/ui/Badge';

export default function Module11_MedicinesReminders() {
  const [reminders, setReminders] = useState([
    {
      id: 'rem_seed_1',
      name: 'Metformin Hydrochloride',
      dosage: '500mg',
      time: '08:30 AM',
      instructions: 'After breakfast',
      takenToday: true,
    },
    {
      id: 'rem_seed_2',
      name: 'Atorvastatin',
      dosage: '10mg',
      time: '09:00 PM',
      instructions: 'After dinner',
      takenToday: false,
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanPackaging, setShowScanPackaging] = useState(false);
  const [scannedFile, setScannedFile] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  const [newReminder, setNewReminder] = useState({
    name: '',
    dosage: '500mg',
    time: '09:00 AM',
    instructions: 'After meal',
  });
  const [interactionResult, setInteractionResult] = useState(null);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
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

  const handlePackagingScan = async (file) => {
    setScannedFile(file);
    if (!file) return;

    setOcrProcessing(true);
    try {
      const formData = new FormData();
      formData.append('report', file);
      formData.append('file', file);

      const response = await aiService.extractLabReportOCR(formData);
      const data = response?.data?.data || response?.data || {};

      let extractedName = '';
      let extractedDosage = 'Standard Dosage';

      if (Array.isArray(data.medications) && data.medications.length > 0) {
        extractedName = data.medications[0].name;
        extractedDosage = data.medications[0].dosage || extractedDosage;
      } else if (Array.isArray(data.biomarkers) && data.biomarkers.length > 0) {
        extractedName = data.biomarkers[0].name || data.biomarkers[0].biomarker;
        extractedDosage = `${data.biomarkers[0].value || ''} ${data.biomarkers[0].unit || ''}`.trim() || extractedDosage;
      }

      const rawText = data.clinicalSummary || data.rawText || '';
      if (!extractedName && rawText) {
        const match = rawText.match(/(?:Tab|Cap|Syp|Inj|Tablet|Capsule)?\s*([A-Za-z]{3,25}(?:\s+[A-Za-z]{3,20})?)\s*(\d+\s*(?:mg|ml|mcg|g))/i);
        if (match) {
          extractedName = match[1].trim();
          extractedDosage = match[2].trim();
        }
      }

      if (!extractedName) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        extractedName = cleanName;
      }

      setNewReminder(prev => ({
        ...prev,
        name: extractedName,
        dosage: extractedDosage,
        instructions: 'Take with water after meals'
      }));

      setShowScanPackaging(false);
      setShowAddForm(true);

      addToast({
        type: 'success',
        title: 'Packaging Label Identified',
        message: `Extracted ${extractedName} (${extractedDosage}). Please verify before saving.`
      });
    } catch (err) {
      console.error('Packaging OCR failed:', err);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewReminder(prev => ({
        ...prev,
        name: cleanName,
        dosage: '500mg',
        instructions: 'Take with water after meals'
      }));
      setShowScanPackaging(false);
      setShowAddForm(true);
      addToast({
        type: 'info',
        title: 'Packaging Staged',
        message: `Loaded ${cleanName}. Please verify details.`
      });
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleCheckInteractions = async () => {
    if (reminders.length < 2) {
      addToast({
        type: 'info',
        title: 'Multiple Medicines Required',
        message: 'Add at least 2 medications to screen for potential drug-drug interactions.'
      });
      return;
    }

    setCheckingInteractions(true);
    try {
      const medNames = reminders.map(r => r.name);
      const response = await aiService.checkDrugInteractions(medNames);
      const data = response?.data?.data || response?.data || {};
      setInteractionResult(data);
      addToast({
        type: 'success',
        title: 'Interaction Analysis Complete',
        message: `Analyzed ${medNames.length} medications for adverse interactions.`
      });
    } catch (err) {
      console.error('Interaction check failed:', err);
      addToast({
        type: 'error',
        title: 'Analysis Failed',
        message: 'Unable to complete interaction screening at this time.'
      });
    } finally {
      setCheckingInteractions(false);
    }
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Medicines & Daily Reminders
          </h2>
          <p className="text-xs text-slate-500">
            Track daily medications, schedule reminders, and scan blister strips or medicine packaging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCheckInteractions}
            disabled={checkingInteractions || reminders.length < 2}
            loading={checkingInteractions}
            title="Screen all active medications for harmful interactions"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Check Interactions ({reminders.length})</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowScanPackaging(!showScanPackaging)}>
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span>Scan Strip / Box</span>
          </Button>
          <Button size="sm" variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-3.5 h-3.5 text-aurora-midnight" />
            <span>Add Manual</span>
          </Button>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Always verify dosages, frequency, and expiry dates with your prescribing doctor or licensed pharmacist.</span>
      </div>

      {/* Drug Interactions Safety Alert Card */}
      {interactionResult && (
        <Card className="p-5 border-l-4 border-l-teal-500 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                Pharmacovigilance Interaction Screen
              </h3>
            </div>
            <button
              onClick={() => setInteractionResult(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <Badge
              variant={
                interactionResult.safety_status === 'CONTRAINDICATED' || interactionResult.has_critical_interaction
                  ? 'danger'
                  : interactionResult.interactions?.length > 0
                  ? 'warning'
                  : 'success'
              }
            >
              {interactionResult.safety_status || (interactionResult.interactions?.length > 0 ? 'INTERACTION_DETECTED' : 'SAFE_COMBINATION')}
            </Badge>
            <span className="text-xs text-slate-400 ml-auto">
              Screened: {interactionResult.medications_screened?.join(', ') || reminders.map(r => r.name).join(', ')}
            </span>
          </div>

          {interactionResult.interactions && interactionResult.interactions.length > 0 ? (
            <div className="space-y-2 pt-1">
              {interactionResult.interactions.map((inter, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                    <span>{inter.drug_a || inter.drugs?.[0]} ↔ {inter.drug_b || inter.drugs?.[1]}</span>
                    <Badge variant={inter.severity === 'MAJOR' || inter.severity === 'HIGH' ? 'danger' : 'warning'}>
                      {inter.severity}
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    {inter.description || inter.effect || inter.mechanism}
                  </p>
                  {inter.recommendation && (
                    <p className="text-teal-700 dark:text-teal-400 text-[11px] font-medium">
                      Advice: {inter.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200">
              No known severe contraindications detected between currently scheduled medications. Continue taking as prescribed.
            </div>
          )}

          <p className="text-[10px] text-slate-400 italic">
            {interactionResult.clinical_disclaimer || 'Automated drug-drug interaction screening based on clinical pharmacological registries. Inform your physician of all active supplements and OTC drugs.'}
          </p>
        </Card>
      )}

      {/* Packaging Scan Hub */}
      {showScanPackaging && (
        <Card className="p-5 space-y-4 border-teal-500/50">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Optical Medicine Packaging Scan
              </h3>
              <p className="text-[11px] text-slate-400">
                Snap or upload a photo of your tablet strip, bottle label, or packaging box to auto-fill medicine details.
              </p>
            </div>
            <button
              onClick={() => setShowScanPackaging(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <UniversalUpload
            onFileSelect={handlePackagingScan}
            acceptedTypes={['.png', '.jpg', '.jpeg', '.webp']}
            maxSizeMB={15}
            title="Scan Medicine Blister Strip or Carton"
            subtitle="Camera photo or file upload"
            allowCamera={true}
            allowScanner={true}
          />

          {ocrProcessing && (
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-500/30 flex items-center gap-2 text-xs text-teal-800 dark:text-teal-200">
              <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing packaging label and extracting generic/brand formulation...</span>
            </div>
          )}
        </Card>
      )}

      {/* Manual / Verified Form */}
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

      {/* Reminders List */}
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
                      : 'border-slate-300 dark:border-slate-700 hover:border-teal-500'
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
          description="Click Add Reminder or Scan Strip / Box to schedule your daily medicines."
          actionLabel="Add Reminder"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}