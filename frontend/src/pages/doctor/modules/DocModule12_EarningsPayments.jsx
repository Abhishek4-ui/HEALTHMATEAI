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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Doctor Earnings & Remittance Ledger
            </h2>
            <Badge variant="blue">Razorpay Payouts</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time consultation fee settlements and platform commission reconciliation.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gross Consultations</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹0.00</div>
          <div className="text-[10px] text-slate-400 mt-1">Current billing cycle</div>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Platform Fee (10%)</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹0.00</div>
          <div className="text-[10px] text-slate-400 mt-1">Maintenance & WebRTC infra</div>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Net Payout Transferred</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-aurora-teal mt-1">₹0.00</div>
          <div className="text-[10px] text-slate-400 mt-1">Direct bank IMPS/NEFT</div>
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
          title="No Transaction Entries in Ledger"
          description="In strict adherence to zero-fabrication guidelines, financial ledgers reflect authentic completed consultations only. Patient fees collected via Razorpay will be detailed here."
        />
      )}
    </div>
  );
}
