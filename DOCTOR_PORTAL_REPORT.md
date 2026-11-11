# HEALTHMATE AI — DOCTOR PORTAL REPORT
**Clinical Workflows, Pharmacovigilance, Credential Verification & Telemedicine**
**Date:** November 11, 2026 | **Classification:** Clinical Provider Operations

---

## 1. Overview & Doctor Modules
The Doctor Portal provides registered physicians with comprehensive practice management tools across 13 dedicated modules:

1. **Dashboard (`DocModule01_Dashboard.jsx`):** Daily appointment queue, patient triage urgency alerts, and scheduled consultations.
2. **Profile & Registration (`DocModule02_Profile.jsx`):** National Medical Commission (NMC) registration number, State Medical Council affiliation, verified qualifications (MBBS, MD, DM, etc.).
3. **Verification Status (`DocModule03_VerificationStatus.jsx`):** State and National council verification status badge (`VERIFIED`, `PENDING_REVIEW`, `SUSPENDED`).
4. **Appointments Management (`DocModule04_AppointmentManagement.jsx`):** Calendar, reschedule, cancel, and patient check-in workflows.
5. **Slot & Availability (`DocModule05_AvailabilityManagement.jsx`):** Day-of-week slot configuration and emergency consultation toggles.
6. **Consultation Room (`DocModule06_PatientConsultation.jsx`):** Clinical notes recording, ICD-10 diagnostic tagging, and vitals review.
7. **Telehealth Video (`DocModule07_VideoConsultation.jsx`):** Secure WebRTC consultation room with encrypted real-time audio/video.
8. **Consented Reports (`DocModule08_ConsentedReports.jsx`):** Time-bounded access to patient diagnostic lab reports, ECGs, and imaging.
9. **Rx Pharmacovigilance Engine (`DocModule09_PrescriptionManagement.jsx`):** Drug-drug interaction checking with canonical safety states (`SAFE`, `MODERATE`, `SEVERE_CONTRAINDICATION`, `NOT_ASSESSED`).
10. **Consultation History (`DocModule10_ConsultationHistory.jsx`):** Longitudinal record of completed encounters.
11. **Notifications (`DocModule11_Notifications.jsx`):** Urgent lab result alerts, patient arrivals, and appointment updates.
12. **Earnings & Payouts (`DocModule12_EarningsPayments.jsx`):** Consultation fee tracking, bank settlement records, and Razorpay payouts.
13. **Settings (`DocModule13_Settings.jsx`):** Telemedicine consultation fees, consultation durations, and notification preferences.

---

## 2. Clinical Pharmacovigilance Enforcement
- Unassessed drug combinations are explicitly tagged as `NOT_ASSESSED`.
- High-risk contraindications trigger blocking alerts requiring explicit clinical override before prescription issuance.
