import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      addToast({
        type: 'success',
        title: 'Reset Link Sent',
        message: 'Password reset link sent to your email.',
      });
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Forgot Password
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter your email to receive a password reset link.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-aurora-teal flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Check Your Email</h3>
            <p className="text-xs text-slate-500 mb-4">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link to="/reset-password">
              <Button size="sm" variant="primary">Enter Reset Token</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button type="submit" loading={loading} variant="primary" className="w-full">
              <span>Send Reset Link</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>
        )}

        <div className="text-center pt-1">
          <Link to="/login" className="text-xs text-slate-500 hover:text-aurora-teal">
            &larr; Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
