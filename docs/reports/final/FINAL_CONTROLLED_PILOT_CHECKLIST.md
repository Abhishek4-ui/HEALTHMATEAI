# HEALTHMATE AI — FINAL CONTROLLED PILOT CHECKLIST

**Standard:** Healthcare Software Staging Governance & Clinical Pilot Operational Guidelines  
**Release Target:** Controlled Clinical Pilot (Departmental Staging Environment)  
**Date of Audit:** November 12, 2026 | **Revision:** `4598f1c`  
**Overall Verdict:** APPROVED FOR CONTROLLED PILOT / UNRESTRICTED PUBLIC RELEASE RESTRICTED  

---

## 1. Pilot Readiness Gate Decisions

```
+------------------------------------+--------------------------+-------------------------------------+
| Operational Category               | Pilot Gate Decision      | Action / Constraint                 |
+------------------------------------+--------------------------+-------------------------------------+
| 1. Software & Code Stability       | GO (100% Passed)         | 102/102 Backend, 11/11 AI Passed    |
| 2. Security & RBAC Enforcement     | GO (100% Passed)         | Argon2id, Single-Use OTP, S3 Priv   |
| 3. Email Telephony Pipeline        | GO (100% Passed)         | Gmail SMTP Active & Delivering      |
| 4. Commercial Indian SMS           | NO-GO (Blocked)          | Fast2SMS DLT KYC Mandatory          |
| 5. Financial Payment Gateway       | PILOT RESTRICTED         | Razorpay Maintained in Test Mode    |
| 6. Clinical AI Diagnostic Engine   | INFORMATIONAL ONLY       | Physician Sign-Off Required         |
| 7. Cloud Deployments (Edge/API)    | GO (HTTP 200 Live)       | Vercel & Render Deployed            |
+------------------------------------+--------------------------+-------------------------------------+
```

---

## 2. Controlled Pilot Operational Checklists

### Checklist A: Clinical Practitioner Onboarding
- [x] **Physician Registration Form:** Requires medical registration number (MCI/NMC) and State Council.
- [x] **Institutional Credential Approval:** Doctor accounts start as `isVerified: false`; administrative verification required on `/admin/doctors` before prescription authorization.
- [x] **Clinical AI Impression Review:** Doctor dashboard provides explicit "Modify / Approve" controls for CXR, CT, and symptom assessments.
- [x] **Prescription Pharmacovigilance:** Real-time drug-drug interaction warning alert displays before high-risk medication combinations are authorized.
- [x] **Clinical Disclaimer Persistence:** Persistent banner visible: *"Computer-aided finding only. Must be confirmed by licensed clinician."*
- **Practitioner Gate:** **READY FOR PILOT**

---

### Checklist B: Patient Onboarding & Consultation
- [x] **Patient Registration & Login:** Email OTP verification operational via Gmail SMTP.
- [x] **Doctor Search & Discovery:** All 36 Indian States and Union Territories resolve with accurate administrative districts.
- [x] **Appointment Scheduling:** Conflict mutex in Redis prevents concurrent double-booking of physician slots.
- [x] **Telehealth Video Room:** WebRTC peer connection initializes with STUN signaling for remote video consults.
- [x] **Patient Consent Capture:** Mandatory `consent: true` required prior to diagnostic report processing.
- [x] **Privacy & Right to Erasure:** "Forget Me" pipeline available in Privacy Settings for irreversible PII anonymization.
- **Patient Gate:** **READY FOR PILOT**

---

### Checklist C: Infrastructure & System Resilience
- [x] **Frontend Edge Deployment:** `https://healthmate-ai-nine-mocha.vercel.app` responding with `HTTP 200`.
- [x] **Backend API Deployment:** `https://healthmate-backend-9nmm.onrender.com` responding with `HTTP 200`.
- [x] **AI Microservice Deployment:** `https://healthmate-ai-service.onrender.com` responding with `HTTP 200`.
- [x] **Database Primary Shard:** MongoDB Atlas cluster connected and serving indexed queries.
- [x] **Distributed Caching:** Upstash Redis cluster active with memory eviction policies.
- [x] **Diagnostic Cloud Storage:** AWS S3 bucket `healthmate-ai-storage-2026` configured with private ACL.
- **Infrastructure Gate:** **READY FOR PILOT**

---

### Checklist D: External Integration Constraints (Mandatory Restrictions)
- [ ] **Commercial Indian SMS (Fast2SMS):** **MUST REMAIN PAUSED** until business owner completes domain KYC on Fast2SMS portal. Patients in pilot must use registered email for authentication.
- [ ] **Razorpay Payment Gateway:** **MUST REMAIN IN TEST MODE** (`rzp_test_Tyml08EyeVHKJY`). Real credit card transactions must NOT be accepted until merchant KYC is approved.
- [ ] **Clinical AI Autonomous Claims:** **STRICTLY PROHIBITED**. The platform must be operated exclusively as an informational decision-support tool. Autonomous diagnosis without clinician sign-off is forbidden by statutory law.
- **Constraint Gate:** **ENFORCED & RESTRICTED**

---

## 3. Incident Response & Monitoring Runbook

1. **System Health Check:** Check `GET /health` on Render backend. If MongoDB or Redis reports disconnected, review cloud cluster IP whitelist.
2. **AI Microservice Latency Notice:** On Render's free tier, the first request after 15 minutes of inactivity takes ~45 seconds to spin up. In controlled pilots, advise clinicians that initial model queries experience a warm-up delay.
3. **Email Delivery Inquiries:** If a user reports not receiving an OTP email, inspect server stdout for Winston log: `Email dispatched via SMTP transporter {"messageId": "..."}` to verify Google SMTP transmission.

---

## 4. Controlled Pilot Approval Verdict

HealthMate AI is **APPROVED FOR CONTROLLED CLINICAL PILOT DEPLOYMENT**. 

The software application, role-based authorization, cryptographic security, and clinical workflows are verified. The pilot must operate under the stipulated restrictions: Email authentication only, Razorpay in Test Mode, and AI models in informational decision-support mode.
