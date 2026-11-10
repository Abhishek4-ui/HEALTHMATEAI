import React from 'react';
import Card from '../../components/ui/Card';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms and Conditions</h1>
      <p className="text-xs text-slate-500">Effective Date: November 10, 2026 • Version 1.0.0</p>

      <Card className="p-8 space-y-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Nature of HealthMate AI Platform</h2>
          <p>
            HealthMate AI is an educational, research, and healthcare decision-support platform designed to assist patients in preliminary symptom triage and connect them with certified healthcare practitioners. The artificial intelligence models provide probabilistic evaluations and do NOT constitute a binding clinical diagnosis.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Medical Disclaimer</h2>
          <p className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
            IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, CHEST PAIN, SEVERE BLEEDING, OR LOSS OF CONSCIOUSNESS, CALL 112 (INDIA) OR PROCEED IMMEDIATELY TO THE NEAREST HOSPITAL EMERGENCY DEPARTMENT. NEVER DELAY SEEKING IN-PERSON MEDICAL ATTENTION BASED ON AI TRIAGE ASSESSMENTS.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">3. Tri-Role Access Policy</h2>
          <p>
            Users must register under their authentic legal identity. Doctors must provide a valid State Medical Council or National Medical Commission (NMC) registration number. Any account discovered to have submitted falsified medical qualifications will be immediately suspended and reported to relevant authorities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">4. Telemedicine Practice Standards</h2>
          <p>
            Teleconsultations conducted through HealthMate AI operate in strict accordance with the Telemedicine Practice Guidelines issued by the Board of Governors in supersession of the Medical Council of India (2020).
          </p>
        </section>
      </Card>
    </div>
  );
}
