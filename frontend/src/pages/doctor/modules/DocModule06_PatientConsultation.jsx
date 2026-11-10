import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  FileText, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Pill, 
  ShieldCheck 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function DocModule06_PatientConsultation() {
  const [patientContext, setPatientContext] = useState({
    name: 'Patient (Active Session #8912)',
    age: 38,
    gender: 'Female',
    chiefComplaint: 'Intermittent retrosternal chest tightness radiating to left shoulder on moderate exertion for 4 days.',
    vitals: 'BP: 138/88 mmHg, HR: 84 bpm, SpO2: 97%',
    allergies: 'None reported',
  });

  const [soapNotes, setSoapNotes] = useState({
    subjective: 'Patient reports chest tightness during brisk walking, relieved by rest. No diaphoresis.',
    objective: 'BP elevated at 138/88. Regular rhythm. Lungs clear to auscultation.',
    assessment: 'Atypical Anginal Symptoms vs Musculoskeletal Discomfort. Moderate CVD Risk.',
    plan: '1. Fasting Lipid Profile & 12-lead ECG.\n2. Tablet Aspirin 75mg daily.\n3. Follow up in 7 days with ECG tracings.',
  });

  const [generating, setGenerating] = useState(false);
  const { addToast } = useToast();

  const handleGenerateSoap = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      addToast({
        type: 'success',
        title: 'AI SOAP Note Drafted',
        message: 'Clinical summary synthesized for doctor review under NMC guidelines.',
      });
    }, 700);
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Clinical Notes Saved',
      message: 'Consultation notes recorded in active session.',
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Patient Clinical Consultation Workspace
            </h2>
            <Badge variant="blue">Active Session</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review authorized patient context, generate AI SOAP clinical drafts, and document treatment plans.
          </p>
        </div>

        <Button size="sm" variant="violet" onClick={handleGenerateSoap} loading={generating}>
          <Sparkles className="w-4 h-4 text-white" />
          <span>Draft AI SOAP Note</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Context Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{patientContext.name}</h3>
            <span className="text-xs text-slate-400">{patientContext.age}y / {patientContext.gender}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Chief Complaint:</span>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed bg-slate-50 dark:bg-aurora-midnight p-3 rounded-xl">
                {patientContext.chiefComplaint}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Reported Vitals:</span>
              <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px] mt-0.5">{patientContext.vitals}</p>
            </div>

            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Allergies:</span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{patientContext.allergies}</p>
            </div>
          </div>
        </Card>

        {/* SOAP Notes Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">SOAP Clinical Documentation</h3>
              <span className="text-[10px] text-aurora-teal font-bold uppercase tracking-wider">Doctor Review Required</span>
            </div>

            <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">S - Subjective (Patient's Narrative)</label>
                <textarea
                  rows={2}
                  value={soapNotes.subjective}
                  onChange={(e) => setSoapNotes({ ...soapNotes, subjective: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">O - Objective (Clinical Observations & Vitals)</label>
                <textarea
                  rows={2}
                  value={soapNotes.objective}
                  onChange={(e) => setSoapNotes({ ...soapNotes, objective: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">A - Assessment (Differential Diagnosis)</label>
                <textarea
                  rows={2}
                  value={soapNotes.assessment}
                  onChange={(e) => setSoapNotes({ ...soapNotes, assessment: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">P - Plan (Investigations & Prescriptions)</label>
                <textarea
                  rows={3}
                  value={soapNotes.plan}
                  onChange={(e) => setSoapNotes({ ...soapNotes, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400">All AI-assisted notes require doctor review and sign-off.</span>
                <Button size="sm" variant="blue" type="submit">
                  <Save className="w-3.5 h-3.5 text-white" />
                  <span>Save Clinical Record</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
