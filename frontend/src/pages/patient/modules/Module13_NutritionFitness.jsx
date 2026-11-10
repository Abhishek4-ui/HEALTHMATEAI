import React, { useState } from 'react';
import { 
  Flame, 
  Utensils, 
  Apple, 
  Sparkles 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function Module13_NutritionFitness() {
  const [dietaryPref, setDietaryPref] = useState('Vegetarian');
  const [fitnessGoal, setFitnessGoal] = useState('Cardio Fitness');
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPlanGenerated(true);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Nutrition & Fitness
          </h2>
          <p className="text-xs text-slate-500">
            Dietary guidance and activity recommendations.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-aurora-amber flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-aurora-teal" />
            <span>Preferences</span>
          </h3>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Diet Preference</label>
            <select
              value={dietaryPref}
              onChange={(e) => setDietaryPref(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            >
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Diabetic-Friendly">Diabetic-Friendly</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Fitness Goal</label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            >
              <option value="Cardio Fitness">Cardio Endurance</option>
              <option value="Weight Maintenance">Weight Maintenance</option>
              <option value="Muscle Tone">Muscle Tone</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-400">Target Calories</span>
              <span className="text-aurora-teal">{calorieTarget} kcal</span>
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
            <Sparkles className="w-3.5 h-3.5 text-aurora-midnight" />
            <span>Generate Plan</span>
          </Button>
        </Card>

        <div className="md:col-span-2">
          {planGenerated ? (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                  {dietaryPref} Nutrition & Activity Plan
                </h3>
                <span className="text-xs text-aurora-teal font-semibold">{calorieTarget} kcal/day</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Meal Distribution:</div>
                  <div className="text-slate-500 leading-relaxed">
                    • <strong>Breakfast:</strong> Whole grains (oats/millets), protein, and fruits.<br/>
                    • <strong>Lunch:</strong> Lentils/dal, whole grain bread/rice, steamed greens.<br/>
                    • <strong>Dinner:</strong> Light vegetable soup, protein, minimal late carbs.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-1">
                  <div className="font-semibold text-aurora-blue">Activity ({fitnessGoal}):</div>
                  <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    • 30-45 minutes brisk walking or cycling 5 days/week.<br/>
                    • 15 minutes stretching and core exercise.
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-400">
              <Apple className="w-8 h-8 mb-2 opacity-50 text-aurora-teal" />
              <div className="text-xs">Set preferences and click Generate Plan to view suggestions.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
