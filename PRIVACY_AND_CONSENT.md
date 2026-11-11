# HealthMate AI — Healthcare Privacy & Consent Policy

**Document Version:** 1.0.0  
**Statutory Framework:** Digital Personal Data Protection (DPDP) Act 2023 (India) & Telemedicine Practice Guidelines 2020  
**Data Storage Model:** Zero-Trust Ephemeral By Default

---

## 1. Principles of Privacy by Design

HealthMate AI is architected from the ground up to protect sensitive health data:

1. **Principle of Ephemeral Default:**
   - Conversations with AI, symptom inquiries, preliminary triage results, and report OCR text extractions are temporary by default.
   - They reside exclusively in volatile RAM via Redis and expire automatically through strict TTL counters.
2. **Explicit, Granular Consent:**
   - Health records are only persisted to MongoDB Atlas when the patient gives explicit, purpose-specific consent.
3. **Right to Erasure ("Forget Me"):**
   - Patients can trigger `DELETE /api/v1/patient/forget-me` at any time to immediately purge all active temporary session memory buffers.
4. **Legally Mandated Retention Exceptions:**
   - Transactional records (confirmed appointment invoices, digital prescription seals, and payment transaction IDs) are retained strictly as required by Indian healthcare and telemedicine regulations.
