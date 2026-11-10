import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Award, 
  ShieldCheck, 
  AlertCircle, 
  Filter 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';

export default function AdminModule02_DoctorManagement() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const doctors = [
    {
      id: 'doc_1',
      name: 'Dr. Ramesh Kumar',
      specialization: 'Cardiology',
      council: 'Karnataka Medical Council',
      regNumber: 'KMC/2018/98712',
      status: 'CREDENTIAL_VERIFIED',
      joinedAt: '2026-11-08',
    },
    {
      id: 'doc_2',
      name: 'Dr. Ananya Roy',
      specialization: 'Dermatology',
      council: 'Delhi Medical Council',
      regNumber: 'DMC/R/98214',
      status: 'SOURCE_VERIFIED',
      joinedAt: '2026-11-09',
    }
  ];

  const filtered = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || d.status === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Doctor Accounts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage verified doctors and medical registration status.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by practitioner name or medical council code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
        >
          <option value="ALL">All Accreditation Tiers</option>
          <option value="DISCOVERED">Discovered</option>
          <option value="SOURCE_VERIFIED">Source Verified</option>
          <option value="CREDENTIAL_VERIFIED">Credential Verified</option>
          <option value="APPOINTMENT_ENABLED">Appointment Enabled</option>
        </select>
      </Card>

      {/* Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Doctor Name</th>
                <th className="py-2.5">Specialization</th>
                <th className="py-2.5">State Council</th>
                <th className="py-2.5">Registration No.</th>
                <th className="py-2.5">Accreditation Tier</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-aurora-midnight/50">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{doc.name}</td>
                  <td className="py-3 text-aurora-teal font-medium">{doc.specialization}</td>
                  <td className="py-3 text-slate-500">{doc.council}</td>
                  <td className="py-3 font-mono text-slate-400">{doc.regNumber}</td>
                  <td className="py-3">
                    <Badge variant={doc.status === 'CREDENTIAL_VERIFIED' ? 'teal' : 'amber'}>
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button size="sm" variant="ghost">Inspect</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
