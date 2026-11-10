import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Lock, 
  Bell, 
  Save, 
  LogOut, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function DocModule13_Settings() {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationSMS, setNotificationSMS] = useState(true);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Practice Preferences Saved',
      message: 'Doctor notification and security preferences updated.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Doctor Practice & Security Settings
            </h2>
            <Badge variant="blue">Clinical Admin</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your credentials, notification channels, and portal appearance.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <Settings className="w-6 h-6" />
        </div>
      </div>

      {/* Practice Preferences */}
      <Card className="p-6 sm:p-8 space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clinical Notifications</h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Email Consultation Alerts</div>
              <div className="text-slate-400">Receive email notification when patient books or reschedules</div>
            </div>
            <input
              type="checkbox"
              checked={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.checked)}
              className="rounded border-slate-300 text-aurora-blue focus:ring-aurora-blue"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Urgent SMS Reminders</div>
              <div className="text-slate-400">Receive SMS 10 minutes prior to scheduled teleconsultations</div>
            </div>
            <input
              type="checkbox"
              checked={notificationSMS}
              onChange={(e) => setNotificationSMS(e.target.checked)}
              className="rounded border-slate-300 text-aurora-blue focus:ring-aurora-blue"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="sm" variant="blue" onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* Portal Appearance & Session */}
      <Card className="p-6 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Session Management</h3>
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Visual Theme</div>
            <div className="text-slate-400">Toggle between Aurora light and dark modes</div>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Doctor Sign Out</div>
            <div className="text-slate-400">End active clinical session and invalidate access tokens</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              logout();
              addToast({ type: 'info', title: 'Signed Out', message: 'Doctor session ended.' });
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
