import React, { useState } from 'react';
import { Bell, CheckCircle2, Trash2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function DocModule11_Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 'doc_notif_1',
      title: 'NMC Credentials Approved',
      message: 'State Medical Council registration number KMC/2018/98712 successfully verified by Administration.',
      time: '1 hour ago',
      read: false,
    }
  ]);
  const { addToast } = useToast();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Doctor Clinical Notifications
            </h2>
            <Badge variant="blue">Clinical Alerts</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Appointment requests, verification milestones, and system notices.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={() => setNotifications([])}>
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Clear All</span>
        </Button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className="p-4 flex items-start gap-4 border-aurora-blue/40">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-aurora-blue flex items-center justify-center shrink-0 mt-0.5">
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
          title="No Active Notifications"
          description="Your clinical notification tray is up to date."
        />
      )}
    </div>
  );
}
