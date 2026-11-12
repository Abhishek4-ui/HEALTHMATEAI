import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { authService } from '../../../services/authService';

export default function LoginPage() {
  const role = 'PATIENT';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please enter both email and password.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({
        email: email.trim(),
        password,
        role: 'PATIENT',
      });
      const data = res.data || res;
      const accessToken = data.accessToken || data.token;
      const userData = data.user || {};

      login('PATIENT', email, userData.fullName || 'Verified Patient', accessToken, userData.id);
      addToast({
        type: 'success',
        title: 'Signed In',
        message: `Welcome back, ${userData.fullName || 'Patient'}!`,
      });

      const redirect = searchParams.get('redirect') || '/patient/dashboard';
      navigate(redirect);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err?.response?.data?.message || err?.message || 'Invalid email or password.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('patient@healthmate.ai');
    setPassword('Password123!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Patient Sign In
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access your personal health records, AI diagnostics, and appointments.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        {/* Login Form (Single Public Role: PATIENT) */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-aurora-teal hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="w-full"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleFillDemo}
            className="w-full text-xs flex items-center justify-center gap-1.5 border-dashed"
          >
            <Sparkles className="w-3.5 h-3.5 text-aurora-teal" />
            <span>Fill Demo Patient (patient@healthmate.ai)</span>
          </Button>
        </form>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          {role === 'ADMINISTRATION' ? (
            <span className="text-[11px] text-slate-400">
              No public admin signup. Administrative accounts are strictly provisioned via system security controls.
            </span>
          ) : (
            <>
              <span>New {role === 'DOCTOR' ? 'practitioner' : 'patient'}? </span>
              <Link to={`/register?role=${role}`} className="text-aurora-teal font-semibold hover:underline">
                Create an account
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
