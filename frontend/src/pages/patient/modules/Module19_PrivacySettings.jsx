import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  ShieldCheck, 
  Lock, 
  Trash2, 
  Download, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import ForgetMeModal from '../../../components/common/ForgetMeModal';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function Module19_PrivacySettings() {
  const { user, guestSession, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [forgetModalOpen, setForgetModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [settingsState, setSettingsState] = useState({
    ephemeralTTLMinutes: 60,
    allowDoctorClinicalShare: true,
    telemedicineRecordingConsent: false,
    preferredLanguage: 'English',
  });

  const handleExportConsentReport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        dataPrincipal: user?.email || 'Anonymous Guest',
        sessionId: guestSession?.id,
        dpdpComplianceBaseline: 'Digital Personal Data Protection Act 2023 (India)',
        ephemeralStoragePolicy: 'TEMPORARY_BY_DEFAULT',
        redisTTLSeconds: settingsState.ephemeralTTLMinutes * 60,
        consents: {
          ephemeralAIAnalysis: 'GRANTED',
          doctorClinicalShare: settingsState.allowDoctorClinicalShare ? 'GRANTED' : 'REVOKED',
          telemedicineRecordingConsent: settingsState.telemedicineRecordingConsent ? 'GRANTED' : 'REVOKED',
        },
        exportTimestamp: new Date().toISOString()
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dpdp_consent_certificate_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast({
        type: 'success',
        title: 'Consent Certificate Exported',
        message: 'Your official DPDP machine-readable record has been downloaded.',
      });
    }, 700);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Privacy, Consent & Account Settings
              </h2>
              <Badge variant="teal">DPDP Act 2023</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your ephemeral memory buffers, exercise your right to be forgotten, and configure accessibility.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6" />
          </div>
        </div>

        {/* Ephemeral Privacy Controls */}
        <Card className="p-6 sm:p-8 space-y-6 border-aurora-teal/40">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-aurora-teal" />
                <span>Zero-Trust Ephemeral Memory Configuration</span>
              </h3>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                Your symptom checks and Copilot dialogues are stored exclusively in Redis with automatic TTL expiration. Configure your session lifespan below.
              </p>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950 text-aurora-teal">
              TTL: {settingsState.ephemeralTTLMinutes}m
            </span>
          </div>

          <div className="space-y-4 pt-2 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Ephemeral Session TTL Lifespan</div>
                <div className="text-slate-400">Automatic Redis key expiration interval</div>
              </div>
              <select
                value={settingsState.ephemeralTTLMinutes}
                onChange={(e) => setSettingsState({ ...settingsState, ephemeralTTLMinutes: parseInt(e.target.value) })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-navy text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes (Default)</option>
                <option value="120">2 Hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Doctor Clinical Context Sharing</div>
                <div className="text-slate-400">Share chief complaint summary upon confirmed appointment booking</div>
              </div>
              <input
                type="checkbox"
                checked={settingsState.allowDoctorClinicalShare}
                onChange={(e) => setSettingsState({ ...settingsState, allowDoctorClinicalShare: e.target.checked })}
                className="rounded border-slate-300 text-aurora-teal focus:ring-aurora-teal"
              />
            </div>
          </div>
        </Card>

        {/* DPDP Data Principal Rights */}
        <Card className="p-6 sm:p-8 space-y-5">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-aurora-blue" />
            <span>DPDP Act 2023 Data Principal Rights</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white">Export Consent & Access Certificate</div>
              <p className="text-slate-500">Download a complete, machine-readable JSON archive of all active consent tokens and audit parameters under §11.</p>
              <Button size="sm" variant="outline" onClick={handleExportConsentReport} loading={exporting}>
                <Download className="w-3.5 h-3.5" />
                <span>Download Consent Audit JSON</span>
              </Button>
            </div>

            <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
              <div className="font-bold text-rose-700 dark:text-rose-400">Instant Right to be Forgotten (§12)</div>
              <p className="text-rose-600/80 dark:text-rose-300/70">Wipe all active symptom evaluations, uploaded report files, and conversation tokens from Redis immediately.</p>
              <Button size="sm" variant="danger" onClick={() => setForgetModalOpen(true)}>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe Ephemeral Session Now</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* General Preferences */}
        <Card className="p-6 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Preferences</h3>
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">Visual Theme</div>
              <div className="text-slate-400">Toggle between Aurora light and dark modes</div>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">Account Session</div>
              <div className="text-slate-400">Sign out of active patient authentication</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                logout();
                addToast({ type: 'info', title: 'Signed Out', message: 'Session concluded.' });
                navigate('/login');
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </Card>
      </div>

      <ForgetMeModal
        isOpen={forgetModalOpen}
        onClose={() => setForgetModalOpen(false)}
      />
    </>
  );
}
