import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCx1dgdLjKswAQGNcthiyZOulXWXRQ73FY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "healthmate-ai-dfec1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "healthmate-ai-dfec1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "healthmate-ai-dfec1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "750516292944",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:750516292944:web:23f702b945e05a78433055",
  measurementId: "G-XJ3PYK1VJ3"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {}
          window.recaptchaVerifier = null;
        }
      }
    });
  }
  return window.recaptchaVerifier;
}

export async function sendFirebasePhoneOtp(phoneNumber, containerId = 'recaptcha-container') {
  if (!phoneNumber) throw new Error('Phone number is required.');
  let formattedPhone = phoneNumber.trim().replace(/[^\d+]/g, '');
  if (!formattedPhone.startsWith('+')) {
    if (formattedPhone.length === 10) formattedPhone = `+91${formattedPhone}`;
    else formattedPhone = `+${formattedPhone}`;
  }
  const verifier = setupRecaptcha(containerId);
  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}

export async function verifyFirebasePhoneOtp(otpCode) {
  if (!window.confirmationResult) {
    return false;
  }
  try {
    const result = await window.confirmationResult.confirm(otpCode.trim());
    return !!result.user;
  } catch (err) {
    console.warn('Firebase confirmation check notice:', err.message);
    return false;
  }
}

export default app;
