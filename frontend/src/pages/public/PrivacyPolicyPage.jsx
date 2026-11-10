import React from 'react';
import Card from '../../components/ui/Card';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Data Privacy Policy</h1>
      <p className="text-xs text-slate-500">In accordance with the Digital Personal Data Protection (DPDP) Act, 2023 (India)</p>

      <Card className="p-8 space-y-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Ephemeral Patient Data by Default</h2>
          <p>
            HealthMate AI guarantees that all patient symptom inputs, uploaded medical diagnostic files, vital health statistics, and AI chat dialogues are treated as <strong>ephemeral data</strong>. This information is processed exclusively in temporary memory buffers (Redis TTL) and automatically expunged after session completion.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Right to Erasure (§12 DPDP Act 2023)</h2>
          <p>
            Patients may trigger an instant, cryptographic purge of all temporary data associated with their session by clicking the "Forget Me" button accessible across the interface. This immediately evicts all keys from Redis with zero residual traces in cold storage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">3. Statutory Transactional Retention</h2>
          <p>
            Confirmed doctor appointments, payment invoices, and digitally signed clinical prescriptions are retained for statutory periods in accordance with the National Medical Commission Telemedicine Guidelines (3 years) and the Income Tax Act (7 years).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">4. Data Principal Rights</h2>
          <p>
            Under Sections 11, 12, and 13 of the DPDP Act 2023, you have the right to request a summary of your data, update inaccurate records, withdraw consent, and seek grievance redressal from our designated Data Protection Officer (DPO).
          </p>
        </section>
      </Card>
    </div>
  );
}
