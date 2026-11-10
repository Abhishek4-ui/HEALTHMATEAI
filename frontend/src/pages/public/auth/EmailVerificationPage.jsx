import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function EmailVerificationPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <Card className="p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Your Email</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          We have dispatched a verification link to your inbox. Please click the link to confirm ownership of your email address.
        </p>
        <div className="pt-2">
          <Link to="/login">
            <Button size="sm" variant="primary" className="w-full">
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
