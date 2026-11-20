# HEALTHMATE AI — INTEGRATION STATUS & PROVIDER MATRIX

**Last Updated:** November 11, 2026  
**Status:** **PHASE 6 INTEGRATION MATRIX ACTIVE**  

---

## 1. Provider Integration Matrix

| # | Integration / Service | Provider | Purpose | Environment Variable | Live Connection Test | Operational Status |
| :-: | :--- | :--- | :--- | :--- | :--- | :---: |
| **A** | **MongoDB Atlas** | MongoDB Inc. | Core persistent data, user accounts, appointments, doctor registry, audit logs | `MONGODB_URI` | Replica set connection verified | **LIVE / CONNECTED** |
| **B** | **Redis Cloud** | Redis Ltd. | TTL ephemeral session cache, Forget Me purge, rate limiting, OTP cooldown | `REDIS_URL` | Remote DB ping verified (Port 12558) | **LIVE / CONNECTED** |
| **C** | **Razorpay Payments** | Razorpay India | Appointment fee checkout, server-side orders, HMAC-SHA256 verification | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Live test order generated (`order_TynuaQMdOVwGiT`) | **LIVE TEST ACTIVE** |
| **D** | **AWS S3 Storage** | Amazon Web Services | Private encrypted medical report staging & short-lived signed URLs | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME` | 8/8 IAM permissions passed (Bucket: `healthmate-ai-storage-2026`) | **LIVE / CONNECTED** |
| **E** | **Google Places Platform** | Google Cloud | Real hospital & clinic discovery, geocoding, directions | `GOOGLE_PLACES_API_KEY` | Places API (New) verified with real coordinates | **LIVE / CONNECTED** |
| **F** | **OpenRouter AI Gateway** | OpenRouter Inc. | Primary LLM gateway for Clinical Copilot & SOAP Note synthesis | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL_NAME` | Active (`anthropic/claude-3.5-sonnet`) | **LIVE / CONNECTED** |
| **G** | **Google Gemini AI** | Google AI Studio | Fallback LLM provider with automatic failover | `GEMINI_API_KEY`, `GEMINI_MODEL_NAME` | Active (`gemini-1.5-flash`) | **LIVE / CONNECTED** |
| **H** | **Twilio WebRTC Video** | Twilio Inc. | Doctor-patient teleconsultation video room token generation | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Room token issued with 1-hr TTL | **LIVE / CONNECTED** |
| **I** | **Twilio SMS Gateway** | Twilio Inc. | Multi-channel appointment confirmation & OTP SMS delivery | `TWILIO_PHONE_NUMBER=7970531325` | Trial mode configured with fallback audit logging | **INTEGRATED (TRIAL)** |
| **J** | **Resend / SMTP Email** | Resend / Google | HTML appointment confirmation & verification codes | `EMAIL_API_KEY`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Multi-channel communication service active | **INTEGRATED** |
| **K** | **National Health Registries** | MoHFW / OGD India | Official Indian government hospitals & medical council registries | Public Registry Ingestion Engine | Sourced 14 verified institutions across India | **INGESTED & ACTIVE** |

---

## 2. External Provider Limitations & Pending Approvals

| Integration | Current Environment | Production Approval Required | Provider Limitation / Behavior |
| :--- | :--- | :--- | :--- |
| **Razorpay** | Test Mode (`rzp_test_...`) | Live Merchant KYC Activation (`rzp_live_...`) | Test mode creates real server orders on Razorpay's test network; simulated cards are used for test settlement. |
| **Twilio SMS** | Developer Trial | Twilio Paid Account + DLT Registration (India) | Free trial requires destination phone numbers to be pre-verified in the Twilio console. Fallback logging ensures zero application crashes. |
| **Resend / Gmail SMTP** | Dev API Key (`re_...`) | Custom Domain SPF/DKIM DNS Verification | Unverified domains are restricted to test recipient inboxes; fallback logging prevents failures. |
| **ABDM Sandbox** | Architecture Staged | NHA ABDM Sandbox Approval (Client ID/Secret) | Full National Digital Health Mission integration requires institutional accreditation for production HFR/HPR sync. |

---

## 3. Resilience & Fallback Hierarchy

```
1. Payment Processing:
   Razorpay Live Test Orders -> HMAC SHA256 Signature Verification -> Fallback Simulated Settlement

2. Clinical LLM Gateway:
   OpenRouter (Claude 3.5 Sonnet) -> Google Gemini (Gemini 1.5 Flash) -> Local Safeguard Safeguard Fallback

3. Notifications:
   Resend API -> Nodemailer SMTP -> Secure Audit Log Dispatch

4. SMS Messaging:
   Twilio REST API -> Secure Fallback Audit Log Dispatch

5. Report Storage:
   Private AWS S3 Bucket -> Local Encrypted Directory Fallback
```
