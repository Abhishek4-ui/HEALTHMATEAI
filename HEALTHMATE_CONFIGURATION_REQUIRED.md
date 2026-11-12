# HEALTHMATE AI — ENVIRONMENT & SERVICE CONFIGURATION MASTER DIRECTORY

**Date:** November 12, 2026  
**Auditor:** DevOps & Systems Infrastructure Specialist  
**Security Policy:** Strict Zero-Secret Disclosure (All credentials, tokens, and keys are redacted with template placeholders)  
**Target Repository:** `/Users/abhishekkumar/Desktop/HEALTHMATEAI`

---

## 1. CONFIGURATION OVERVIEW

HealthMate AI is orchestrated across three distinct microservices:
1. **Frontend (React + Vite):** Hosted on Vercel Edge (`frontend/.env.production`)
2. **Backend API (Node.js + Express):** Hosted on Render (`backend/.env`)
3. **AI/ML Service (Python + FastAPI):** Hosted on Render (`ai-service/.env`)

Below is the verified, auditable inventory of all required environment variables, their operational status, and actionable configuration guidelines.

---

## 2. BACKEND API ENVIRONMENT VARIABLES (`backend/.env`)

| Variable Name | Status | Necessity | Default / Sample Format | Purpose & Description | Free Tier / Production Source |
|---|---|---|---|---|---|
| `PORT` | **Configured** | Required | `5000` | Port on which the Express server listens. | Host provided (Render defaults to 10000 or custom) |
| `NODE_ENV` | **Configured** | Required | `production` / `development` | Toggles security headers, stack traces, and CORS enforcement. | System environment |
| `FRONTEND_URL` | **Configured** | Required | `https://healthmate-ai-nine-mocha.vercel.app` | Allowed CORS origin for browser API requests. | Vercel Deployment URL |
| `MONGODB_URI` | **Configured** | Critical | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/healthmate` | Primary database connection string for clinical and operational records. | MongoDB Atlas Free M0 Shared Cluster (512 MB) |
| `REDIS_URL` | **Configured** | Critical | `rediss://default:<token>@<host>.upstash.io:6379` | In-memory store for rate limiting, session tokens, and ephemeral OTP TTL. | Upstash Redis Free Serverless Tier (10,000 commands/day) |
| `JWT_SECRET` | **Configured** | Critical | `<64-byte-cryptographically-random-hex>` | Signs and verifies user JSON Web Tokens for role-based authorization. | Generated via `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET`| **Configured** | Critical | `<64-byte-cryptographically-random-hex>` | Signs long-lived refresh tokens stored in HTTP-only secure cookies. | Generated via `openssl rand -hex 32` |
| `AI_SERVICE_URL` | **Configured** | Required | `https://healthmate-ai-service.onrender.com` | Microservice endpoint for clinical triage, imaging inference, and OCR. | Render Python Web Service |
| `EMAIL_SERVICE` | **Configured** | Required | `gmail` | Primary email dispatch provider protocol. | Google Workspace / Personal Gmail |
| `EMAIL_USER` | **Configured** | Required | `your-clinic-alerts@gmail.com` | Sending address for OTP verifications and appointment notifications. | Gmail Account |
| `EMAIL_PASS` | **Configured** | Critical | `<16-char-app-password>` | App-specific password generated from Google Account Security. | Google Account > App Passwords |
| `RESEND_API_KEY` | **Configured** | Recommended | `re_123456789...` | High-availability fallback API when SMTP encounters connection throttling. | Resend Free Tier (3,000 emails/month, 100/day) |
| `FAST2SMS_API_KEY` | **Configured** | Optional | `<fast2sms-auth-key>` | Indian SMS Gateway authentication token for phone OTPs. | Fast2SMS Portal |
| `FAST2SMS_DLT_TEMPLATE_ID` | **Pending** | Required for SMS | `120716...` | TRAI-mandated DLT content template identifier for Indian telecom routing. | Telecom DLT Portal (Vilpower, Jio, Airtel) |
| `RAZORPAY_KEY_ID` | **Configured** | Required for Card/NetBanking | `rzp_test_...` (or `rzp_live_...`) | Razorpay public key for checkout window initialization. | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | **Configured** | Critical | `<razorpay-secret-key>` | Razorpay private key for HMAC SHA-256 signature verification. | Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | **Configured** | Critical | `<custom-webhook-secret>` | Validates signature of incoming Razorpay asynchronous payment webhooks. | Razorpay Dashboard > Webhooks |
| `MERCHANT_UPI_ID` | **Configured** | Required for UPI | `healthmate@okhdfcbank` | Virtual Payment Address (VPA) for zero-commission direct patient UPI payments. | Any verified Indian Bank Account / UPI App |
| `MERCHANT_NAME` | **Configured** | Required for UPI | `HealthMate AI Clinic` | Payee display name encoded into dynamic `upi://pay` deep links and QR codes. | Clinic / Doctor Registered Trade Name |
| `AWS_ACCESS_KEY_ID` | **Configured** | Required for Files | `AKIAIOSFODNN7EXAMPLE` | IAM access key with restricted read/write permissions to medical S3 bucket. | AWS IAM Console |
| `AWS_SECRET_ACCESS_KEY` | **Configured** | Critical | `<40-char-aws-secret-access-key>` | IAM secret key for S3 presigned URL signing and asset storage. | AWS IAM Console |
| `AWS_REGION` | **Configured** | Required for Files | `ap-south-1` (Mumbai) | AWS region hosting encrypted patient medical storage. | AWS Console |
| `AWS_S3_BUCKET` | **Configured** | Required for Files | `healthmate-medical-storage-prod` | Dedicated private bucket storing DICOM scans, lab reports, and doctor licenses. | AWS S3 Console |
| `TURN_SERVER_URL` | **Pending** | Recommended | `turn:turn.example.com:3478` | TURN relay server URL for WebRTC video traversal across symmetric mobile NAT. | Twilio Network Traversal or Self-Hosted Coturn |
| `TURN_USERNAME` | **Pending** | Recommended | `healthmate_user` | Authentication username for TURN relay server. | Coturn / Twilio Console |
| `TURN_CREDENTIAL` | **Pending** | Recommended | `<turn-credential-token>` | Authentication password / shared secret for TURN relay. | Coturn / Twilio Console |

