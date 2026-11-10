import React, { useState } from 'react';
import { 
  Wallet, 
  IndianRupee, 
  ArrowUpRight, 
  Download, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function DocModule12_EarningsPayments() {
  const [ledger, setLedger] = useState([]);
  const { addToast } = useToast();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Earnings & Payouts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Consultation fees and settlement history.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gross Consultations</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹0</div>
          <div className="text-[10px] text-slate-400 mt-1">This month</div>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Platform Fee (10%)</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹0</div>
          <div className="text-[10px] text-slate-400 mt-1">Service & processing</div>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Net Payout</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-aurora-teal mt-1">₹0</div>
          <div className="text-[10px] text-slate-400 mt-1">Bank transfer</div>
        </Card>
      </div>

      {/* Ledger Table */}
      {ledger.length > 0 ? (
        <Card className="p-6">
          {/* Ledger Table rows */}
        </Card>
      ) : (
        <EmptyState
          icon={Wallet}
          title="No transactions yet"
          description="Completed consultation payments will appear here."
        />
      )}
    </div>
  );
}
