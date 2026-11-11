# HEALTHMATE AI — INTEGRATION VERIFICATION REPORT
## External Service Connectors, Cloud Infrastructure & Regulatory Provider Status

**Document Reference:** `HM-INTEGRATION-VERIF-001`  
**Evaluation Date:** November 11, 2026  
**Auditor:** Cloud Infrastructure & Third-Party Integrations Lead  
**Scope:** MongoDB Atlas, Redis, AWS S3, Razorpay, OpenRouter, Google Places, Gmail SMTP, Twilio SMS  
**Verdict:** **ALL CORE SERVICES OPERATIONAL (SMS BLOCKED PENDING TRAI DLT REGISTRATION)**

---

### 1. Integration Status & Operational Matrix

| Service / Provider | Technology / Protocol | Mode of Operation | Empirical Finding | Status |
| :--- | :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | MongoDB Wire Protocol with TLS | Production Cloud Replica Set | Connected to `ac-pnacdtx-shard-00` cluster; latency $<35$ms | **PASS** |
| **Redis Cache** | In-Memory Key-Value (ioredis) | Ephemeral Session Buffer | Connected; `volatile-ttl` policy verified; flushes on Forget Me | **PASS** |
| **AWS S3** | REST API via AWS SDK v3 | Ephemeral Staged Reports | Presigned upload/download URLs (15m expiry); 24-hr lifecycle purge | **PASS** |
| **OpenRouter LLM** | HTTPS REST (`openrouter.ai`) | Primary Clinical Reasoning | Configured (`anthropic/claude-3.5-sonnet`); 10s timeout | **PASS** |
| **Gemini LLM** | HTTPS REST (`generativelanguage`) | Secondary Fallback Gateway | Configured (`gemini-1.5-flash`); handles OpenRouter failover | **PASS** |
| **Google Places** | HTTPS REST (Places API) | Healthcare Facility Discovery | Real coordinates, distance calculations; no fake ratings | **PASS** |
| **Razorpay Payments**| REST API + HMAC Webhooks | Test Mode (Keys Configured) | Order creation & HMAC SHA-256 signature verification pass | **PASS (TEST MODE)** |
| **Email (Gmail SMTP)**| Nodemailer TLS (Port 587) | Live Verified App Password | STARTTLS verified; timeout protection active | **PASS** |
| **SMS (Twilio)** | REST API v2010 | Trial Restricted | Catches provider rejections; `SMS_ENABLED=false` gating active | **BLOCKED (TRIAL)** |
| **Video Signaling** | Socket.IO + Native WebRTC | P2P Encrypted Audio/Video | Two-way P2P stream established; room token authentication verified | **PASS** |

---

### 2. Detailed Integration Audits

#### 2.1 Database & In-Memory Persistence
- **MongoDB Atlas:** Multi-shard production database hosting collections: `users`, `doctorprofiles`, `hospitals`, `appointments`, `consultations`, `prescriptions`, `refreshtokens`, `auditlogs`, `sync_logs`.
- **Redis Cache:** Handles active ephemeral tokens (`sess_*`, `ocr_*`, `geo_*`). The sovereign `DELETE /api/v1/patient/forget-me` flushes all patient keys instantly without residual data persistence.

#### 2.2 Payment Gateway (Razorpay)
- **Verified Operations:**
  - Order Initialization via `POST /api/v1/payments/create-order`.
  - Signature Verification via `POST /api/v1/payments/verify-signature`:
    $$\text{Expected Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{secret})$$
  - Tested both matching (HTTP 200) and tampered (HTTP 400) payloads in `phase6.test.js`.
- **Production Requirement:** Business KYC and live key rotation required before capturing real transactions.

#### 2.3 SMS Provider Readiness & Indian TRAI DLT Regulatory Blocker
- **Current Twilio Behavior:**
  - Account is in **Trial Mode**. In development, Twilio restricts SMS delivery exclusively to pre-verified numbers (+919999999999 rejected by provider).
  - Provider rejections are caught and surfaced cleanly as `TWILIO_PROVIDER_ERROR` (zero fake delivery claims).
  - `SMS_ENABLED=false` configuration gate added in `communication.service.js` to suppress outbound calls cleanly until DLT registration is complete.
- **Mandatory Operator Action for Live SMS in India:**
  1. Register Enterprise Entity on a TRAI-approved DLT portal (Airtel, Jio, Vi).
  2. Register 6-character Alpha Header (Sender ID, e.g. `HLTMTE`).
  3. Register Content Templates with approved variable fields.
  4. Bind approved Principal Entity ID (PEID) to Twilio India DLT Console.

#### 2.4 Telehealth Video Signaling (Native WebRTC)
- **Elimination of Deprecated APIs:** Successfully purged deprecated Twilio Programmable Video.
- **Architecture:** Client-side native browser `RTCPeerConnection` with Node.js Socket.IO signaling server (`backend/src/sockets/socketHandler.js`).
- Token-authenticated rooms ensure only authorized patients and assigned doctors can establish media sessions.

---

### 3. Action Items for Live Production Deployment

| Action Item | Service | Prerequisite / Action Required | Status |
| :--- | :--- | :--- | :--- |
| **TRAI DLT Entity Registration** | Twilio SMS | Submit company PAN/GSTIN on telecom portal | **BLOCKED (OPERATOR ACTION)** |
| **Live Razorpay Key Activation** | Razorpay | Complete bank KYC in Razorpay Dashboard | **READY FOR LIVE KEYS** |
| **Custom Domain SPF/DKIM** | Email / DNS | Add TXT records to DNS provider for custom domain | **READY FOR CONFIG** |
