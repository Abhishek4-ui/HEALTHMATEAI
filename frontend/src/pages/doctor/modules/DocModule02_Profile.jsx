import React, { useState } from 'react';
import { 
  UserCheck, 
  Award, 
  MapPin, 
  Building2, 
  Mail, 
  Phone, 
  Save, 
  ShieldCheck 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function DocModule02_Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState({
    fullName: user?.name || 'Dr. Medical Practitioner',
    medicalRegistrationNumber: 'KMC/2018/98712',
    stateMedicalCouncil: 'Karnataka Medical Council',
    specialization: 'Cardiology',
    qualifications: 'MBBS, MD (General Medicine), DM (Cardiology)',
    experienceYears: 12,
    hospitalAffiliation: 'Apollo Super Specialty Hospital',
    consultationFee: 700,
    contactEmail: user?.email || 'doctor@healthmate.ai',
    contactPhone: '+91 9845012345',
    clinicAddress: '100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038',
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Doctor Profile Saved',
      message: 'Clinical profile attributes updated in local session.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Doctor Professional Profile
            </h2>
            <Badge variant="blue">Role: DOCTOR</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Certified credentials displayed to patients during India-wide discovery and teleconsultation bookings.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
          <UserCheck className="w-6 h-6" />
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Specialization</label>
              <input
                type="text"
                required
                value={profile.specialization}
                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">NMC / State Registration No. *</label>
              <input
                type="text"
                required
                value={profile.medicalRegistrationNumber}
                onChange={(e) => setProfile({ ...profile, medicalRegistrationNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State Medical Council</label>
              <input
                type="text"
                required
                value={profile.stateMedicalCouncil}
                onChange={(e) => setProfile({ ...profile, stateMedicalCouncil: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Medical Qualifications & Degrees</label>
            <input
              type="text"
              required
              value={profile.qualifications}
              onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={profile.experienceYears}
                onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Consultation Fee (INR ₹)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={profile.consultationFee}
                onChange={(e) => setProfile({ ...profile, consultationFee: parseInt(e.target.value) || 500 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Clinic / Hospital Address</label>
            <input
              type="text"
              value={profile.clinicAddress}
              onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="submit" variant="blue">
              <Save className="w-4 h-4 text-white" />
              <span>Update Profile</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
