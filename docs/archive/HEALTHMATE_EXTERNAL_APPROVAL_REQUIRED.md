# HEALTHMATE AI — EXTERNAL APPROVALS AND REGULATORY GATES

**Document Date:** November 12, 2026  
**Auditor:** Healthcare Compliance Auditor & Senior Regulatory Specialist  

---

## 1. SUMMARY OF REGULATORY & EXTERNAL GATES

| External Dependency | Governing Body | Impacted Features | Current Safe Mode | Free Workaround | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TRAI DLT Entity Registration** | Telecom Regulatory Authority of India | Carrier mobile SMS dispatch (`sms.service.js`) | Rejection without simulation | Google SMTP & Resend Email OTP | **BLOCKED (GATED)** |
| **Razorpay Merchant KYC** | Reserve Bank of India (RBI) / Razorpay | Real monetary payment collection | Razorpay Test Mode (`rzp_test_...`) | Manual UPI Direct Bank Transfer | **CONTROLLED** |
| **CDSCO SaMD Validation** | Central Drugs Standard Control Organisation | Automated clinical diagnosis from medical scans | Informational research aid disclaimer | Clinician-in-the-loop review interface | **COMPLIANT** |
| **NMC Telemedicine Guidelines** | National Medical Commission (India) | Doctor video prescription issuance | Outpatient review with consent | WebRTC encrypted video consults | **COMPLIANT** |
| **DPDP Act 2023 Consent Gate** | Data Protection Board of India | Persistent clinical data retention | Ephemeral TTL + "Forget Me" purge | Immediate session cryptographic erasure | **COMPLIANT** |

---

## 2. DETAILED REGULATORY PROFILES & ACTION STEPS

### 2.1 Telecom DLT Entity Registration (TRAI Mandate)
- **Problem Statement:**  
  Under the TRAI Telecom Commercial Communications Customer Preference Regulations (TCCCPR 2018), all bulk and transactional SMS traffic terminated on Indian mobile telecom networks must be cryptographically registered on an authorized Distributed Ledger Technology (DLT) blockchain network.
- **Error Observed:**  
  Fast2SMS API returns code `414` / `"IP is blacklisted from Dev API section"` or `"DLT Template Mismatch"` when calling unapproved headers or unverified routes.
- **Safe Engineering Practice:**  
  The system strictly refuses to simulate success. If SMS fails, it records an honest error in application logs.
- **Working Free Alternative:**  
  Dual-channel Email OTP via Gmail SMTP and Resend API. Delivers 6-digit verification codes to patient inboxes within 1,200ms with zero carrier fees or DLT compliance blockers.
- **Exact Action Required to Unblock Real SMS:**
  1. Register as a **Principal Entity** on an Indian telecom DLT portal:
     - Vodafone Idea DLT: [https://www.vilpower.in](https://www.vilpower.in)
     - Jio DLT: [https://smartping.live](https://smartping.live)
     - Airtel DLT: [https://www.airtel.in/business/commercial-communication](https://www.airtel.in/business/commercial-communication)
  2. Upload Certificate of Incorporation, Business PAN, and Authorized Signatory Aadhaar.
  3. Register 6-character Header (e.g. `HLTHMT` or `HLTMTE`).
  4. Register Transactional Template:
     `Your HealthMate AI verification code is {#var#}. Valid for 5 minutes. Do not share this code with anyone.`
  5. Once approved, copy the 19-digit Template ID into `FAST2SMS_DLT_TEMPLATE_ID`.

---

### 2.2 Razorpay Payment Gateway Merchant KYC
- **Problem Statement:**  
  Under Reserve Bank of India (RBI) Payment Aggregator guidelines, funds cannot be settled to an enterprise bank account without full KYC verification and corporate entity vetting.
- **Safe Engineering Practice:**  
  Razorpay is kept strictly in **Test Mode** (`RAZORPAY_KEY_ID=rzp_test_...`). Orders are created and signatures are verified via standard HMAC SHA-256 digests, but no genuine debit cards, credit cards, or UPI accounts are charged.
- **Working Free Alternative:**  
  **Manual UPI Payment Rail**: Patients scan the genuine merchant UPI QR code (`upi://pay?pa=...`), execute payment via their own UPI app, and submit their 12-digit bank UTR reference number. An administrator manually verifies the bank credit before approving the appointment, incurring **0% transaction fees**.
- **Exact Action Required to Activate Live Gateway:**
  1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
  2. Navigate to *Account & Settings -> KYC & Verification*.
  3. Upload Business PAN, Bank Cancelled Cheque, and GST Registration.
  4. Submit Healthcare Platform Undertaking confirming non-sale of restricted scheduled drugs.
  5. Toggle dashboard switch from *Test Mode* to *Live Mode* and generate Live API Keys (`rzp_live_...`).

---

### 2.3 CDSCO Software as a Medical Device (SaMD) Guidelines
- **Problem Statement:**  
  Under the Medical Device Rules (MDR 2017) and CDSCO guidelines, AI algorithms providing clinical inferences cannot act as autonomous diagnostic authorities without formalized clinical trial validation and central licensing.
- **Engineering Guardrails Implemented:**
  1. All AI symptom assessments and medical image models (CXR, CT, MRI, ECG) output a prominent statutory disclaimer:  
     `"Notice: Automated screening for informational and educational review only. Not a clinical diagnosis. Consult a qualified medical practitioner."`
  2. Multi-label visual findings are classified as **risk indicators** rather than confirmed diagnoses.
  3. High-risk symptom combinations trigger emergency red-flag banners instructing the user to contact local emergency services (112 / 108).
- **Status:** **FULLY COMPLIANT AS CLINICAL DECISION SUPPORT & TRIAGE AID**.

---

### 2.4 Digital Personal Data Protection Act 2023 (DPDP Act)
- **Problem Statement:**  
  The DPDP Act 2023 mandates that personal health data must have unambiguous patient consent, purposeful limitation, ephemeral retention by default, and a guaranteed right to data erasure ("Right to be Forgotten").
- **Engineering Guardrails Implemented:**
  1. Medical uploads and chat transcripts default to ephemeral sessions with a configurable TTL (15 to 60 minutes) in Redis.
  2. The `/patient/privacy` module provides an instant, self-service **"Delete My Data Now" (Forget Me)** action.
  3. When triggered, the backend purges all temporary Redis keys, deletes staged reports from S3, and invalidates active session tokens.
  4. Data export feature allows patients to download their consent ledger and session records in machine-readable JSON format.
- **Status:** **FULLY COMPLIANT WITH DPDP ACT 2023 ARCHITECTURE**.
