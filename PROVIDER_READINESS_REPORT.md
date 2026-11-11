# HEALTHMATE AI — THIRD-PARTY PROVIDER READINESS REPORT
## Production Integration Audit, Trial Constraints & Indian Regulatory Compliance

**Document Reference:** `HM-P8.3-PROVIDER-READINESS-001`  
**Audit Date:** November 11, 2026  
**Auditor:** Cloud Infrastructure & Telecommunications Integration Lead  
**Scope:** Email (SMTP/Resend), SMS (Twilio & TRAI DLT), Video (WebRTC/Socket.IO), Payments (Razorpay), Cloud Storage (AWS S3)  
**Overall Readiness Verdict:** **CONDITIONALLY_READY_FOR_STAGING** (Production SMS blocked pending TRAI DLT registration; all other providers PASS)

---

### 1. Integration Status & Readiness Matrix

| Provider / Channel | Protocol / Technology | Current Operating Mode | Production Readiness Status | Blocking Factors / Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **Email (Gmail SMTP)** | Nodemailer TLS (Port 587) | Live Verified App Password | **PASS** | Valid Google 16-character App Password required. |
| **Email (Resend)** | HTTPS REST API (`api.resend.com`) | Operational (Verified recipient) | **PASS** | Domain DNS verification (SPF/DKIM) needed for broad public delivery. |
| **SMS (Twilio)** | Twilio REST API v2010 | Trial Restricted (Catching Provider Rejections) | **BLOCKED (TRIAL_RESTRICTED)** | Indian TRAI DLT Principal Entity & Template Registration mandatory for production. |
| **Video Telehealth** | Native WebRTC PeerConnection + Socket.IO | Verified Multi-Client Signaling | **PASS** | Production STUN/TURN (Coturn or Twilio NTS) configured. |
| **Payment Gateway** | Razorpay Test API + Webhooks | Verified HMAC SHA256 Signatures | **PASS** | Business KYC activation required for live capture. |
| **Object Storage** | AWS S3 Presigned URLs | Operational (EU/AP Region) | **PASS** | Bucket lifecycle policy (24-hr purge) active. |

---

### 2. SMS Provider Audit & Indian TRAI DLT Compliance Roadmap

#### 2.1 Current SMS Runtime Handling (`communication.service.js`)
In development and staging, Twilio SMS accounts operate in **Trial Mode**, which strictly permits SMS delivery only to pre-verified developer mobile numbers and rejects unverified Indian numbers (+91).
- **Zero False Deliveries:** The communication service never reports fake deliveries. Provider rejections are trapped and returned as `TWILIO_PROVIDER_ERROR`:
  ```json
  {
    "success": false,
    "provider": "twilio",
    "error": "TWILIO_PROVIDER_ERROR",
    "message": "SMS delivery rejected by Twilio. Trial accounts require provisioned Twilio phone numbers and verified recipient numbers."
  }
  ```
- **Configuration Gate:** In Phase 8.3, we added `SMS_ENABLED` configuration gating. Setting `SMS_ENABLED=false` cleanly suppresses outbound SMS attempts with an informative refusal code (`SMS_DISABLED_BY_CONFIG`), preventing wasted network timeouts until DLT registration is finalized.

#### 2.2 Indian TRAI DLT Regulatory Compliance Steps
Under the Telecom Regulatory Authority of India (TRAI) Telecom Commercial Communications Customer Preference Regulations (TCCCPR 2018), any application sending transactional SMS notifications to Indian mobile numbers must undergo mandatory Distributed Ledger Technology (DLT) onboarding:

```
[Step 1: Entity Registration]
       │
       ▼
  Register as Enterprise / Principal Entity on a TRAI DLT Portal
  (e.g., Airtel DLT, Jio DLT, Vodafone Idea DLT, or BSNL DLT).
  Provide Business PAN, GSTIN, Incorporation Certificate, and KYC.
       │
       ▼
[Step 2: Header / Sender ID Registration]
       │
       ▼
  Register 6-character Alpha Sender Header under Service Implicit / Transactional category
  (e.g., "HLTMTE", "HLTHAI").
       │
       ▼
[Step 3: Content Template Registration]
       │
       ▼
  Register exact SMS message templates with approved variable markers:
  "HealthMate AI: Your appointment with Dr. {#var#} on {#var#} at {#var#} is confirmed. Ref: {#var#}."
       │
       ▼
[Step 4: Provider Binding & Peering]
       │
       ▼
  Bind the approved Principal Entity ID (PEID) and Content Template ID (CTID)
  to Twilio India DLT Console or local Indian SMS aggregator (Kaleyra, Gupshup, ValueFirst).
```

---

### 3. Email Delivery Audit (Resend & Gmail SMTP)

1. **Gmail SMTP (`smtp.gmail.com:587`):**
   - Verified in Phase 6.1 and Phase 7. Connects with STARTTLS using Google Account App Password.
   - Tested live delivery to authorized mailbox.
   - Fallback timeout is calibrated to 2000ms to guarantee zero event loop freezing if Google SMTP encounters rate limits.
2. **Resend API:**
   - Resend provides HTTP-based email delivery for transactional alerts.
   - Operates cleanly using Bearer token authentication.

---

### 4. Telehealth Video Consultation (WebRTC & Socket.IO)

1. **Elimination of Deprecated Dependencies:**
   - The platform has completely purged deprecated Twilio Programmable Video SDKs.
2. **Native WebRTC Architecture:**
   - Client sessions establish direct peer-to-peer media streams via browser `RTCPeerConnection`.
   - The Node.js server (`backend/src/sockets/socketHandler.js`) acts strictly as a lightweight WebRTC signaling server handling SDP offers, answers, and ICE candidate exchange via Socket.IO rooms.
   - Token-protected consultation rooms require doctor or patient authentication.

---

### 5. Payment Gateway (Razorpay)

1. **Order Creation & Verification:**
   - Successfully verified against Razorpay test mode API (`https://api.razorpay.com/v1/orders`).
   - Webhook and callback signatures are validated using cryptographic HMAC SHA-256 with `RAZORPAY_KEY_SECRET`.
   - Tampered payloads are rejected with HTTP 400 (`Payment signature mismatch`).

---

### 6. Cloud Object Storage (AWS S3)

1. **Presigned Upload & Retrieval:**
   - Medical reports (PDF, PNG, JPG) are uploaded directly to private S3 buckets using ephemeral presigned PUT URLs with 15-minute expiration.
   - S3 objects are automatically deleted when the patient clicks "Forget Me" or when the S3 bucket lifecycle rule (24-hour expiration) triggers.

---

### 7. Action Items for Production Launch

| Action Item | Responsible Team | Target Date | Status |
| :--- | :--- | :--- | :--- |
| Complete TRAI DLT Principal Entity Registration | Operations / Legal | Pre-Launch | **PENDING USER ACTION** |
| Configure production Twilio DLT PEID & Sender ID | Infrastructure | Pre-Launch | **PENDING USER ACTION** |
| Add verified custom domain DNS records to Resend | DevOps | Pre-Launch | **READY FOR CONFIG** |
| Switch Razorpay to Live API credentials | Finance / Ops | Launch Day | **READY FOR CONFIG** |
