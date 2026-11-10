import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-aurora-teal/10 text-aurora-teal flex items-center justify-center mx-auto mb-6">
          <Activity className="w-8 h-8" />
        </div>
        <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-2">404</div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Healthcare Route Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          The requested medical portal page or clinical resource does not exist or has been relocated within the ecosystem.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="md">
              <Home className="w-4 h-4 text-aurora-midnight" />
              <span>Return to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
