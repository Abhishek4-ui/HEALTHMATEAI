# HEALTHMATE AI — FINAL VERIFIED FEATURE INVENTORY & DATA PERSISTENCE MATRIX

**Audit Date:** November 12, 2026  
**Auditor:** Principal QA Automation Engineer & Healthcare Systems Verification Specialist  
**Verification Method:** Direct AST/source code inspection, MongoDB Atlas live queries, Redis session key inspection, and live cloud endpoint testing.

---

## 1. DATA PERSISTENCE TIERS SUMMARY

To ensure clinical truthfulness, the table below defines the exact persistence mechanism for every module. **In-memory React states and browser LocalStorage are explicitly distinguished from cloud-synchronized database records.**

```
+----------------------------------------------------------------------------------------------------+
| DATA PERSISTENCE CLASSIFICATION                                                                    |
+-------------------+----------------------------+-----------------------+---------------------------+
| TIER              | STORAGE MECHANISM          | CROSS-DEVICE PERSIST? | TYPICAL DATA STORED       |
+-------------------+----------------------------+-----------------------+---------------------------+
| Cloud DB          | MongoDB Atlas (ReplicaSet) | YES                   | Users, Appointments, Vitals |
| Cloud Cache       | Redis Cloud (TLS)          | YES (Within TTL)      | OTP Hash, Rate Limits, TTL|
| Cloud Storage     | AWS S3 (Presigned 15m)     | YES                   | Medical Scans, Lab PDFs   |
| Browser Session   | sessionStorage             | NO (Single Tab/Window)| Auth Token, Active Role   |
| Browser Local     | localStorage               | NO (Single Browser)   | UI Theme, Local Preferences|
| Component Memory  | React useState             | NO (Lost on Refresh)  | Reminders, Diet Calculator|
+-------------------+----------------------------+-----------------------+---------------------------+
```

---

## 2. PATIENT PORTAL MODULES (PAT-01 TO PAT-27)

