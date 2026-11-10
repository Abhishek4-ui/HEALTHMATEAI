import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, ShieldAlert, LogOut, Lock } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function AdminModule14_SystemSettings() {
  const [commissionRate, setCommissionRate] = useState(10); // 10%
  const [defaultTTL, setDefaultTTL] = useState(60); // 60 mins
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSave = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'System Settings Saved',
      message: 'Global parameters updated in memory config.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Global System & Security Settings
            </h2>
            <Badge variant="violet">Master Config</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure platform commission rules, default Redis TTLs, and administrative access.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center shrink-0">
          <Settings className="w-6 h-6" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Operational Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Platform Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Patient Ephemeral TTL (Minutes)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={defaultTTL}
                onChange={(e) => setDefaultTTL(parseInt(e.target.value) || 60)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Maintenance Mode Sandbox</div>
              <div className="text-slate-400">Suspend public triage bookings for infrastructure upgrades</div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded border-slate-300 text-aurora-violet focus:ring-aurora-violet"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="violet" type="submit">
              <Save className="w-3.5 h-3.5 text-white" />
              <span>Save System Settings</span>
            </Button>
          </div>
        </Card>
      </form>

      {/* Admin Session Controls */}
      <Card className="p-6 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Administration Session</h3>
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Visual Theme</div>
            <div className="text-slate-400">Toggle between Aurora light and dark modes</div>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Sign Out of Administration</div>
            <div className="text-slate-400">Invalidate master administrative credentials</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              logout();
              addToast({ type: 'info', title: 'Admin Session Ended', message: 'Master token cleared.' });
              navigate('/login');
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
