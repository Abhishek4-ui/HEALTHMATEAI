import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  User, 
  Stethoscope, 
  ShieldAlert
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') || 'PATIENT').toUpperCase();
  const validRole = ['PATIENT', 'DOCTOR', 'ADMINISTRATION'].includes(initialRole) ? initialRole : 'PATIENT';

  const [role, setRole] = useState(validRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const paramRole = searchParams.get('role');
    if (paramRole && ['PATIENT', 'DOCTOR', 'ADMINISTRATION'].includes(paramRole.toUpperCase())) {
      setRole(paramRole.toUpperCase());
    }
  }, [searchParams]);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e) => {
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
    setTimeout(() => {
      login(role, email);
      setLoading(false);
      addToast({
        type: 'success',
        title: 'Signed In',
        message: `Welcome. Signed in as ${role.toLowerCase()}.`,
      });

      if (role === 'PATIENT') navigate('/patient/dashboard');
      else if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (role === 'ADMINISTRATION') navigate('/admin/dashboard');
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Sign In
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Select your role to access your account.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Role
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-aurora-midnight border border-slate-200 dark:border-slate-800">
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

            <button
              type="button"
              onClick={() => setRole('ADMINISTRATION')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
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
            variant={role === 'PATIENT' ? 'primary' : role === 'DOCTOR' ? 'blue' : 'violet'}
            className="w-full"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
