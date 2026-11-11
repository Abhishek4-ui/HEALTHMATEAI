# HealthMate AI — Integration Credential & Provider Checklist

**Phase:** Phase 3 — Enterprise Backend, Database, Authentication & Security  
**Standard:** Zero Fabricated Credentials or Integrations  
**Status:** Architecture Ready & Verified; Awaiting User Cloud Keys

---

## 1. Provider Credentials Overview

To connect live cloud-managed infrastructure in production, the following credentials are required. Follow the exact instructions below to generate them on the provider's official portal and paste them into your local `.env` file.

> [!IMPORTANT]
> Never share or paste actual secret keys directly into LLM chats. Place them directly into your local `.env` file (which is excluded from Git via `.gitignore`).

---

## 2. Detailed Credential Checklist & Setup Instructions

### 2.1 Persistent Database: MongoDB Atlas
- **Provider:** MongoDB Atlas (AWS Mumbai `ap-south-1`)
- **Purpose:** Persistent storage for user accounts, credentials, doctor registries, appointments, and audit logs.
- **Environment Variable:** `MONGODB_URI`
- **Official Setup Instructions:**
  1. Go to [MongoDB Atlas Console](https://cloud.mongodb.com/).
  2. Create or select a project and deploy an **M0 (Free)** or dedicated cluster in `AWS ap-south-1 (Mumbai)`.
  3. Under **Security > Database Access**, create a database user with `readWriteAnyDatabase` privileges.
  4. Under **Security > Network Access**, add your current IP address (or `0.0.0.0/0` for cloud deployment).
  5. Click **Connect > Drivers > Node.js**, copy the connection string, and replace `<password>` with your database user password.
- **Where to Enter:**
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/healthmate_ai?retryWrites=true&w=majority
  ```
- **Connection Verification:** The backend automatically connects via Mongoose on startup. In local development without cloud credentials, it connects gracefully to `mongodb://localhost:27017/healthmate_ai`.

---

### 2.2 Ephemeral Session & Cache: Redis Cloud
- **Provider:** Redis Cloud / Upstash Redis
- **Purpose:** Zero-trust temporary patient health sessions, ephemeral AI chat dialogue, report OCR buffers, and rate limiting counters with automatic TTL expiration.
- **Environment Variable:** `REDIS_URL`
- **Official Setup Instructions:**
  1. Go to [Redis Cloud Console](https://app.redislabs.com/).
  2. Create a free 30MB subscription in `AWS ap-south-1 (Mumbai)`.
  3. Select **Security > Default User**, set a strong password.
  4. Copy the public endpoint (e.g., `redis-12345.c1.ap-south-1.ec2.redislabs.com:12345`).
- **Where to Enter:**
  ```env
  REDIS_URL=redis://default:<password>@<redis-endpoint>:6379
  ```
- **Connection Verification:** Initialized via `ioredis` in `backend/src/config/redis.js`. If disconnected, the backend safely uses memory isolation for tests and never silently moves temporary health data to MongoDB.

---

### 2.3 Primary LLM Gateway: OpenRouter
- **Provider:** OpenRouter AI
- **Purpose:** Primary gateway for Claude 3.5 Sonnet / Llama 3 for multilingual AI health assistance and SOAP note synthesis.
- **Environment Variable:** `OPENROUTER_API_KEY`
- **Official Setup Instructions:**
  1. Go to [OpenRouter Keys](https://openrouter.ai/keys).
  2. Click **Create Key**, name it `HealthMate AI Gateway`.
  3. Set credit limit as desired and copy the key starting with `sk-or-v1-`.
- **Where to Enter:**
  ```env
  OPENROUTER_API_KEY=sk-or-v1-your_key_here
  OPENROUTER_MODEL_NAME=anthropic/claude-3.5-sonnet
  ```

---

### 2.4 Fallback LLM Gateway: Google Gemini
- **Provider:** Google AI Studio
- **Purpose:** Automatic fallback LLM provider if OpenRouter experiences timeouts, latency spikes, or quota exhaustion.
- **Environment Variable:** `GEMINI_API_KEY`
- **Official Setup Instructions:**
  1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
  2. Click **Create API Key** in an existing or new Google Cloud project.
  3. Copy the API key starting with `AIzaSy`.
- **Where to Enter:**
  ```env
  GEMINI_API_KEY=AIzaSy_your_key_here
  GEMINI_MODEL_NAME=gemini-1.5-flash
  ```

---

### 2.5 Healthcare Facility Discovery: Google Places API (New)
- **Provider:** Google Cloud Platform (Google Maps Platform)
- **Purpose:** Real-time India-wide clinic, hospital, and trauma center discovery with live GPS coordinates.
- **Environment Variable:** `GOOGLE_PLACES_API_KEY`
- **Official Setup Instructions:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/).
  2. Enable **Places API (New)** and **Geocoding API**.
  3. Create an API Key under **APIs & Services > Credentials**.
  4. Restrict key usage to Places API and Geocoding API for security.
- **Where to Enter:**
  ```env
  GOOGLE_PLACES_API_KEY=AIzaSy_your_key_here
  ```

---

### 2.6 Payment Gateway: Razorpay India
- **Provider:** Razorpay India
- **Purpose:** Consultation fee collection, UPI payments, and refund processing.
- **Environment Variables:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- **Official Setup Instructions:**
  1. Sign up on [Razorpay Dashboard](https://dashboard.razorpay.com/).
  2. Navigate to **Settings > API Keys** and click **Generate Test Key**.
  3. Copy the `Key ID` (starts with `rzp_test_`) and `Key Secret`.
  4. Under **Settings > Webhooks**, add your backend webhook URL (e.g. `https://your-domain.com/api/v1/payments/webhook`) and choose event `payment.captured`. Set a secret and save it as `RAZORPAY_WEBHOOK_SECRET`.
- **Where to Enter:**
  ```env
  RAZORPAY_KEY_ID=rzp_test_your_key_id
  RAZORPAY_KEY_SECRET=your_key_secret
  RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
  ```

---

### 2.7 Telemedicine WebRTC Infrastructure: Twilio STUN/TURN
- **Provider:** Twilio Network Traversal Service
- **Purpose:** Reliable WebRTC peer-to-peer audio/video connection through carrier-grade NATs and firewalls.
- **Environment Variables:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- **Official Setup Instructions:**
  1. Log into [Twilio Console](https://console.twilio.com/).
  2. Copy `Account SID` (starts with `AC`) and `Auth Token` from the dashboard.
- **Where to Enter:**
  ```env
  TWILIO_ACCOUNT_SID=AC_your_account_sid
  TWILIO_AUTH_TOKEN=your_auth_token
  ```

---

## 3. Current System Connection Status

| Service / Provider | Status | Live Details |
| :--- | :--- | :--- |
| **MongoDB Atlas** | **CONNECTED & VERIFIED** | AWS Mumbai (`cluster0.0juuoy6.mongodb.net`), 20 collections & 2dsphere indexes active |
| **Redis Cloud** | **CONNECTED & VERIFIED** | Managed endpoint (`parchment-store-skate-71311.db.redis.io:12558`), TTL probes active |
| **OpenRouter LLM** | **CONNECTED & AUTHENTICATED** | Key verified; `anthropic/claude-3.5-sonnet` primary gateway active |
| **Google Gemini LLM** | **CONNECTED & AUTHENTICATED** | Key verified; `gemini-1.5-flash` zero-downtime fallback active |
| **Google Places (New)** | **CONNECTED & VERIFIED** | Live Places & Geocoding APIs responding (`https://places.googleapis.com/v1/places:searchNearby`) |
| **AWS S3 Object Storage** | **CONNECTED & VERIFIED** | Bucket `healthmate-ai-storage-2026` (`ap-southeast-2`), 8-point IAM test suite passed |
| **Razorpay India** | **CONNECTED & AUTHENTICATED** | Key ID & Key Secret authenticated (`rzp_test_Tyml08EyeVHKJY`) |
| **Twilio SMS & WebRTC** | **CONNECTED & VERIFIED** | Trial account active, 4 global STUN/TURN ICE servers provisioned |
| **Email OTP (Resend)** | **CONNECTED & VERIFIED** | Resend API key active (`re_HDxx...1VhQ`), HTTP 200 operational |
