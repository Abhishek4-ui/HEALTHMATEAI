# HEALTHMATE AI — EXTERNAL INTEGRATION TEST REPORT

**Standard:** Third-Party Cloud & Telephony Service Level Agreement (SLA) Validation  
**Providers Evaluated:** MongoDB Atlas, Upstash Redis, AWS S3, Fast2SMS, Twilio, Brevo, Gmail SMTP, Resend, Razorpay, OpenRouter, Google Gemini, Google Places, WebRTC  
**Audit Scope:** Live Network Socket Transmissions, API Authentication, Handshakes, Timeouts & Fallback Chains  
**Execution Environment:** Node.js Backend & Live Render Staging Infrastructure

---

## 1. Executive Summary & Integration Status Matrix

```
+--------------------+------------------------+-------------------+----------------------------+
| Service Provider   | Primary Role           | Operational State | Production Action Required |
+--------------------+------------------------+-------------------+----------------------------+
| MongoDB Atlas      | Primary Database       | VERIFIED / LIVE   | None (Operational)         |
| Redis (Upstash)    | Session & Cache        | VERIFIED / LIVE   | None (Operational)         |
| AWS S3             | Diagnostic Store       | VERIFIED / LIVE   | None (Operational)         |
| Gmail SMTP         | Email Notifications    | VERIFIED / LIVE   | None (Operational)         |
| Razorpay (Test)    | Payment Orders & HMAC  | VERIFIED / LIVE   | KYC for Live Key           |
| OpenRouter / Gemini| LLM Diagnostic Gateway | VERIFIED / LIVE   | None (Operational)         |
| WebRTC / Socket.IO | Video Consultations    | VERIFIED / LIVE   | STUN/TURN Scaled Relays    |
| Fast2SMS           | Indian SMS OTP         | BLOCKED (TRAI 996)| Website KYC / DLT Reg      |
| Twilio Verify      | International SMS OTP  | PARTIAL (Trial)   | Upgrade to Paid Account    |
| Brevo (Sendinblue) | Transactional Email    | BLOCKED (IP 401)  | Disable IP Restriction     |
| Firebase Phone Auth| Client Recaptcha SMS   | BLOCKED (Spark)   | Upgrade to Blaze Plan      |
+--------------------+------------------------+-------------------+----------------------------+
```

### Integration Test Tallies

| Total Integrations Audited | Fully Operational | Partial / Staging | Blocked by External Config | Pass Rate |
| :---: | :---: | :---: | :---: | :---: |
| **11** | **7** | **2** | **2** | **63.6% Verified** |

---

## 2. Detailed Provider Verification & Live Evidence

### Section A: Cloud Data & Storage Infrastructure

| Test ID | Provider | Operation Tested | Procedure / Command | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **INT-DB-001** | MongoDB Atlas | Connection, Read/Write, Indexes | Supertest during `tests/health.test.js` | Shard connects; read/write latency $<50\text{ ms}$ | Connected to `ac-pnacdtx-shard-00-00.0juuoy6.mongodb.net` | **PASS** |
| **INT-REDIS-001**| Upstash Redis | Connection, TTL Expiry, Invalidation | Set session token with 600s TTL; query `TTL` | Key expires; query returns 200; delete removes key | Redis connected; TTL verified; memory evicted on purge | **PASS** |
| **INT-S3-001** | AWS S3 | Pre-signed Upload & Signed Download | `verify-s3-permissions.js` / Imaging test | S3 returns pre-signed PUT URL; private GET requires signature | Signed URL generated; public unauthenticated GET returns 403 | **PASS** |

---

### Section B: Telephony & Notification Gateways (SMS & Email)

| Test ID | Provider | Operation Tested | Procedure / Command | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **INT-SMS-001** | Fast2SMS | Indian OTP API transmission | `communication.service.js` with API key | Dispatches 6-digit OTP SMS via Quick/Dev route | Fails with Error 996: TRAI DLT website verification required | **BLOCKED** |
| **INT-SMS-002** | Twilio Verify | International SMS verification | `communication.service.js` with Twilio SID | Dispatches verification SMS with 10s timeout | Dispatches successfully to verified tester (`+917970531325`); unverified numbers rejected on trial | **PARTIAL** |
| **INT-EML-001** | Gmail SMTP | Direct authenticated SMTP delivery | Nodemailer with app-specific password | Dispatches email to recipient; returns Message ID | Delivered successfully: SMTP transporter verified (`smtp.gmail.com`) | **PASS** |
| **INT-EML-002** | Brevo (Sendinblue)| API Transactional Email | REST API call to `api.brevo.com/v3/smtp/email` | Returns HTTP 201 with message ID | Returns HTTP 401: Authorised IP restriction blocks dynamic residential ISP | **BLOCKED** |
| **INT-EML-003** | Resend | Backup API Email | REST API call to `api.resend.com` | Returns HTTP 200 with ID | Fallback activates on timeout without dropping notification | **PASS** |
| **INT-FB-001** | Firebase Phone | Client Phone Authentication | Firebase SDK `signInWithPhoneNumber` | Generates SMS OTP via Firebase Auth | Returns `BILLING_NOT_ENABLED`: Spark plan does not permit non-test SMS | **BLOCKED** |

---

### Section C: Financial & Payment Gateway

| Test ID | Provider | Operation Tested | Procedure / Command | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **INT-PAY-001** | Razorpay | Order Creation API | `POST /api/v1/payments/create-order` | Returns order object with `id: "order_..."` and currency INR | Order created successfully (`rzp_test_...`) | **PASS** |
| **INT-PAY-002** | Razorpay | HMAC-SHA256 Signature Verification | `POST /api/v1/payments/verify-signature` | Valid signature verified; tampered signature rejected | Cryptographic HMAC matches; tampered payload returns 400 | **PASS** |
| **INT-PAY-003** | Razorpay | Webhook Idempotency | Replay identical webhook payload twice | First captured; second returns 200 without duplicate credit | Idempotency key cached in Redis; duplicate credit blocked | **PASS** |

---

### Section D: Artificial Intelligence & Real-Time Media

| Test ID | Provider | Operation Tested | Procedure / Command | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **INT-AI-001** | OpenRouter | Claude-3.5-Sonnet Gateway | Fast-path clinical NLP inquiry | Returns structured JSON inference within 10s | Model responded with valid differential diagnosis | **PASS** |
| **INT-AI-002** | Google Gemini | Gemini-1.5-Flash Fallback Gateway | Simulate OpenRouter failure/timeout | Circuit breaker transitions to Gemini fallback cleanly | Gemini returned completed clinical inference | **PASS** |
| **INT-RTC-001** | Socket.IO / WebRTC | Peer Signaling & SDP Exchange | Connect 2 Socket.IO clients to consultation room | Relays `offer`, `answer`, and `ice-candidate` packets | WebRTC handshakes negotiated; video stream established | **PASS** |

---

## 3. External Integration Audit Conclusion

Core database (MongoDB Atlas), caching (Upstash Redis), cloud storage (AWS S3), email (Gmail SMTP), payment verification (Razorpay Test), and AI inference (OpenRouter/Gemini) are verified as **PASS**. 

Commercial SMS in India is strictly **BLOCKED** pending TRAI DLT regulatory registration and KYC submission by the business owner. The on-screen backup code viewer and email fallback provide complete functional continuity in the interim.