---

## 3. AI MICROSERVICE ENVIRONMENT VARIABLES (`ai-service/.env`)

| Variable Name | Status | Necessity | Default / Sample Format | Purpose & Description | Free Tier / Production Source |
|---|---|---|---|---|---|
| `PORT` | **Configured** | Required | `8000` | Port on which Uvicorn ASGI server listens. | Host provided |
| `ENV` | **Configured** | Required | `production` / `development` | Toggles OpenAPI interactive docs and debug verbosity. | System environment |
| `GEMINI_API_KEY` | **Configured** | Recommended | `AIzaSy...` | Powers generative clinical symptom summaries and conversational health assistant. | Google AI Studio Free Tier (15 RPM / 1M TPM) |
| `OPENROUTER_API_KEY` | **Configured** | Optional Fallback | `sk-or-v1-...` | Alternative multi-LLM router if Gemini rate limit is encountered. | OpenRouter Free Models (`deepseek/deepseek-r1:free`, `meta-llama/llama-3.3-70b-instruct:free`) |
| `MODEL_WEIGHTS_PATH` | **Configured** | Required | `./models` | Directory containing Scikit-learn triage pipeline and PyTorch vision weights. | Local container directory |
| `TESSERACT_CMD` | **Configured** | Required for OCR | `/usr/bin/tesseract` | System binary path for optical character recognition of blood reports and labs. | Pre-installed via `apt-get install tesseract-ocr` |

---

## 4. FRONTEND ENVIRONMENT VARIABLES (`frontend/.env.production`)

| Variable Name | Status | Necessity | Default / Sample Value | Purpose & Description |
|---|---|---|---|---|
| `VITE_API_BASE_URL` | **Configured** | Critical | `https://healthmate-backend-9nmm.onrender.com/api/v1` | Target endpoint for all client REST requests. |
| `VITE_AI_SERVICE_URL`| **Configured** | Critical | `https://healthmate-ai-service.onrender.com` | Direct endpoint for client-side streaming and imaging analysis. |
| `VITE_SOCKET_URL` | **Configured** | Required | `https://healthmate-backend-9nmm.onrender.com` | Target for Socket.IO real-time chat, notifications, and WebRTC signaling. |
| `VITE_RAZORPAY_KEY_ID`| **Configured** | Required | `rzp_test_...` | Public Razorpay key injected into the browser checkout script. |
| `VITE_DEFAULT_UPI_ID` | **Configured** | Required | `healthmate@okhdfcbank` | Default payee VPA rendered on the frontend payment modal. |
| `VITE_CLINIC_NAME` | **Configured** | Required | `HealthMate AI` | Application branding rendered across UI headers and receipts. |

---

## 5. ZERO-SECRET VERIFICATION & INTEGRITY CONFIRMATION

1. **No Production Keys in Source Control:**
   A comprehensive repository grep was performed across all committed files (`git log -p`, `git grep`). All `.env` files in root, `backend/`, `frontend/`, and `ai-service/` are strictly excluded via `.gitignore`.
2. **Safe Example Templates:**
   Each service contains a sanitized template (`.env.example`) documenting variable names with dummy placeholder values (`your_key_here`), ensuring new developers or CI/CD pipelines can deploy safely without credential leakage.
3. **Runtime Encryption:**
   All communications across services occur over enforced TLS 1.3 (`https://` and `wss://`). MongoDB and Redis connections enforce SSL/TLS encryption in transit (`mongodb+srv://` and `rediss://`).
