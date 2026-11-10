import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">404</div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Page Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4 text-aurora-midnight" />
            <span>Go to Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
