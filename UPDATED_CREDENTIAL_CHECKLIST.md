# HealthMate AI — Updated Credential & Provider Checklist

**Audit Date:** November 11, 2026  
**Security Policy:** Test and Production credentials are strictly separated. Zero credentials, secrets, or OTP values are committed to source control or logged in application traces.

---

## 1. Provider Credential Audit & Live Status

| # | Integration Provider | Environment Variable Key | Mode / Scope | Live Provider Test Result | Current Status | Exact User Action Required to Complete Setup |
|---|----------------------|--------------------------|:------------:|:-------------------------:|:--------------:|----------------------------------------------|
| **1** | **MongoDB Atlas** | `MONGODB_URI` | Cloud Production Shard | Connected (`ac-pnacdtx-shard-00-02`) | **PASS** | None. Fully operational. |
| **2** | **Redis Cloud** | `REDIS_URL` | Ephemeral Cloud Memory | Connected (`parchment-store-skate-71311`) | **PASS** | None. Fully operational. |
| **3** | **Resend Email API** | `EMAIL_API_KEY` | Developer Sandbox | `HTTP 200 OK` (Dispatched to `abhishekgga140@gmail.com`) | **PASS** (Sandbox) | To send emails to arbitrary third-party patient emails, verify a custom domain at `resend.com/domains` and configure DNS records. |
| **4** | **Google Gmail SMTP** | `SMTP_USER`<br>`SMTP_PASS`<br>`SMTP_HOST`<br>`SMTP_PORT` | Outgoing Email | `535-5.7.8 BadCredentials` | **BLOCKED** | 1. Enable 2-Step Verification in Google Account.<br>2. Visit `myaccount.google.com/apppasswords`.<br>3. Generate a 16-character App Password for "Mail".<br>4. Set `SMTP_PASS=<16_char_app_password>`. |
| **5** | **Twilio SMS** | `TWILIO_ACCOUNT_SID`<br>`TWILIO_AUTH_TOKEN`<br>`TWILIO_PHONE_NUMBER` | Developer Trial | `Code 21606: Invalid From Phone Number` | **BLOCKED** | 1. Log into `console.twilio.com`.<br>2. Click **Get a trial phone number** (assigns a valid US/international sender number).<br>3. Set `TWILIO_PHONE_NUMBER=<provisioned_number>`.<br>4. Under **Verified Caller IDs**, add your destination mobile number. |
| **6** | **Razorpay Payments** | `RAZORPAY_KEY_ID`<br>`RAZORPAY_KEY_SECRET` | Test Mode (`rzp_test_...`) | Live order created (`order_TyoSHBNmmYCKS9`); HMAC verified | **PASS** (Test Mode) | Razorpay remains in Test Mode until production merchant KYC is approved. Do NOT switch to live keys without authorization. |
| **7** | **AWS S3 Storage** | `AWS_ACCESS_KEY_ID`<br>`AWS_SECRET_ACCESS_KEY`<br>`AWS_S3_BUCKET_NAME`<br>`AWS_REGION` | Private Cloud Storage (`ap-southeast-2`) | `PutObjectCommand` & `DeleteObjectCommand` verified; 403 on raw URL | **PASS** | None. Fully operational with private ACLs and presigned 15-minute URLs. |
| **8** | **Google Maps Platform** | `GOOGLE_MAPS_API_KEY` | Client & Geocoding | Distance calculations & deep-link directions verified | **PASS** | Ensure Google Cloud Console billing quota is monitored. |
| **9** | **WebRTC Telehealth** | `N/A` (Native WebRTC + Socket.IO) | P2P Video with STUN | Dual-client SDP offer/answer/ICE exchange verified | **PASS** | Optional: For restrictive corporate firewalls, configure a commercial TURN server (e.g. Twilio Network Traversal or Coturn). |
| **10**| **OpenRouter / Gemini AI** | `OPENROUTER_API_KEY`<br>`GEMINI_API_KEY` | LLM Inference Gateway | Health check confirms primary and fallback models configured | **PASS** | Ensure monthly API usage limits are set in OpenRouter/Google AI Studio consoles. |

---

## 2. Test vs Production Credential Isolation

- **Test Mode Segregation:**
  - Razorpay keys are prefixed with `rzp_test_` to prevent real financial transactions.
  - S3 uploads are strictly stored under `ephemeral-reports/` with automatic 30-minute lifecycle eviction.
  - Resend email delivery is restricted by default to verified developer test accounts.
- **Credential Protection Measures:**
  - Password hashes are computed using memory-hard Argon2id (`memoryCost: 65536, timeCost: 3, parallelism: 1`).
  - OTP codes are hashed with SHA-256 before storage in Redis.
  - Raw credentials, access tokens, and OTP codes are redacted from application logs.
