import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Stethoscope, 
  Mail, 
  Lock, 
  Phone, 
  Award, 
  ArrowRight
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
      addToast({ type: 'warning', title: 'Missing Information', message: 'Please complete all required fields.' });
      return;
    }
    if (!formData.consentGranted) {
      addToast({ type: 'warning', title: 'Consent Required', message: 'Please review and accept the privacy terms.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({
        type: 'success',
        title: 'Account Registered',
        message: 'A verification OTP has been sent.',
      });
      navigate('/verify-otp', { state: { email: formData.email, phone: formData.phone, role } });
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Create Account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign up as a patient or registered doctor.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        {/* Role Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Role
          </label>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                role === 'PATIENT'
                  ? 'bg-aurora-teal text-aurora-midnight shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                role === 'DOCTOR'
                  ? 'bg-aurora-blue text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor</span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={role === 'DOCTOR' ? 'Dr. Name' : 'Full Name'}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Doctor-Specific Fields */}
          {role === 'DOCTOR' && (
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-3">
              <div className="text-xs font-semibold text-aurora-blue flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Medical Credential
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.medicalRegistrationNumber}
                  onChange={(e) => setFormData({ ...formData, medicalRegistrationNumber: e.target.value })}
                  placeholder="e.g. DMC/12345"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State Medical Council
                </label>
                <select
                  value={formData.stateMedicalCouncil}
                  onChange={(e) => setFormData({ ...formData, stateMedicalCouncil: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                >
                  <option value="Delhi Medical Council">Delhi Medical Council</option>
                  <option value="Karnataka Medical Council">Karnataka Medical Council</option>
                  <option value="Maharashtra Medical Council">Maharashtra Medical Council</option>
                  <option value="Tamil Nadu Medical Council">Tamil Nadu Medical Council</option>
                  <option value="Other State Council">Other State Council</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specialization
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>
            </div>
          )}

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="consentGranted"
              checked={formData.consentGranted}
              onChange={(e) => setFormData({ ...formData, consentGranted: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-aurora-teal focus:ring-aurora-teal"
            />
            <label htmlFor="consentGranted" className="text-xs text-slate-600 dark:text-slate-400">
              I agree to the <Link to="/terms" className="text-aurora-teal underline">Terms of Service</Link> and <Link to="/privacy" className="text-aurora-teal underline">Privacy Policy</Link>.
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            variant={role === 'PATIENT' ? 'primary' : 'blue'}
            className="w-full"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <Link to="/login" className="text-aurora-teal font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
