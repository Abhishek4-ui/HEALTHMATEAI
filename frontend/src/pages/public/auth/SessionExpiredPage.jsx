import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function SessionExpiredPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <Card className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-aurora-amber flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Session Expired</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your session has expired. Please sign in again to continue.
        </p>
        <div className="pt-2">
          <Link to="/login">
            <Button size="sm" variant="primary" className="w-full">
              Sign In
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
