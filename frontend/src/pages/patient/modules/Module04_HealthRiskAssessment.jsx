import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Info
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';
import { aiService } from '../../../services/aiService';

export default function Module04_HealthRiskAssessment() {
  const [activeTab, setActiveTab] = useState('CARDIO'); // 'CARDIO' | 'DIABETES'
  
  // Cardiovascular Parameters
  const [cardioParams, setCardioParams] = useState({
    age: 45,
    gender: 'male',
    systolicBP: 135,
    diastolicBP: 85,
    cholesterol: 210,
    hdlCholesterol: 45,
    bloodGlucose: 98,
    isSmoker: false,
    hasDiabetes: false,
  });

  // Diabetes FINDRISC Parameters
  const [diabetesParams, setDiabetesParams] = useState({
    age: 45,
    bmi: 27.5,
    fastingGlucose: 105,
    familyHistory: true,
    physicalActivity: false,
  });

  const [loading, setLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const { addToast } = useToast();

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (activeTab === 'CARDIO') {
        response = await aiService.assessCardioRisk({
          ...cardioParams,
          type: 'cardio',
          systolic_bp: cardioParams.systolicBP,
          total_cholesterol: cardioParams.cholesterol,
          hdl_cholesterol: cardioParams.hdlCholesterol,
          is_smoker: cardioParams.isSmoker,
          has_diabetes: cardioParams.hasDiabetes || (cardioParams.bloodGlucose > 125),
        });
      } else {
        response = await aiService.assessDiabetesRisk({
          ...diabetesParams,
          type: 'diabetes',
          fasting_glucose: diabetesParams.fastingGlucose,
          family_history: diabetesParams.familyHistory,
          physical_activity: diabetesParams.physicalActivity,
        });
      }

      const data = response.data || response;
      const scorePercent = data.ten_year_risk_percent !== undefined 
        ? data.ten_year_risk_percent 
        : (data.five_year_risk_percent !== undefined ? data.five_year_risk_percent : data.risk_score_percent || 15);

      setAssessmentResult({
        riskTier: `${data.risk_tier || data.risk_category || 'MODERATE'} Risk (${scorePercent}%)`,
        riskLevel: data.risk_tier || data.risk_category || 'MODERATE',
        riskCategory: data.model_name || (activeTab === 'CARDIO' ? 'Framingham / WHO Cardiovascular 10-Year Risk' : 'ADA / FINDRISC 5-Year Type-2 Diabetes Risk'),
        summary: data.clinical_recommendation || data.disclaimer || 'Algorithmic risk evaluation based on calibrated epidemiological benchmarks.',
        recommendations: Array.isArray(data.clinical_recommendations) 
          ? data.clinical_recommendations 
          : (data.clinical_recommendation ? [data.clinical_recommendation] : (data.lifestyle_recommendations || [])),
        shapFactors: data.shap_feature_importance || data.shap_feature_attributions || [],
        efficiencyCheck: data.shapley_sum_check || null,
      });

      addToast({
        type: 'success',
        title: 'Risk Evaluation Complete',
        message: `${data.risk_tier || 'Risk'} stratification computed with SHAP feature attributions.`
      });
    } catch (err) {
      setAssessmentResult(null);
      addToast({
        type: 'error',
        title: 'Assessment Unavailable',
        message: err?.response?.data?.message || err?.message || 'Unable to compute risk calculation. Please verify entered parameters.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Clinical Health Risk & Epidemiological Assessment
          </h2>
          <p className="text-xs text-slate-500">
            Statistically calibrated 10-year Cardiovascular (WHO/Framingham) and 5-year Type-2 Diabetes (ADA/FINDRISC) engines with SHAP explainability.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* Engine Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => { setActiveTab('CARDIO'); setAssessmentResult(null); }}
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'CARDIO'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Cardiovascular 10-Year Risk (WHO/Framingham)</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('DIABETES'); setAssessmentResult(null); }}
          className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'DIABETES'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Type-2 Diabetes 5-Year Risk (ADA/FINDRISC)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5 sm:p-6 space-y-4">
            <form onSubmit={handleAssessmentSubmit} className="space-y-4">
              {activeTab === 'CARDIO' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="100"
                        value={cardioParams.age}
                        onChange={(e) => setCardioParams({ ...cardioParams, age: parseInt(e.target.value) || 18 })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Biological Sex
                      </label>
                      <select
                        value={cardioParams.gender}
                        onChange={(e) => setCardioParams({ ...cardioParams, gender: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Systolic Blood Pressure (mmHg)
                      </label>
                      <input
                        type="number"
                        min="80"
                        max="240"
                        value={cardioParams.systolicBP}
                        onChange={(e) => setCardioParams({ ...cardioParams, systolicBP: parseInt(e.target.value) || 120 })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Total Cholesterol (mg/dL)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="400"
                        value={cardioParams.cholesterol}
                        onChange={(e) => setCardioParams({ ...cardioParams, cholesterol: parseInt(e.target.value) || 190 })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        HDL Protective Cholesterol (mg/dL)
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="120"
                        value={cardioParams.hdlCholesterol}
                        onChange={(e) => setCardioParams({ ...cardioParams, hdlCholesterol: parseInt(e.target.value) || 50 })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Fasting Glucose (mg/dL)
                      </label>
                      <input
                        type="number"
                        min="60"
                        max="350"
                        value={cardioParams.bloodGlucose}
                        onChange={(e) => setCardioParams({ ...cardioParams, bloodGlucose: parseInt(e.target.value) || 95 })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cardioParams.isSmoker}
                        onChange={(e) => setCardioParams({ ...cardioParams, isSmoker: e.target.checked })}
                        className="rounded border-slate-300 text-rose-600"
                      />
                      <span>Current Tobacco Smoker</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cardioParams.hasDiabetes}
                        onChange={(e) => setCardioParams({ ...cardioParams, hasDiabetes: e.target.checked })}
                        className="rounded border-slate-300 text-rose-600"
                      />
                      <span>Diagnosed Type 2 Diabetes</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="100"
                        value={diabetesParams.age}
                        onChange={(e) => setDiabetesParams({ ...diabetesParams, age: parseInt(e.target.value) || 18 })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Body Mass Index (BMI kg/m²)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="15"
                        max="60"
                        value={diabetesParams.bmi}
                        onChange={(e) => setDiabetesParams({ ...diabetesParams, bmi: parseFloat(e.target.value) || 25 })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fasting Plasma Glucose (mg/dL)
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="300"
                      value={diabetesParams.fastingGlucose}
                      onChange={(e) => setDiabetesParams({ ...diabetesParams, fastingGlucose: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={diabetesParams.familyHistory}
                        onChange={(e) => setDiabetesParams({ ...diabetesParams, familyHistory: e.target.checked })}
                        className="rounded border-slate-300 text-teal-600"
                      />
                      <span>First-Degree Family History of Diabetes (Parents/Siblings)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={diabetesParams.physicalActivity}
                        onChange={(e) => setDiabetesParams({ ...diabetesParams, physicalActivity: e.target.checked })}
                        className="rounded border-slate-300 text-teal-600"
                      />
                      <span>Regular Daily Physical Activity (At least 30 minutes/day)</span>
                    </label>
                  </div>
                </>
              )}

              <Button type="submit" loading={loading} variant="primary" className="w-full">
                <span>Evaluate {activeTab === 'CARDIO' ? 'Cardiovascular' : 'Diabetes'} Risk</span>
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center justify-between">
              <span>Risk Stratification</span>
              <span className="text-[10px] font-mono text-slate-400">SHAP Explainable</span>
            </h3>

            {assessmentResult ? (
              <div className="space-y-3 text-xs">
                <div className={`p-3 rounded-xl border ${
                  assessmentResult.riskLevel === 'HIGH'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                    : 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800'
                }`}>
                  <div className="text-[10px] text-slate-500 mb-0.5 font-medium">
                    {assessmentResult.riskCategory}
                  </div>
                  <div className={`text-sm font-bold ${
                    assessmentResult.riskLevel === 'HIGH' ? 'text-rose-700 dark:text-rose-300' : 'text-teal-700 dark:text-teal-300'
                  }`}>
                    {assessmentResult.riskTier}
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  {assessmentResult.summary}
                </p>

                {/* SHAP Factor Importance */}
                {assessmentResult.shapFactors && assessmentResult.shapFactors.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center justify-between">
                      <span>Key Risk Contributors (SHAP):</span>
                      <span className="text-[9px] text-slate-400">Additive Attributions</span>
                    </div>
                    {assessmentResult.shapFactors.slice(0, 4).map((factor, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {factor.label || factor.feature}
                        </span>
                        <span className={`font-mono text-[10px] font-bold ${
                          factor.impact === 'PROTECTIVE_DECREASES_RISK'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {factor.shap_value !== undefined ? (factor.shap_value > 0 ? `+${factor.shap_value}` : factor.shap_value) : factor.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Clinical Recommendations */}
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    Clinical Recommendations:
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
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Heart className="w-8 h-8 mx-auto opacity-40 text-rose-500" />
                <p className="text-xs">Enter your clinical readings on the left to compute statistical risk estimates.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
