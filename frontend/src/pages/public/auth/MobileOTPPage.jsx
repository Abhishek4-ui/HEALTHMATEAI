import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight, ShieldCheck, KeyRound, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { apiClient } from '../../../services/api';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../../../config/firebase';

export default function MobileOTPPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const phone = location.state?.phone || '';
  const role = location.state?.role || 'PATIENT';
  const email = location.state?.email || 'patient@healthmate.ai';
  const name = location.state?.name || '';

  // Inputs are strictly EMPTY by default (NO automatic autofill, NO on-screen code leakage)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [firebaseActive, setFirebaseActive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Dispatch OTP on initial mount if email or phone is present
    if (email || phone) {
      handleResend(true);
    }

    // Initialize Firebase phone verification session in parallel if phone is present
    if (phone) {
      sendFirebasePhoneOtp(phone)
        .then(() => {
          if (isMounted) {
            setFirebaseActive(true);
          }
        })
        .catch(err => {
          console.warn('Firebase SMS dispatch notice:', err?.message);
        });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      if (cleaned.length === 6) {
        setOtp(cleaned.split(''));
        const lastInput = document.getElementById('otp-input-5');
        if (lastInput) lastInput.focus();
        return;
      }
    }

    const digit = cleaned.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      addToast({ type: 'warning', title: 'Incomplete Code', message: 'Please enter all 6 digits of your verification code.' });
      return;
    }

    setLoading(true);
    try {
      let isVerified = false;

      // 1. Check with Google Firebase Phone Auth if session is active
      if (firebaseActive) {
        try {
          const fbSuccess = await verifyFirebasePhoneOtp(enteredOtp);
          if (fbSuccess) isVerified = true;
        } catch (fbErr) {
          console.warn('Firebase verify check notice:', fbErr?.message);
        }
      }

      // 2. Check with Backend Carrier SMS and Database API
      if (!isVerified) {
        try {
          await apiClient.post('/auth/otp/verify', {
            target: email,
            phone,
            type: 'EMAIL',
            otp: enteredOtp,
            purpose: 'VERIFICATION',
          });
          isVerified = true;
        } catch (backendErr) {
          if (phone) {
            try {
              await apiClient.post('/auth/otp/verify', {
                target: phone,
                type: 'MOBILE',
                otp: enteredOtp,
                purpose: 'VERIFICATION',
              });
              isVerified = true;
            } catch (phoneErr) {
              throw backendErr;
            }
          } else {
            throw backendErr;
          }
        }
      }

      if (!isVerified) {
        throw new Error('Verification failed. Invalid or expired code.');
      }

      // Login and redirect to portal dashboard upon genuine cryptographic verification
      login(role, email, name);
      addToast({
        type: 'success',
        title: 'Account Verified',
        message: 'Welcome to your HealthMate AI portal.',
      });

      if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (role === 'ADMINISTRATION') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      console.error('OTP verification failed:', err);
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: err.response?.data?.message || err.message || 'Incorrect or expired verification code. Please request a new code.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (silent = false) => {
    setResending(true);
    try {
      // 1. Try Firebase Phone SMS re-send if phone exists
      if (phone) {
        sendFirebasePhoneOtp(phone)
          .then(() => setFirebaseActive(true))
          .catch(() => {});
      }

      // 2. Dispatch backend carrier SMS & Email
      await apiClient.post('/auth/otp/send', {
        target: email,
        phone,
        type: 'EMAIL',
        purpose: 'VERIFICATION',
      });

      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-input-0');
      if (firstInput) firstInput.focus();

      if (!silent) {
        addToast({
          type: 'success',
          title: 'Code Dispatched',
          message: 'A fresh verification code has been dispatched to your phone and email.',
        });
      }
    } catch (err) {
      console.warn('OTP resend notice:', err);
      if (!silent) {
        addToast({
          type: 'error',
          title: 'Resend Limit',
          message: err.response?.data?.message || 'Please wait before requesting another code.',
        });
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mb-2 border border-teal-100 dark:border-teal-900/50 shadow-sm">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Security Verification</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We have dispatched a 6-digit verification code to
          <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
            {email} {phone ? `• ${phone}` : ''}
          </span>
        </p>
      </div>

      <Card className="p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-center">
              Enter 6-Digit Code
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  autoFocus={idx === 0}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition"
                />
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} variant="primary" className="w-full py-2.5">
            <span>Verify & Enter Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span>Didn't receive the code?</span>
            <button
              type="button"
              disabled={resending}
              onClick={() => handleResend(false)}
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
            >
              {resending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
              <span>{resending ? 'Sending...' : 'Resend Code'}</span>
            </button>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
        <span>End-to-End Encrypted Verification • HealthMate AI Security</span>
      </div>
    </div>
  );
}
