import React, { useState } from 'react';
import { 
  Moon, 
  Smile, 
  Frown, 
  Meh, 
  Sun, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Wind 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../context/ToastContext';

export default function Module14_SleepMentalWellness() {
  const [sleepHours, setSleepHours] = useState(7.5);
  const [mood, setMood] = useState('good');
  const [stressRating, setStressRating] = useState(3); // 1-5 scale
  const [savedToday, setSavedToday] = useState(false);
  const { addToast } = useToast();

  const handleSaveLog = (e) => {
    e.preventDefault();
    setSavedToday(true);
    addToast({
      type: 'success',
      title: 'Wellness Log Recorded',
      message: 'Sleep and mood parameters added to active session tracking.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Sleep & Mental Wellness Tracking
            </h2>
            <Badge variant="violet">Holistic Health</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log rest patterns, track emotional wellness, and explore evidence-based sleep hygiene techniques.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center shrink-0">
          <Moon className="w-6 h-6" />
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-aurora-amber shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Psychological Health Boundary:</strong> This self-assessment is an informational wellness journal and does NOT substitute for professional clinical therapy or psychiatric diagnosis. If in severe distress, contact Tele-MANAS (Govt of India Helpline: 14416).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Wellness Check-In</h3>
          <form onSubmit={handleSaveLog} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1 text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Sleep Duration Last Night</span>
                <span className="text-aurora-violet font-mono">{sleepHours} Hours</span>
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Overall Mood Today
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMood('good')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    mood === 'good'
                      ? 'bg-emerald-50 dark:bg-teal-950 border-aurora-teal text-aurora-teal'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <Smile className="w-5 h-5" />
                  <span>Calm / Good</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMood('neutral')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    mood === 'neutral'
                      ? 'bg-blue-50 dark:bg-blue-950 border-aurora-blue text-aurora-blue'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <Meh className="w-5 h-5" />
                  <span>Neutral</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMood('stressed')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    mood === 'stressed'
                      ? 'bg-rose-50 dark:bg-rose-950 border-aurora-red text-aurora-red'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <Frown className="w-5 h-5" />
                  <span>Fatigued</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Subjective Stress Index</span>
                <span className="text-aurora-amber font-mono">{stressRating} / 5</span>
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
              <span>Save Daily Entry</span>
            </Button>
          </form>
        </Card>

        {/* Wellness Directives */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-aurora-teal" />
              <span>Evidence-Based Sleep Hygiene</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">Consistent Sleep Schedule</div>
                <div>Retain a regular sleep-wake time (+/- 30 mins), even on weekends, to stabilize circadian rhythms.</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">Blue Light Mitigation</div>
                <div>Discontinue high-intensity mobile or desktop screen exposure at least 45 minutes before sleep.</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">Caffeine Boundary</div>
                <div>Avoid caffeinated beverages within 6 hours of bedtime to prevent adenosine receptor disruption.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
