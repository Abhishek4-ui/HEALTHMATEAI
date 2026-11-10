import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Stethoscope, 
  Mail, 
  Lock, 
  Phone, 
  Award, 
  ShieldCheck, 
  ArrowRight,
  FileText
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';

export default function RegisterPage() {
  const [role, setRole] = useState('PATIENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    medicalRegistrationNumber: '',
    stateMedicalCouncil: 'Delhi Medical Council',
    specialization: 'General Medicine',
    consentGranted: false,
  });
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addToast({ type: 'warning', title: 'Missing Info', message: 'Please complete all required fields.' });
      return;
    }
    if (!formData.consentGranted) {
      addToast({ type: 'warning', title: 'DPDP Consent Required', message: 'You must review and agree to data processing terms.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({
        type: 'success',
        title: 'Account Registered',
        message: 'Verification OTP sent to your registered contact. Please verify to continue.',
      });
      navigate('/verify-otp', { state: { email: formData.email, phone: formData.phone, role } });
    }, 700);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create HealthMate AI Account
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Join the certified AI-powered healthcare ecosystem. Exactly two public roles.
        </p>
      </div>

      <Card className="p-8 space-y-6">
        {/* Role Toggle */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Register As
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                role === 'PATIENT'
                  ? 'bg-aurora-teal text-aurora-midnight shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient Account</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                role === 'DOCTOR'
                  ? 'bg-aurora-blue text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Medical Doctor</span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={role === 'DOCTOR' ? 'Dr. Ananya Roy' : 'John Doe'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
                />
              </div>
            </div>
          </div>

          {/* Doctor-Specific Fields */}
          {role === 'DOCTOR' && (
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-4">
              <div className="text-xs font-bold text-aurora-blue flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Medical Credential Verification (NMC Requirement)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State Council Reg. Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.medicalRegistrationNumber}
                    onChange={(e) => setFormData({ ...formData, medicalRegistrationNumber: e.target.value })}
                    placeholder="e.g. DMC/R/12345"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-blue/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State Medical Council
                  </label>
                  <select
                    value={formData.stateMedicalCouncil}
                    onChange={(e) => setFormData({ ...formData, stateMedicalCouncil: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-blue/50"
                  >
                    <option value="Delhi Medical Council">Delhi Medical Council</option>
                    <option value="Karnataka Medical Council">Karnataka Medical Council</option>
                    <option value="Maharashtra Medical Council">Maharashtra Medical Council</option>
                    <option value="Tamil Nadu Medical Council">Tamil Nadu Medical Council</option>
                    <option value="West Bengal Medical Council">West Bengal Medical Council</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Specialization
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-blue/50"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Psychiatry">Psychiatry</option>
                </select>
              </div>
            </div>
          )}

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="consentGranted"
              checked={formData.consentGranted}
              onChange={(e) => setFormData({ ...formData, consentGranted: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-aurora-teal focus:ring-aurora-teal"
            />
            <label htmlFor="consentGranted" className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              I agree to the <Link to="/terms" className="text-aurora-teal underline font-semibold">Terms of Service</Link> and acknowledge the <Link to="/privacy-policy" className="text-aurora-teal underline font-semibold">Data Privacy Policy</Link>. I understand health data is processed ephemerally by default.
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            variant={role === 'PATIENT' ? 'primary' : 'blue'}
            className="w-full mt-2"
          >
            <span>Proceed to Verification</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <Link to="/login" className="text-aurora-teal font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </Card>
    </div>
  );
}
