import React, { useState } from 'react';
import { 
  Moon, 
  Smile, 
  Frown, 
  Meh, 
  ShieldAlert, 
  Wind 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';

export default function Module14_SleepMentalWellness() {
  const [sleepHours, setSleepHours] = useState(7.5);
  const [mood, setMood] = useState('good');
  const [stressRating, setStressRating] = useState(3);
  const { addToast } = useToast();

  const handleSaveLog = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Entry Saved',
      message: 'Sleep and mood entry logged.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Sleep & Mental Wellness
          </h2>
          <p className="text-xs text-slate-500">
            Log rest patterns and track daily stress levels.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center shrink-0">
          <Moon className="w-5 h-5" />
        </div>
      </div>

      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-aurora-amber shrink-0" />
        <span>In mental distress? Call Tele-MANAS helpline at <strong>14416</strong> (Govt of India, 24x7).</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Daily Check-In</h3>
          <form onSubmit={handleSaveLog} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Sleep Duration</span>
                <span className="text-aurora-violet font-semibold">{sleepHours} Hours</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-aurora-violet cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mood
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMood('good')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium ${
                    mood === 'good'
                      ? 'bg-emerald-50 dark:bg-teal-950 border-aurora-teal text-aurora-teal'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <Smile className="w-4 h-4" />
                  <span>Good</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMood('neutral')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium ${
                    mood === 'neutral'
                      ? 'bg-blue-50 dark:bg-blue-950 border-aurora-blue text-aurora-blue'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <Meh className="w-4 h-4" />
                  <span>Neutral</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMood('stressed')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium ${
                    mood === 'stressed'
                      ? 'bg-rose-50 dark:bg-rose-950 border-aurora-red text-aurora-red'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <Frown className="w-4 h-4" />
                  <span>Fatigued</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Stress Level</span>
                <span className="text-aurora-amber">{stressRating} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={stressRating}
                onChange={(e) => setStressRating(parseInt(e.target.value))}
                className="w-full accent-aurora-amber cursor-pointer"
              />
            </div>

            <Button type="submit" variant="violet" className="w-full">
              <span>Save Entry</span>
            </Button>
          </form>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-aurora-teal" />
            <span>Sleep Hygiene Tips</span>
          </h3>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight space-y-0.5">
              <div className="font-semibold text-slate-800 dark:text-slate-200">Regular Schedule</div>
              <div>Maintain a consistent sleep-wake time (+/- 30 mins) daily.</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight space-y-0.5">
              <div className="font-semibold text-slate-800 dark:text-slate-200">Screen Rest</div>
              <div>Turn off phone and computer screens 30-45 minutes before bed.</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight space-y-0.5">
              <div className="font-semibold text-slate-800 dark:text-slate-200">Avoid Late Caffeine</div>
              <div>Avoid tea, coffee, or energy drinks within 6 hours of sleeping.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
