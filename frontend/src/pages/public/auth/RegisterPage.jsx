import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Heart
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';
import { apiClient } from '../../../services/api';

export default function RegisterPage() {
  const role = 'PATIENT';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Prefer not to say',
    bloodGroup: 'Unknown',
    consentGranted: false,
  });
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
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
    try {
      const payload = {
        fullName: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        role: 'PATIENT',
      };

      await apiClient.post('/auth/register', payload);

      addToast({
        type: 'success',
        title: 'Account Registered',
        message: 'A 6-digit verification code has been dispatched to your email.',
      });

      navigate('/verify-otp', { 
        state: { 
          email: formData.email, 
          phone: formData.phone, 
          role: 'PATIENT', 
          name: formData.name
        } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg = err.message || err.code || 'Registration failed.';
      
      // If account already exists, request OTP so user can log in
      if (errMsg.toLowerCase().includes('already exists')) {
        addToast({ 
          type: 'info', 
          title: 'Account Exists', 
          message: 'An account with this email already exists. Sending verification code...' 
        });
        try {
          await apiClient.post('/auth/otp/send', { target: formData.email, type: 'EMAIL', purpose: 'VERIFICATION' });
          navigate('/verify-otp', {
            state: {
              email: formData.email,
              phone: formData.phone,
              role: 'PATIENT',
              name: formData.name,
            }
          });
          return;
        } catch (otpErr) {
          navigate('/verify-otp', {
            state: {
              email: formData.email,
              phone: formData.phone,
              role: 'PATIENT',
              name: formData.name,
            }
          });
          return;
        }
      }

      addToast({ type: 'error', title: 'Registration Failed', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Create Patient Account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign up to manage your medical records, book appointments, and access AI health tools.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        {/* Patient Registration Form (Single Public Role: PATIENT) */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
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
              Password *
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Blood Group
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
            >
              <option value="Unknown">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

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
              I agree to the <Link to="/terms" className="text-aurora-teal underline">Terms of Service</Link> and <Link to="/privacy" className="text-aurora-teal underline">DPDP Act 2023 Privacy Policy</Link>.
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="w-full"
          >
            <span>Create Patient Account</span>
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
