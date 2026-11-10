import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Phone, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function MobileOTPPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const phone = location.state?.phone || '+91 9876543210';
  const role = location.state?.role || 'PATIENT';
  const email = location.state?.email || 'patient@healthmate.ai';

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      addToast({ type: 'warning', title: 'Incomplete OTP', message: 'Please enter all 6 digits.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(role, email);
      addToast({
        type: 'success',
        title: 'Phone Verified',
        message: 'Your contact verification is complete.',
      });
      if (role === 'DOCTOR') navigate('/doctor');
      else navigate('/patient');
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mx-auto mb-4">
          <Phone className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Verify Mobile OTP
        </h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          A 6-digit cryptographic verification code has been dispatched to <strong>{phone}</strong>.
        </p>
      </div>

      <Card className="p-8 space-y-6">
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-12 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
              />
            ))}
          </div>

          <Button type="submit" loading={loading} variant="primary" className="w-full">
            <span>Verify & Authenticate</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <span>Didn't receive code? </span>
          <button
            type="button"
            onClick={() => addToast({ type: 'info', title: 'OTP Resent', message: 'A new 6-digit code has been dispatched.' })}
            className="text-aurora-teal font-bold hover:underline"
          >
            Resend OTP
          </button>
        </div>
      </Card>
    </div>
  );
}
