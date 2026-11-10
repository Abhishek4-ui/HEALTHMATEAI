import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldAlert } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function SessionExpiredPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <Card className="p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 text-aurora-amber flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Session Expired</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          In accordance with our zero-trust ephemeral security policy, your temporary session has concluded. No health context remains in memory.
        </p>
        <div className="pt-2">
          <Link to="/login">
            <Button size="sm" variant="primary" className="w-full">
              Sign In Again
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
