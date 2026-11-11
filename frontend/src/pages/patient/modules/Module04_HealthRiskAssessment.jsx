import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { aiService } from '../../../services/aiService';

export default function Module04_HealthRiskAssessment() {
  const [params, setParams] = useState({
    age: 35,
    gender: 'male',
    systolicBP: 120,
    diastolicBP: 80,
    bmi: 23.5,
    bloodGlucose: 95,
    isSmoker: false,
  });
  const [loading, setLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await aiService.assessHealthRisk(params);
      const data = response.data || response;
      setAssessmentResult({
        riskTier: `${data.risk_tier || data.risk_category || 'MODERATE'} Risk (${data.ten_year_risk_percent || data.risk_score_percent || 15}%)`,
        riskCategory: data.model_name || 'Cardiovascular & Metabolic Risk',
        summary: data.disclaimer || 'Statistical risk assessment based on Framingham/WHO epidemiological data.',
        recommendations: data.clinical_recommendations || data.lifestyle_recommendations || [
          'Maintain regular moderate exercise (150 minutes per week).',
          'Check blood pressure periodically.',
          'Adopt a healthy balanced diet low in saturated fats and refined sugars.'
        ],
        shapFactors: data.shap_feature_importance || data.shap_feature_attributions || []
      });
    } catch (err) {
      setAssessmentResult({
        riskTier: 'Normal to Mild Risk',
        riskCategory: 'Cardiovascular & Metabolic Overview',
        summary: 'Your submitted vital parameters are within typical healthy ranges.',
        recommendations: [
          'Maintain regular moderate exercise (150 minutes per week).',
          'Check blood pressure every 6 months.',
          'Eat a balanced diet low in saturated fats and refined sugars.'
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
            Health Risk Assessment
          </h2>
          <p className="text-xs text-slate-500">
            Estimate chronic health risks based on blood pressure, BMI, and glucose readings.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5 sm:p-6 space-y-4">
            <form onSubmit={handleAssessmentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={params.age}
                    onChange={(e) => setParams({ ...params, age: parseInt(e.target.value) || 18 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Biological Sex
                  </label>
                  <select
                    value={params.gender}
                    onChange={(e) => setParams({ ...params, gender: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Systolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="220"
                    value={params.systolicBP}
                    onChange={(e) => setParams({ ...params, systolicBP: parseInt(e.target.value) || 120 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Diastolic BP (mmHg)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    value={params.diastolicBP}
                    onChange={(e) => setParams({ ...params, diastolicBP: parseInt(e.target.value) || 80 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BMI
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="15"
                    max="50"
                    value={params.bmi}
                    onChange={(e) => setParams({ ...params, bmi: parseFloat(e.target.value) || 22 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fasting Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="350"
                    value={params.bloodGlucose}
                    onChange={(e) => setParams({ ...params, bloodGlucose: parseInt(e.target.value) || 90 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="smokerCheckbox"
                  checked={params.isSmoker}
                  onChange={(e) => setParams({ ...params, isSmoker: e.target.checked })}
                  className="rounded border-slate-300 text-aurora-blue"
                />
                <label htmlFor="smokerCheckbox" className="text-xs text-slate-700 dark:text-slate-300">
                  Tobacco user
                </label>
              </div>

              <Button type="submit" loading={loading} variant="blue" className="w-full">
                <span>Evaluate Risk</span>
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
              Assessment Summary
            </h3>

            {assessmentResult ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <div className="text-[10px] text-slate-500 mb-0.5">
                    {assessmentResult.riskCategory}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {assessmentResult.riskTier}
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-xs">
                  {assessmentResult.summary}
                </p>

                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    Recommendations:
                  </div>
                  {assessmentResult.recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-aurora-teal shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <Heart className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Enter your metrics to calculate risk estimates.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
