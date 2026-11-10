import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
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

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      addToast({ type: 'warning', title: 'Incomplete Code', message: 'Please enter all 6 digits.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(role, email);
      addToast({
        type: 'success',
        title: 'Verified',
        message: 'Phone verification complete.',
      });
      if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mx-auto mb-3">
          <Phone className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Verify Phone Number
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter the 6-digit code sent to <strong>{phone}</strong>.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex justify-between gap-1.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-10 h-11 text-center text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-slate-900 dark:text-white"
              />
            ))}
          </div>

          <Button type="submit" loading={loading} variant="primary" className="w-full">
            <span>Verify & Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <span>Didn't receive code? </span>
          <button
            type="button"
            onClick={() => addToast({ type: 'info', title: 'Code Resent', message: 'A new code has been sent.' })}
            className="text-aurora-teal font-semibold hover:underline"
          >
            Resend
          </button>
        </div>
      </Card>
    </div>
  );
}
