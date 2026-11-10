import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Trash2 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function Module18_Notifications() {
  const [filter, setFilter] = useState('ALL');
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      type: 'SECURITY',
      title: 'Ephemeral Session Allocated',
      message: 'Zero-trust Redis session active with 60-minute automatic TTL expiration.',
      time: 'Just now',
      read: false,
    },
    {
      id: 'notif_2',
      type: 'SYSTEM',
      title: 'DPDP Act 2023 Consent Active',
      message: 'Your personal data protection preferences are enforced across all interactions.',
      time: '15 mins ago',
      read: true,
    }
  ]);

  const { addToast } = useToast();

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast({ type: 'info', title: 'Notifications Updated', message: 'All alerts marked as read.' });
  };

  const clearAll = () => {
    setNotifications([]);
    addToast({ type: 'info', title: 'Alerts Cleared', message: 'Notification tray emptied.' });
  };

  const filtered = notifications.filter(n => filter === 'ALL' || n.type === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Notification & Security Alerts Center
            </h2>
            <Badge variant="teal">Real-Time Dispatch</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            System notices, teleconsultation reminders, and privacy audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={markAllRead}>
            Mark All Read
          </Button>
          <Button size="sm" variant="ghost" onClick={clearAll}>
            <Trash2 className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
        {['ALL', 'APPOINTMENT', 'SECURITY', 'SYSTEM'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              filter === cat
                ? 'bg-aurora-teal text-aurora-midnight'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-aurora-navy'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((n) => (
            <Card key={n.id} className={`p-4 flex items-start gap-4 transition-colors ${n.read ? 'opacity-80' : 'border-aurora-teal/40'}`}>
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No Notifications in this Category"
          description="Your alert tray is clear. Important appointment reminders and security alerts will appear here."
        />
      )}
    </div>
  );
}
