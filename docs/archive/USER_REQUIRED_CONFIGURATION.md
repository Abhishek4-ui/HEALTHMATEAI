# HEALTHMATE AI — USER REQUIRED CONFIGURATION CHECKLIST

**Document Version:** 2.0 (Production Release)  
**Security Notice:** Never post raw passwords, secret keys, or merchant credentials in chat dialogues or public version control. Configure them directly in your local `.env` files or the secure environment variable settings of Vercel and Render dashboards.

---

## CATEGORY A: REQUIRED IMMEDIATELY (MINIMUM FUNCTIONAL BASELINE)

All items in Category A are already configured or available through free tiers to keep the platform operational.

### 1. MongoDB Atlas Database
- **Official Registration URL:** [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
- **Account Type:** Free Tier (M0 Sandbox)
- **Service to Enable:** Shared Cluster M0 (AWS or GCP region)
- **Dashboard Navigation:** *Clusters -> Connect -> Drivers -> Node.js -> View Connection String*
- **Environment Variable:** `MONGODB_URI`
- **Current Status:** Configured & Connected to Atlas replica set (`ac-pnacdtx-shard-00-02.0juuoy6.mongodb.net`).
- **Testing Procedure:** `npm test tests/health.test.js` verifies database connectivity with HTTP 200.

### 2. Redis Cloud Cache
- **Official Registration URL:** [https://redis.io/try-free/](https://redis.io/try-free/)
- **Account Type:** Free 30MB Database
- **Service to Enable:** Redis Stack / Standard Cache
- **Dashboard Navigation:** *Databases -> Configuration -> Security -> Password / Endpoint*
- **Environment Variable:** `REDIS_URL`
- **Current Status:** Connected to Redis Cloud for session storage, brute-force invalidation, and rate limiting.
- **Testing Procedure:** Request OTP twice within 30 seconds; verify HTTP 400 cooldown enforcement.

### 3. Gmail SMTP Credentials (Free Email OTP)
- **Official Registration URL:** [https://myaccount.google.com/security](https://myaccount.google.com/security)
- **Account Type:** Standard Personal or Google Workspace Account
- **Service to Enable:** 2-Step Verification -> App Passwords
- **Dashboard Navigation:** *Security -> 2-Step Verification (bottom) -> App passwords -> Create App Name 'HealthMate AI'*
- **Environment Variables:**
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_USER=abhishekgga140@gmail.com`
  - `SMTP_PASS=<16_character_app_password_without_spaces>`
- **Free Plan Limitation:** 500 emails per rolling 24 hours.
- **Testing Procedure:** Submit registration at `/register`; verify genuine email arrives in inbox with Message ID.

---

## CATEGORY B: OPTIONAL FREE SERVICE CONFIGURATION

### 1. Resend API (Email Fallback Gateway)
- **Official Registration URL:** [https://resend.com/signup](https://resend.com/signup)
- **Account Type:** Free Tier
- **Service to Enable:** API Keys
- **Dashboard Navigation:** *API Keys -> Create API Key -> Name 'HealthMate-Fallback'*
- **Environment Variable:** `RESEND_API_KEY=re_...`
- **Free Limit:** 100 emails/day, 3,000 emails/month.
- **Testing Procedure:** Trigger OTP dispatch when Gmail SMTP is offline; verify Resend logs delivery.

### 2. Manual UPI Merchant Details (Zero Transaction Fees)
- **Official Registration URL:** Any authorized Indian Bank or BHIM UPI App
- **Account Type:** Individual Savings or Business Current Account with UPI VPA
- **Exact Detail to Provide:**
  - `MERCHANT_UPI_ID`: Your actual VPA (e.g. `yourname@okhdfcbank` or `business@icici`)
  - `MERCHANT_NAME`: Your legal registered business or doctor name
- **Environment Variables:**
  - `MERCHANT_UPI_ID=yourname@bank`
  - `MERCHANT_NAME=HealthMate Medical Care`
- **Testing Procedure:** Navigate to `/patient/appointments`, choose Manual UPI, scan generated QR code, submit 12-digit UTR, and verify receipt on Admin portal at `/admin/settings`.

### 3. OpenStreetMap Geocoding (Zero Configuration Required)
- **Official Documentation:** [https://operations.osmfoundation.org/policies/nominatim/](https://operations.osmfoundation.org/policies/nominatim/)
- **Status:** **Active & 100% Free**. Automatically enabled in `osmDiscovery.service.js` with compliant User-Agent headers. No API key required.

---

## CATEGORY C: PRODUCTION DEPLOYMENT CONFIGURATION

### 1. Vercel Frontend Environment Settings
- **Dashboard URL:** [https://vercel.com/dashboard](https://vercel.com/dashboard)
- **Project Name:** `healthmate-ai`
- **Settings Path:** *Project Settings -> Environment Variables*
- **Variables to Configure:**
  - `VITE_API_BASE_URL=https://healthmate-backend-9nmm.onrender.com/api/v1`
  - `VITE_AI_SERVICE_URL=https://healthmate-ai-service.onrender.com`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 2. Render Backend Web Service Settings
- **Dashboard URL:** [https://dashboard.render.com](https://dashboard.render.com)
- **Service Name:** `healthmate-backend-9nmm`
- **Environment:** Node.js
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `NODE_ENV=production`
  - `PORT=5001`
  - `JWT_SECRET=<strong_64_byte_random_secret>`
  - `JWT_REFRESH_SECRET=<strong_64_byte_random_secret>`
  - `MONGODB_URI=<your_atlas_connection_string>`
  - `REDIS_URL=<your_redis_cloud_url>`
  - `SMTP_USER=abhishekgga140@gmail.com`
  - `SMTP_PASS=<your_gmail_app_password>`
  - `RAZORPAY_KEY_ID=rzp_test_Tyml08EyeVHKJY`
  - `RAZORPAY_KEY_SECRET=<your_razorpay_test_secret>`
  - `MERCHANT_UPI_ID=<optional_merchant_vpa>`
  - `CORS_ORIGIN=https://healthmate-ai-nine-mocha.vercel.app`

### 3. Render FastAPI AI Microservice Settings
- **Dashboard URL:** [https://dashboard.render.com](https://dashboard.render.com)
- **Service Name:** `healthmate-ai-service`
- **Environment:** Python 3.11
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`

---

## CATEGORY D: THIRD-PARTY APPROVAL REQUIRED (REGULATORY GATES)

### 1. Telecom DLT Registration (Fast2SMS / Indian Carrier SMS)
- **Regulatory Body:** Telecom Regulatory Authority of India (TRAI)
- **Official Portal:** [https://www.vilpower.in](https://www.vilpower.in) (Vodafone Idea) or [https://smartping.live](https://smartping.live) (Jio DLT)
- **Account Type:** Enterprise Telemarketer / Principal Entity
- **Mandatory Requirements:**
  - Valid Indian Business PAN
  - Organization Registration / GST Certificate
  - Authorized Signatory ID (Aadhaar / Voter ID)
  - 14-digit Principal Entity ID (PE ID)
  - Registered 6-character Sender Header (e.g. `HLTHMT`)
  - Registered Transactional SMS Template with explicit `{#var#}` placeholders
- **Current Operational Status:** **DELIBERATELY BLOCKED** until DLT entity approval is finalized. Email OTP remains primary.

### 2. Razorpay Live Merchant Activation (Commercial Payments)
- **Official Activation Portal:** [https://dashboard.razorpay.com/#/access/signin](https://dashboard.razorpay.com/#/access/signin)
- **Account Type:** Registered Business / Professional Sole Proprietorship
- **Dashboard Navigation:** *Account & Settings -> KYC & Verification*
- **Mandatory Documentation:**
  - Business PAN Card / Individual PAN
  - Bank Account Cheque / Passbook with IFSC
  - Certificate of Incorporation or GST Registration
  - Healthcare Compliance Undertaking
- **Current Operational Status:** **KEPT IN TEST MODE (`rzp_test_...`)**. Real monetary charges are prevented until formal approval.

---

## CATEGORY E: OPTIONAL PAID SERVICES & FUTURE SCALING

| Service | Provider | Purpose | Estimated Cost | Recommended Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **Dedicated TURN Server** | Coturn on Hetzner/AWS | NAT traversal for symmetric mobile video calls | ~\$5 - \$10 / month | When > 50 simultaneous video calls occur behind strict corporate firewalls |
| **Dedicated S3 Storage** | AWS S3 | Long-term multi-terabyte radiological scan archive | \$0.023 / GB / month | When medical document volume exceeds local disk allowance |
| **OpenAI / Claude LLM** | OpenRouter / Anthropic | Advanced multi-turn conversational health agent | \$0.001 - \$0.015 / 1k tokens | When complex multi-lingual conversational clinical reasoning is required |
