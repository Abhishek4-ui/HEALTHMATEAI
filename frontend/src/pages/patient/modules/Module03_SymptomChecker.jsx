import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Activity, 
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';
import { aiService } from '../../../services/aiService';

export default function Module03_SymptomChecker() {
  const [formData, setFormData] = useState({
    symptoms: '',
    durationDays: 3,
    severity: 5,
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!formData.symptoms.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Symptoms',
        message: 'Please describe the symptoms you are experiencing.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.checkSymptoms(formData);
      const data = response.data || response;
      const topDiff = data.differential_diagnoses?.[0];
      setResult({
        recommendedSpecialist: data.recommended_specialty || data.specialty_recommended || topDiff?.specialty || 'General Physician',
        message: topDiff?.triage_guidance || data.clinical_disclaimer || 'Assessment complete. Please consult a doctor.',
        urgency: data.overall_urgency || data.triage_level || 'ROUTINE',
        isEmergency: data.is_emergency_flagged || data.emergency_red_flags,
        differentialDiagnoses: data.differential_diagnoses || [],
        shapFactors: data.differential_diagnoses?.map(d => ({
          feature: d.condition,
          impact: d.confidence_percent || `${Math.round((d.confidence_score || 0) * 100)}%`
        })) || []
      });
      if (data.is_emergency_flagged || data.overall_urgency === 'EMERGENCY') {
        addToast({
          type: 'error',
          title: 'Emergency Red-Flag Detected',
          message: 'Your reported symptoms indicate potentially urgent health risks. Please seek emergency medical care immediately.'
        });
      }
    } catch (err) {
      setResult({
        recommendedSpecialist: 'General Physician',
        message: 'Based on reported duration and severity, a consultation with a general physician is recommended.',
        shapFactors: [
          { feature: 'Duration', impact: `${formData.durationDays} days` },
          { feature: 'Severity', impact: `${formData.severity}/10` },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Symptom Checker
          </h2>
          <p className="text-xs text-slate-500">
            Enter your symptoms for an initial assessment and specialist recommendation.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="p-5 sm:p-6 space-y-4">
            <form onSubmit={handleTriageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Describe Symptoms *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="e.g. Headache, fever, fatigue..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-aurora-teal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Duration
                    </label>
                    <span className="text-xs font-bold text-aurora-teal">{formData.durationDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                    className="w-full accent-aurora-teal cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Severity (1 - 10)
                    </label>
                    <span className="text-xs font-bold text-aurora-blue">{formData.severity} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                    className="w-full accent-aurora-blue cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Medical History
                  </label>
                  <input
                    type="text"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    placeholder="e.g. Asthma"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Allergies
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="e.g. Penicillin"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Current Medications
                  </label>
                  <input
                    type="text"
                    value={formData.currentMedications}
                    onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                    placeholder="e.g. Paracetamol"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                variant="primary"
                className="w-full"
              >
                <span>Check Symptoms</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Results */}
        <div>
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
              Assessment Results
            </h3>

            {result ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                  <div className="text-[10px] text-slate-500 mb-0.5">Recommended Specialty</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-aurora-teal" />
                    <span>{result.recommendedSpecialist}</span>
                  </div>
                </div>

                {result.shapFactors && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Summary:
                    </div>
                    {result.shapFactors.map((f, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-slate-100 dark:bg-aurora-midnight flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-300">{f.feature}</span>
                        <span className="font-semibold text-aurora-teal">{f.impact}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {result.message}
                </p>

                <div className="pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = '/patient/doctors'}
                  >
                    <span>Find Doctors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Fill in your symptoms to view recommendations.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
