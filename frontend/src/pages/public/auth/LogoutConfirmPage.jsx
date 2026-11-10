import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function LogoutConfirmPage() {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    logout();
    addToast({
      type: 'success',
      title: 'Session Concluded',
      message: 'You have been safely signed out.',
    });
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <Card className="p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-aurora-midnight text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto">
          <LogOut className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign Out Confirmation</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Are you sure you want to end your current authenticated session? All local session cache tokens will be wiped.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleConfirmLogout}>
            Confirm Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