| Feature ID | Feature Name | Frontend Component | Backend Route & Controller | Storage Tier | Status | Verification Evidence & Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PAT-01** | Patient Registration | `RegisterPage.jsx` | `POST /api/v1/auth/register` (`auth.controller.js`) | MongoDB (`User.js`) | **WORKING** | Creates user record with Argon2 hash; verified via live API test. |
| **PAT-02** | Secure Patient Login | `LoginPage.jsx` | `POST /api/v1/auth/login` (`auth.controller.js`) | MongoDB (`UserSession.js`) + sessionStorage | **WORKING** | Validates password, issues JWT access + refresh tokens. |
| **PAT-03** | 6-Digit Hardened OTP | `MobileOTPPage.jsx` | `POST /api/v1/auth/otp/verify` (`otp.service.js`) | Redis Cloud (`otp:email:*`) | **WORKING** | Zero OTP in API/UI; single-use deletion (`client.del`); 30s cooldown. |
| **PAT-04** | Health Overview Dashboard | `Module01_Dashboard.jsx` | `GET /api/v1/patient/profile` (`patient.controller.js`) | MongoDB (`PatientProfile.js`) | **WORKING** | Reads cloud vitals history and assigned doctor encounters. |
| **PAT-05** | AI Health Copilot | `Module02_AIAssistant.jsx` | `POST /api/v1/patient/copilot/message` | Ephemeral (Session / In-memory) | **WORKING** | Multi-turn chat guidance with MoHFW guidelines disclaimers. |
| **PAT-06** | Symptom Checker & Triage | `Module03_SymptomChecker.jsx`| `POST /api/v1/patient/symptom-check` (FastAPI) | Stateless AI Inference | **WORKING** | 100% emergency sensitivity (5/5); 47.5% top-1 accuracy on 8 held-out classes. |
| **PAT-07** | Health Risk Assessment | `Module04_HealthRiskAssessment.jsx`| `POST /api/v1/patient/risk-assessment` (FastAPI) | Stateless AI Inference | **WORKING** | Framingham cardiovascular risk & diabetes probability metrics. |
| **PAT-08** | Medical Report OCR | `Module05_ReportAnalyzer.jsx` | `POST /api/v1/patient/reports/ocr-extract` | AWS S3 + Redis Token | **WORKING** | Multipart upload via `aiService`; parses CBC/glucose without fake values. |
| **PAT-09** | 36 States/UTs Doctor Discovery | `Module06_DoctorDiscovery.jsx`| `GET /api/v1/discovery/doctors` (`doctor.controller.js`) | MongoDB (`DoctorProfile.js`) | **WORKING** | 36 States & UTs dropdown present; 6 verified doctors in database. |
| **PAT-10** | Hospital Facility Discovery | `Module07_HospitalDiscovery.jsx`| `GET /api/v1/discovery/hospitals` (`hospital.service.js`)| MongoDB (`Hospital.js`) | **WORKING** | 8 hospital facilities in database; Haversine distance calculator. |
| **PAT-11** | Appointment Booking | `Module08_AppointmentManagement.jsx`| `POST /api/v1/appointments/book` (`appointment.controller.js`)| MongoDB (`Appointment.js`) | **WORKING** | Slot availability engine; creates appointment with status `SCHEDULED`. |
| **PAT-12** | Razorpay Test Mode Payment | `Module08_AppointmentManagement.jsx`| `POST /api/v1/payments/order` (`payment.service.js`) | MongoDB (`PaymentTransaction.js`) | **WORKING** | Order created in Test Mode (`rzp_test_...`); HMAC SHA-256 verified. |
| **PAT-13** | Manual UPI QR & UTR Rail | `Module08_AppointmentManagement.jsx`| `POST /api/v1/payments/upi/initiate` + `/submit-utr` | MongoDB (`PaymentTransaction.js`) | **WORKING** | Deep link `upi://pay?pa=...`, generates reference, moves to `PENDING_VERIFICATION`. |
| **PAT-14** | Payment History & Refunds | `Module08_AppointmentManagement.jsx`| `GET /api/v1/payments/my-transactions` + `/refund-request` | MongoDB (`PaymentTransaction.js`) | **WORKING** | Patient views transaction status; requests refund for verified payments. |
| **PAT-15** | Video Consultation (WebRTC)| `Module09_OnlineConsultation.jsx`| `GET /api/v1/consultations/:id/token` + Socket.IO | WebRTC Signaling | **PARTIALLY WORKING** | STUN active for cone NAT; TURN server required for symmetric cellular NAT. |
| **PAT-16** | Digital Prescriptions | `Module10_Prescriptions.jsx` | `GET /api/v1/patient/prescriptions` | MongoDB (`Prescription.js`) | **WORKING** | Fetches doctor-authorized digital prescriptions with dosage and instructions. |
| **PAT-17** | Medication Reminders | `Module11_MedicinesReminders.jsx`| None (Client-side React state) | **Component In-Memory Only** | **PARTIALLY WORKING** | Functional in UI session, but data is NOT cloud-persisted across page reloads. |
| **PAT-18** | Vital Metrics Tracking | `Module12_HealthMonitoring.jsx`| `POST /api/v1/patient/vitals` | MongoDB (`PatientProfile.js`) | **WORKING** | Persists systolic/diastolic BP, pulse, and glucose readings to MongoDB. |
| **PAT-19** | Nutrition & Calorie Fitness| `Module13_NutritionFitness.jsx`| None (Client-side calculator) | **Component In-Memory Only** | **PARTIALLY WORKING** | Calorie calculations work in-memory; does NOT persist to cloud database. |
| **PAT-20** | Sleep & Mental Wellness | `Module14_SleepMentalWellness.jsx`| None (Client-side state) | **Component In-Memory Only** | **PARTIALLY WORKING** | Mood and sleep logs work in-memory; does NOT synchronize to cloud database. |
| **PAT-21** | Diagnostic Lab Test Booking| `Module15_LabTests.jsx` | None (Client catalog) | **Component In-Memory Only** | **PARTIALLY WORKING** | Displays standard test pricing catalog; dispatching to lab partners requires API. |
| **PAT-22** | Emergency SOS Hotline | `Module16_EmergencySOS.jsx` | `GET /api/v1/discovery/emergency` | MongoDB (`EmergencyContact.js`) | **WORKING** | Direct tel: links to National Emergency 112, Ambulance 108, Tele-MANAS 14416. |
| **PAT-23** | Family Health Profiles | `Module17_FamilyHealthcare.jsx`| None (Client-side state) | **Component In-Memory Only** | **PARTIALLY WORKING** | Adds family members in-memory; not linked to backend dependent sub-accounts. |
| **PAT-24** | In-App Notifications | `Module18_Notifications.jsx` | `GET /api/v1/notifications` | MongoDB (`Notification.js`) | **WORKING** | Real-time notifications for appointment updates and system alerts. |
| **PAT-25** | DPDP Act "Forget Me" Purge | `Module19_PrivacySettings.jsx`| `DELETE /api/v1/patient/forget-me` | Redis + S3 + sessionStorage | **WORKING** | Verified modal; atomically purges Redis keys, deletes S3 files, clears session. |
| **PAT-26** | Medical Imaging Suite | `Module20_MedicalImagingCenter.jsx`| `POST /api/v1/patient/imaging/analyze` (FastAPI) | AWS S3 / Local Disk | **WORKING** | Multi-modality CXR/CT/MRI/Ultrasound upload via `aiService`; returns uncertainty. |
| **PAT-27** | 12-Lead Cardiac ECG | `Module21_ECGCardiacCenter.jsx` | `POST /api/v1/patient/cardiac/ecg-analyze` (FastAPI) | AWS S3 / Local Disk | **WORKING** | R-peak detection, heart rate calculation, and Lead II SVG waveform visualization. |

