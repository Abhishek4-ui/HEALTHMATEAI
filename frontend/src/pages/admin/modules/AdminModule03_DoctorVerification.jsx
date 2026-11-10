import React, { useState } from 'react';
import { 
  Award, 
  Check, 
  X, 
  FileText, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck,
  CheckCircle2 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function AdminModule03_DoctorVerification() {
  const [queue, setQueue] = useState([
    {
      id: 'req_981',
      doctorName: 'Dr. Ananya Roy',
      email: 'ananya.roy@healthmate.ai',
      specialization: 'Dermatology',
      stateCouncil: 'Delhi Medical Council',
      registrationNumber: 'DMC/R/98214',
      qualifications: 'MBBS, MD (Dermatology)',
      experienceYears: 8,
      submittedAt: '2026-11-09T18:30:00Z',
      documents: [
        { name: 'DMC_Registration_Certificate.pdf', type: 'State Council Reg' },
        { name: 'AIIMS_MD_Degree_Certificate.pdf', type: 'Specialist Degree' }
      ]
    }
  ]);

  const { addToast } = useToast();

  const handleAction = (id, decision) => {
    setQueue(prev => prev.filter(item => item.id !== id));
    addToast({
      type: decision === 'APPROVED' ? 'success' : 'warning',
      title: decision === 'APPROVED' ? 'Doctor Approved' : 'Doctor Rejected',
      message: `Practitioner moved to ${decision === 'APPROVED' ? 'CREDENTIAL_VERIFIED' : 'REJECTED'}. Audit log emitted.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Doctor Credential Verification Queue
            </h2>
            <Badge variant="violet">Approval Workflow</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify medical registration numbers against State Council registries before granting appointment rights.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center shrink-0">
          <Award className="w-6 h-6" />
        </div>
      </div>

      {queue.length > 0 ? (
        <div className="space-y-6">
          {queue.map((req) => (
            <Card key={req.id} className="p-6 sm:p-8 space-y-6 border-aurora-violet/50">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{req.doctorName}</h3>
                  <p className="text-xs text-aurora-teal font-semibold">{req.specialization} • {req.qualifications}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{req.email} • {req.experienceYears} Years Exp</p>
                </div>
                <Badge variant="amber">PENDING_ADMIN_REVIEW</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aurora-midnight space-y-1">
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Medical Council Registration</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">{req.registrationNumber}</div>
                  <div className="text-slate-500">{req.stateCouncil}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-aurora-midnight space-y-2">
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Submitted Verification Documents</div>
                  {req.documents.map((d, di) => (
                    <div key={di} className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{d.name}</span>
                      <span className="text-aurora-teal font-bold">{d.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button size="sm" variant="danger" onClick={() => handleAction(req.id, 'REJECTED')}>
                  <X className="w-3.5 h-3.5" />
                  <span>Reject Application</span>
                </Button>
                <Button size="sm" variant="violet" onClick={() => handleAction(req.id, 'APPROVED')}>
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Grant Credentials</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="Verification Queue is Clear"
          description="There are currently no doctor credential applications awaiting administrative review."
        />
      )}
    </div>
  );
}
