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
        title: 'Recovery Link Sent',
        message: 'Password reset instructions dispatched to your verified email.',
      });
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Reset Password
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Enter your registered email address to receive secure reset credentials.
        </p>
      </div>

      <Card className="p-8 space-y-6">
        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-aurora-teal flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Instructions Sent</h3>
            <p className="text-xs text-slate-500 mb-6">
              Check your inbox at <strong>{email}</strong> for your secure password reset token.
            </p>
            <Link to="/reset-password">
              <Button size="sm" variant="primary">Proceed to Reset Token</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} variant="primary" className="w-full">
              <span>Send Reset Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-slate-500 hover:text-aurora-teal font-semibold">
            &larr; Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