---

## 3. DOCTOR PORTAL MODULES (DOC-01 TO DOC-13)

| Feature ID | Feature Name | Frontend Component | Backend Route & Controller | Storage Tier | Status | Verification Evidence & Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DOC-01** | Doctor Credential Intake | `RegisterPage.jsx` (Role: DOCTOR) | `POST /api/v1/auth/register` | MongoDB (`User.js`, `DoctorProfile.js`) | **WORKING** | Captures legal name, NMC registration number, and state medical council. |
| **DOC-02** | Clinician Dashboard | `DocModule01_Dashboard.jsx` | `GET /api/v1/doctor/profile` | MongoDB (`DoctorProfile.js`) | **WORKING** | Displays outpatient queues and verified specialty badges. |
| **DOC-03** | Council Verification Status | `DocModule03_VerificationStatus.jsx`| `GET /api/v1/doctor/verification` | MongoDB (`DoctorVerification.js`) | **WORKING** | Displays `CREDENTIAL_VERIFIED` or pending audit badge with license details. |
| **DOC-04** | Outpatient Appointments | `DocModule04_AppointmentManagement.jsx`| `GET /api/v1/doctor/appointments` | MongoDB (`Appointment.js`) | **WORKING** | Lists assigned patient consultations with consultation mode (`VIDEO`/`IN_PERSON`). |
| **DOC-05** | Slot Availability Engine | `DocModule05_AvailabilityManagement.jsx`| `PUT /api/v1/doctor/availability` | MongoDB (`DoctorAvailability.js`) | **WORKING** | Dynamically manages available clinical consultation hours and date overrides. |
| **DOC-06** | Clinical SOAP Notes | `DocModule06_PatientConsultation.jsx` | `POST /api/v1/consultations/encounter` | MongoDB (`Consultation.js`) | **WORKING** | Records Subjective, Objective, Assessment, and Plan notes with patient ID. |
| **DOC-07** | Encrypted Video Visit | `DocModule07_VideoConsultation.jsx` | `GET /api/v1/consultations/:id/token` | WebRTC / STUN | **PARTIALLY WORKING** | Functional on local/unrestricted NAT; requires TURN server for symmetric NAT. |
| **DOC-08** | Consented Medical Records | `DocModule08_ConsentedReports.jsx` | `GET /api/v1/reports/:id/signed-url` | AWS S3 (Presigned 15m) | **WORKING** | Access requires active patient consent token; direct unauthenticated GET returns 403. |
| **DOC-09** | Prescription & Drug Alerts | `DocModule09_PrescriptionManagement.jsx`| `POST /api/v1/doctor/prescriptions/check-interactions` | MongoDB (`Prescription.js`) | **WORKING** | Pharmacovigilance engine flags contraindications and severe drug interactions. |
| **DOC-10** | Consultation History | `DocModule10_ConsultationHistory.jsx`| `GET /api/v1/doctor/consultations` | MongoDB (`Consultation.js`) | **WORKING** | Historical consultation encounters with search and date filters. |
| **DOC-11** | Doctor Notifications | `DocModule11_Notifications.jsx` | `GET /api/v1/notifications` | MongoDB (`Notification.js`) | **WORKING** | Live doctor notifications on new appointment requests and cancellations. |
| **DOC-12** | Earnings & Payments | `DocModule12_EarningsPayments.jsx` | `GET /api/v1/doctor/earnings` | MongoDB (`PaymentTransaction.js`) | **WORKING** | Ledger of completed consultation fees and pending settlements. |
| **DOC-13** | Clinician Practice Settings | `DocModule13_Settings.jsx` | `PUT /api/v1/doctor/settings` | MongoDB (`DoctorProfile.js`) | **WORKING** | Updates consultation fees, bio, qualifications, and clinic locations. |

