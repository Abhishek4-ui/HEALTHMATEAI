# HEALTHMATE AI — FREE & OPEN-SOURCE STACK ALTERNATIVES

**Date:** November 12, 2026  
**Auditor:** Principal DevOps Engineer & Full-Stack Architect  

---

## 1. COMPREHENSIVE FREE SERVICE COMPARISON MATRIX

| SERVICE | CURRENT PROVIDER | FREE ALTERNATIVE | FREE LIMIT | POSSIBLE CHARGES | REQUIRED API KEY | KYC / APPROVAL | IMPLEMENTATION STATUS |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Database** | MongoDB Atlas M0 | Self-hosted MongoDB / Atlas Free | 512 MB Storage | $0 on free tier; \$0.08/hr for dedicated M10+ | MongoDB Connection URI | None | **WORKING** |
| **Cache & Sessions** | Redis Cloud | Redis Cloud Free / Local Redis | 30 MB In-Memory | $0 on free tier; \$5/mo if exceeding 30MB | Redis URL + Password | None | **WORKING** |
| **Email OTP Dispatch** | Gmail SMTP | Google App Password Transport | 500 emails/day | $0 permanently on personal Gmail | 16-char App Password (`SMTP_PASS`) | 2FA on Google Account | **WORKING** |
| **Email Backup Gateway** | Resend API | Resend Free Allowance | 100 emails/day (3,000/mo) | $0 on free plan; \$20/mo for Pro | Resend API Key (`re_...`) | Domain DNS TXT verification | **WORKING** |
| **Mobile SMS Gateway** | Fast2SMS / Twilio | Dual-Channel Email OTP / Firebase Phone Auth | Unlimited Email OTP; 10,000 Firebase Phone/mo | Fast2SMS: ~₹0.20/SMS; Twilio: \$0.079/SMS | Firebase Config / DLT Header | TRAI Enterprise DLT & Business PAN | **BLOCKED (DLT) — EMAIL ACTIVE** |
| **Payment Gateway** | Razorpay Gateway | Manual UPI QR + UTR Reconciliation | Unlimited Direct UPI; 0% transaction fee | Razorpay Live: 2% + 18% GST per payment; Manual UPI: ₹0 | `MERCHANT_UPI_ID` (e.g. UPI ID) | Bank Account Holder KYC | **WORKING (DUAL-RAIL ACTIVE)** |
| **Maps & Geocoding** | Google Places / Geocode | OpenStreetMap + Nominatim API | 1 req/sec Nominatim Usage Policy | Google Places: \$17 per 1,000 queries; OSM: \$0 | None (Requires User-Agent) | None | **WORKING (100% FREE)** |
| **Clinical AI Inference** | OpenRouter / Gemini | Local Scikit-Learn + PyTorch + Ollama | Unlimited Local Hardware Inference | Cloud AI: \$0.001 - \$0.02 per 1k tokens; Local: \$0 | Optional (`OPENROUTER_API_KEY`) | None for local models | **WORKING (LOCAL ACTIVE)** |
| **Medical Document Storage** | AWS S3 Bucket | Local Encrypted Disk / MinIO S3 | 5 GB AWS S3 free tier (12 mo) / Local Disk | AWS: \$0.023/GB/mo after 5GB; Local: \$0 | AWS Access Key / Secret | None for local disk | **WORKING (HYBRID ACTIVE)** |
| **WebRTC Media Traversal** | Google STUN | `stun:stun.l.google.com:19302` | Unlimited Public STUN Requests | TURN Server (Coturn): ~\$5/mo VPS; STUN: \$0 | None | None | **WORKING (FREE STUN)** |
| **Frontend CDN Hosting** | Vercel Edge | Vercel Hobby Free Tier | 100 GB Bandwidth/mo | $0 on Hobby; \$20/mo for Pro | Vercel Account | None | **WORKING** |
| **Backend & AI Compute** | Render Cloud | Render Free Web Service / Docker | 750 free instance hrs/mo | $0 on Free (spins down after 15m idle); \$7/mo Starter | Render Account | None | **WORKING** |

---

## 2. DEEP DIVE: IMPLEMENTED FREE ALTERNATIVES

### 2.1 Free OpenStreetMap & Nominatim vs Google Places
- **Problem with Google Places:** Requires valid credit card billing, enforces strict quotas, and costs \$17–\$32 per 1,000 requests.
- **Implemented Free Alternative:**
  - Added [`osmDiscovery.service.js`](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/backend/src/services/osmDiscovery.service.js) using the OpenStreetMap Nominatim geocoding engine with compliant User-Agent headers.
  - Implemented instant zero-network geocoding for all 36 Indian States and Union Territories via local pre-computed centroid coordinates.
  - Enabled Leaflet-compatible coordinates output and distance calculations via the Haversine formula.

### 2.2 Manual UPI Payment System (Zero Transaction Fees) vs Commercial Aggregators
- **Problem with Commercial Gateways:** Razorpay requires formal corporate KYC, GST registration, bank account merchant verification, and charges 2% MDR on every transaction.
- **Implemented Free Alternative:**
  - Implemented a direct peer-to-merchant UPI payment workflow using the standard Indian NPCI UPI deep-linking protocol (`upi://pay?pa=...`).
  - Supports configurable genuine merchant details via `MERCHANT_UPI_ID` and `MERCHANT_NAME`.
  - Generates unique internal payment references (`UPI-HM-XXXXX`).
  - Allows patients to submit their 12-digit bank UTR reference number and upload receipt images.
  - Enforces mandatory administrator verification against bank credits before granting access, completely preventing fake screenshot or dummy UTR exploitation.

### 2.3 Gmail SMTP & Resend vs Paid SMS Gateways
- **Problem with Carrier SMS:** Fast2SMS and other Indian telecom providers are gated by TRAI DLT regulations requiring commercial registration, entity registration fees, and template approvals.
- **Implemented Free Alternative:**
  - Standardized on Google SMTP utilizing 16-character Google App Passwords. This provides 500 completely free, instantaneous, high-deliverability transactional emails per day.
  - Coupled with Resend free tier (100 emails/day) for automatic fallback upon SMTP network timeouts.
  - Enforced strict production hardening: 0 plain OTP exposure in logs, frontend UI, or network responses, accompanied by 30-second cooldown rate limits and single-use key deletion.

### 2.4 Local Scikit-Learn, PyTorch & SHAP vs Proprietary LLM Endpoints
- **Problem with Proprietary APIs:** OpenRouter, OpenAI, and Anthropic APIs incur recurring per-token inference charges and may experience external outages or rate limits.
- **Implemented Free Alternative:**
  - The Python FastAPI AI microservice executes clinical triage locally using Scikit-Learn classifiers and SHAP feature importance explainers.
  - Medical computer vision executes on PyTorch 2.15 using Torchvision convolutional neural networks for pulmonary opacity and cardiomegaly screening.
  - 12-Lead ECG waveform analysis executes locally via SciPy signal processing with zero external API fees.

### 2.5 Hybrid Private Object Storage (S3 + Local Encrypted Disk)
- **Problem with Cloud Storage:** AWS S3 incurs storage and data transfer charges once exceeding the 5GB initial free allowance.
- **Implemented Free Alternative:**
  - Configured a resilient hybrid storage tier in `report.service.js`.
  - When AWS S3 credentials are present, files are stored privately in S3 with 15-minute presigned URLs.
  - When S3 is unconfigured or unavailable, files are stored on secure local disk storage with strict MIME type validation (PDF, JPG, PNG, max 10MB) and randomized cryptographic tokens, completely protecting user medical privacy at zero cost.
