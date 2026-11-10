import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  User, 
  Stethoscope, 
  ShieldAlert, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function LoginPage() {
  const [role, setRole] = useState('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please provide both your registered email and password.',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(role, email);
      setLoading(false);
      addToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome to HealthMate AI. Signed in as ${role}.`,
      });

      if (role === 'PATIENT') navigate('/patient');
      else if (role === 'DOCTOR') navigate('/doctor');
      else if (role === 'ADMINISTRATION') navigate('/admin');
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign In to HealthMate AI
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Select your authorized role to access clinical, patient, or administrative workspaces.
        </p>
      </div>

      <Card className="p-8 space-y-6">
        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Select Your Role (Strictly Tri-Role)
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
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
              className={`py-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
                role === 'DOCTOR'
                  ? 'bg-aurora-blue text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('ADMINISTRATION')}
              className={`py-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
                role === 'ADMINISTRATION'
                  ? 'bg-aurora-violet text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="registered@healthmate.ai"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] text-aurora-teal hover:underline font-semibold">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            variant={role === 'PATIENT' ? 'primary' : role === 'DOCTOR' ? 'blue' : 'violet'}
            className="w-full mt-2"
          >
            <span>Sign In as {role}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-aurora-teal font-bold hover:underline">
            Register here
          </Link>
        </div>
      </Card>

      <div className="text-center">
        <Link to="/patient" className="text-xs text-slate-400 hover:text-aurora-teal transition-colors font-medium">
          Continue as Anonymous Guest Patient (No Account Required) &rarr;
        </Link>
      </div>
    </div>
  );
}