---

## 4. ADMINISTRATION PORTAL MODULES (ADM-01 TO ADM-15)

| Feature ID | Feature Name | Frontend Component | Backend Route & Controller | Storage Tier | Status | Verification Evidence & Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ADM-01** | Secure Admin Sign-In | `LoginPage.jsx` (Role: ADMIN) | `POST /api/v1/auth/login` | MongoDB (`User.js`) | **WORKING** | No public self-registration; requires pre-seeded administrator credentials. |
| **ADM-02** | Operations Command Center | `AdminModule01_Dashboard.jsx` | `GET /api/v1/admin/overview` | MongoDB Aggregations | **WORKING** | Real-time platform metrics on users, verified clinicians, and total revenue. |
| **ADM-03** | Doctor Credential Audit | `AdminModule03_DoctorVerification.jsx`| `POST /api/v1/admin/doctors/:id/verify` | MongoDB (`DoctorVerification.js`) | **WORKING** | Approves/rejects doctor registration numbers and attaches official council badges. |
| **ADM-04** | Hospital Master Directory | `AdminModule04_HospitalDirectory.jsx`| `GET /api/v1/admin/facilities` | MongoDB (`Hospital.js`) | **WORKING** | Full facility search across India; manages trauma center accreditations. |
| **ADM-05** | National Registry Data Sync | `AdminModule04_HospitalDirectory.jsx`| `POST /api/v1/admin/sync/trigger` | MongoDB (`SyncLog.js`) | **WORKING** | Synchronizes and deduplicates discovered facilities against government registries. |
| **ADM-06** | Patient Account Oversight | `AdminModule05_PatientAccounts.jsx` | `GET /api/v1/admin/patients` | MongoDB (`PatientProfile.js`) | **WORKING** | Audits patient accounts and active DPDP consent statuses. |
| **ADM-07** | Appointment Monitoring | `AdminModule06_AppointmentMonitoring.jsx`| `GET /api/v1/admin/appointments` | MongoDB (`Appointment.js`) | **WORKING** | Monitors platform-wide appointment volume, cancellations, and doctor utilization. |
| **ADM-08** | MLOps Model Registry | `AdminModule08_AIModelMonitoring.jsx`| `GET /api/v1/admin/mlops/models` | FastAPI Registry | **WORKING** | Reports active PyTorch and Scikit-Learn versions, architectures, and latency. |
| **ADM-09** | Feature Drift Monitoring | `AdminModule08_AIModelMonitoring.jsx`| `GET /api/v1/admin/mlops/drift` | FastAPI Telemetry | **WORKING** | Calculates Population Stability Index (PSI = 0.024) across symptom queries. |
| **ADM-10** | Dataset Governance | `AdminModule09_DatasetManagement.jsx`| `GET /api/v1/admin/datasets` | MongoDB (`DatasetMetadata.js`) | **WORKING** | Audits dataset lineage, sample sizes, and train/test evaluation splits. |
| **ADM-11** | External API Health Monitor | `AdminModule10_APIIntegrationStatus.jsx`| `GET /api/v1/admin/integrations` | MongoDB (`IntegrationStatus.js`) | **WORKING** | Live health pings to Atlas, Redis, SMTP, S3, and FastAPI microservice. |
| **ADM-12** | Cybersecurity Monitoring | `AdminModule11_SecurityMonitoring.jsx`| `GET /api/v1/admin/security/events` | MongoDB (`AuditLog.js`) | **WORKING** | Flags failed login bursts, brute-force OTP attempts, and role violations. |
| **ADM-13** | Immutable Audit Logs | `AdminModule12_AuditLogs.jsx` | `GET /api/v1/admin/compliance/audit-logs`| MongoDB (`AuditLog.js`) | **WORKING** | Immutable ledger recording actor ID, IP, user-agent, action, and target entity. |
| **ADM-14** | Manual UPI Reconciliation | `AdminModule14_SystemSettings.jsx` | `GET /api/v1/payments/admin/pending` + `/verify` | MongoDB (`PaymentTransaction.js`) | **WORKING** | Lists pending UTRs; admin confirms against bank statement before approving. |
| **ADM-15** | System Parameters & Invalidation | `AdminModule14_SystemSettings.jsx` | `PUT /api/v1/admin/settings` | In-memory / MongoDB | **WORKING** | Configures ephemeral TTL defaults (15-60 min), commission rates, and maintenance mode. |
