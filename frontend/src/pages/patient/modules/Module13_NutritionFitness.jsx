import React, { useState } from 'react';
import { 
  Flame, 
  Utensils, 
  Dumbbell, 
  Apple, 
  Sparkles, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function Module13_NutritionFitness() {
  const [dietaryPref, setDietaryPref] = useState('Vegetarian');
  const [fitnessGoal, setFitnessGoal] = useState('Cardio Fitness');
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleGeneratePlan = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPlanGenerated(true);
      addToast({
        type: 'success',
        title: 'Nutritional Overview Formulated',
        message: 'Personalized dietary recommendations compiled.',
      });
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              AI Nutrition & Fitness Intelligence
            </h2>
            <Badge variant="teal">Metabolic Wellness</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Formulate personalized dietary frameworks and physical activity plans grounded in WHO guidelines.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-aurora-amber flex items-center justify-center shrink-0">
          <Flame className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Preference Controls */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-aurora-teal" />
            <span>Preferences & Targets</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Dietary Preference</label>
            <select
              value={dietaryPref}
              onChange={(e) => setDietaryPref(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            >
              <option value="Vegetarian">Vegetarian (Indian Standard)</option>
              <option value="Vegan">Vegan (Plant-Based)</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Diabetic-Friendly">Diabetic-Friendly (Low Glycemic)</option>
              <option value="Low Sodium">Low Sodium (Hypertension)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Primary Fitness Goal</label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            >
              <option value="Cardio Fitness">Cardiovascular Endurance</option>
              <option value="Weight Maintenance">Weight Maintenance</option>
              <option value="Muscle Tone">Muscle Toning</option>
              <option value="Mobility & Flexibility">Mobility & Joint Flexibility</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-600 dark:text-slate-400">Calorie Target</span>
              <span className="text-aurora-teal font-mono">{calorieTarget} kcal</span>
            </div>
            <input
              type="range"
              min="1400"
              max="3200"
              step="50"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(parseInt(e.target.value))}
              className="w-full accent-aurora-teal cursor-pointer"
            />
          </div>

          <Button size="sm" variant="primary" className="w-full" onClick={handleGeneratePlan} loading={loading}>
            <Sparkles className="w-4 h-4 text-aurora-midnight" />
            <span>Generate Wellness Outline</span>
          </Button>
        </Card>

        {/* Plan Output Area */}
        <div className="md:col-span-2">
          {planGenerated ? (
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {dietaryPref} Nutrition & Activity Plan
                </h3>
                <span className="text-xs font-bold text-aurora-teal">{calorieTarget} kcal/day Target</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Recommended Meal Distribution:</div>
                  <div className="text-slate-500">
                    • <strong>Breakfast:</strong> Whole grains (oats/millets), plant or dairy protein, fresh fruits.<br/>
                    • <strong>Lunch:</strong> Balanced lentils/dal, brown rice or whole wheat roti, steamed vegetables.<br/>
                    • <strong>Dinner:</strong> Light fiber-rich vegetable soup, paneer or lean protein, minimal evening carbs.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-1">
                  <div className="font-bold text-aurora-blue">Activity Routine ({fitnessGoal}):</div>
                  <div className="text-slate-600 dark:text-slate-400">
                    • 30-45 minutes of moderate aerobic brisk walking or cycling 5 days/week.<br/>
                    • 15 minutes of dynamic stretching and core resistance exercises.
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Notice: Nutritional guidelines are compiled from WHO global dietary standards and do not replace personalized therapeutic dietetics prescribed by a clinical nutritionist.
              </p>
            </Card>
          ) : (
            <Card className="p-10 text-center flex flex-col items-center justify-center h-full text-slate-400">
              <Apple className="w-10 h-10 mb-2 opacity-40 animate-pulse text-aurora-teal" />
              <div className="text-xs font-semibold">Select your preferences on the left and click 'Generate' to review your nutritional blueprint.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
