# HEALTHMATE AI — PRODUCTION DEPLOYMENT CHECKLIST
## Pre-Flight Readiness, Containerization, Health Probes & Rollback Procedures

**Document Reference:** `HM-P8.3-PROD-DEPLOY-001`  
**Evaluation Date:** November 11, 2026  
**Auditor:** DevSecOps & Site Reliability Engineering (SRE)  
**Readiness Status:** **GATE_READY_FOR_STAGING_DEPLOYMENT** (No automated deployment without explicit user sign-off)

---

### 1. Pre-Flight Verification Matrix

Every deployment requirement has been empirically audited and categorized:

| Subsystem / Component | Check Item | Status | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **Container Engine** | Multi-container Compose spec | **PASS** | `docker-compose.yml` defining MongoDB, Redis, Backend, AI-Service |
| **Backend Container** | Node.js 20 Alpine Dockerfile | **PASS** | `backend/Dockerfile` with production dependency build |
| **AI Microservice Container**| Python 3.11 Slim with Tesseract OCR | **PASS** | `ai-service/Dockerfile` with `tesseract-ocr` & `libgomp1` packages |
| **Frontend Production Build**| Vite optimized bundle compilation | **PASS** | `npm run build` completed in 2.38s; zero warnings/errors |
| **Database Persistence** | MongoDB Atlas multi-shard cluster | **PASS** | Connected to MongoDB Atlas cluster (`ac-pnacdtx-shard-00-02`) |
| **In-Memory Cache & TTL** | Redis volatile-ttl configuration | **PASS** | Maxmemory policy `volatile-ttl` verified; handles ephemeral session purge |
| **Health Check Endpoints** | REST & Microservice probes | **PASS** | `GET /health` on Backend (Port 5001) & AI Service (Port 8000) return 200 |
| **Credential Security** | Clean repository history & .gitignore | **PASS** | No secrets in Git commits; `.env` excluded |
| **Pharmacovigilance Rule** | Unassessed drug combinations | **PASS** | Returns `NOT_ASSESSED`, never claims `SAFE` |
| **External Model Validation**| UCI & Pima independent benchmarks | **PASS** | Evaluated on external datasets with zero fabricated metrics |
| **SMS Gateway Readiness** | Twilio & TRAI DLT registration | **BLOCKED** | Twilio trial-restricted until TRAI DLT Entity registration is finalized |

---

### 2. Service Architecture & Container Orchestration

The application stack is orchestrated via Docker Compose:

```
                      ┌────────────────────────┐
                      │    Vite Web Client     │ (Port 5173 / Production CDN)
                      │ (React 18 + Tailwind)  │
                      └───────────┬────────────┘
                                  │ HTTPS / WSS
                                  ▼
                      ┌────────────────────────┐
                      │  Express API Gateway   │ (Port 5000 / 5001)
                      │  (Node.js 20 Alpine)   │
                      └─────┬────────────┬─────┘
           REST / WSS       │            │ Internal REST
     ┌──────────────────────┘            └──────────────────────┐
     ▼                                                          ▼
┌───────────────┐                                      ┌─────────────────┐
│ Redis 7.2     │                                      │ FastAPI AI Svc  │ (Port 8000)
│ volatile-ttl  │                                      │ PyTorch + Scikit│
└───────────────┘                                      └────────┬────────┘
     ▲                                                          │
     │ Audit & Sessions                                         │ MLOps & RAG
     ▼                                                          ▼
┌───────────────┐                                      ┌─────────────────┐
│ MongoDB Atlas │                                      │ Local Models    │
│ Multi-Shard   │                                      │ .pt & .joblib   │
└───────────────┘                                      └─────────────────┘
```

#### Docker Health Probe Configurations:
- **Backend Probe:** `curl -f http://localhost:5000/health || exit 1`
  - Interval: 30s | Timeout: 5s | Retries: 3 | Start Period: 10s
- **AI Service Probe:** `curl -f http://localhost:8000/health || exit 1`
  - Interval: 30s | Timeout: 5s | Retries: 3 | Start Period: 15s

---

### 3. Environment Variable Audit & Configuration Matrix

All configuration parameters are sourced strictly from environment variables:

#### Backend Service (`backend/.env`):
| Variable Name | Required | Default / Mode | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production security optimizations & logging |
| `PORT` | Yes | `5000` | Port for Express API gateway |
| `CLIENT_URL` | Yes | `https://healthmate.ai` | CORS allowed origin |
| `MONGODB_URI` | Yes | Secret | MongoDB Atlas connection URI with TLS |
| `REDIS_URL` | Yes | Secret | Upstash or standalone Redis connection URI |
| `JWT_ACCESS_SECRET` | Yes | Secret | 256-bit secret for short-lived access tokens (15m) |
| `JWT_REFRESH_SECRET`| Yes | Secret | 256-bit secret for refresh tokens (7d) |
| `AI_SERVICE_URL` | Yes | `http://ai-service:8000` | Internal network URL for FastAPI microservice |
| `RAZORPAY_KEY_ID` | Yes | Secret | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET`| Yes | Secret | Razorpay API key secret |
| `AWS_ACCESS_KEY_ID` | Optional | Secret | AWS IAM access key for report storage |
| `AWS_SECRET_ACCESS_KEY`| Optional | Secret | AWS IAM secret key |
| `AWS_S3_BUCKET` | Optional | `healthmate-ai-storage-2026` | S3 bucket name |
| `SMTP_USER` | Optional | Secret | Gmail SMTP account email |
| `SMTP_PASS` | Optional | Secret | Google 16-character App Password |
| `SMS_ENABLED` | Yes | `false` (in staging) | Administratively disables SMS until TRAI DLT approval |

#### AI Microservice (`ai-service/.env`):
| Variable Name | Required | Default / Mode | Purpose |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Yes | `production` | Disables debug mode and autoreload |
| `PORT` | Yes | `8000` | Uvicorn binding port |
| `REDIS_URL` | Yes | Secret | Redis connection for caching and telemetry |
| `OPENROUTER_API_KEY`| Optional | Secret | High-tier reasoning model provider |
| `GEMINI_API_KEY` | Optional | Secret | Secondary reasoning fallback provider |

---

### 4. Health Checks & Monitoring Telemetry

1. **System Health Endpoint (`GET /health`):**
   ```json
   {
     "status": "HEALTHY",
     "timestamp": "2026-11-11T18:40:00.000Z",
     "uptime": 2341.5,
     "services": {
       "database": "CONNECTED",
       "redis": "CONNECTED",
       "aiGateway": "HEALTHY",
       "razorpay": "INITIALIZED"
     }
   }
   ```
2. **AI Microservice Health (`GET /health` on port 8000):**
   ```json
   {
     "status": "healthy",
     "service": "healthmate-ai-microservice",
     "models_loaded": 4,
     "rag_index": "active",
     "tesseract": "available"
   }
   ```
3. **MLOps Drift Telemetry (`GET /api/v1/admin/mlops/drift`):**
   - Continuously computes Kolmogorov-Smirnov distribution drift across patient intake vitals (blood pressure, BMI, glucose).
   - Generates automated alert when KS statistic exceeds threshold ($p < 0.05$).

---

### 5. Automated Rollback & Incident Response Procedures

In the event of a production anomaly, SRE personnel must execute the following procedures:

#### 5.1 Automated Model Rollback
If a newly deployed model artifact exhibits inference anomalies or excessive prediction entropy:
1. Trigger MLOps Rollback endpoint:
   `POST /api/v1/admin/mlops/models/rollback` with `{ "target_model_id": "mdl_symp_nlp_v2", "revert_to_version": "2.1.0" }`.
2. Microservice automatically swaps the in-memory inference pipeline back to the previous stable checkpoint without restarting container processes.

#### 5.2 Emergency Traffic Divert (Circuit Breaking)
If the AI microservice encounters latency spikes exceeding 3,000ms:
- The Node.js API Gateway (`aiGateway.service.js`) activates circuit-breaker fallback mode.
- Inference gracefully falls back to deterministic rule-based triage and returns `NOT_ASSESSED` for unassessed drug interactions.

---

### 6. Production Gate Sign-Off

- **Security Verification:** **PASS**
- **Test Suite Scorecard:** **85/85 Jest Tests PASS | 11/11 Pytest Tests PASS**
- **Frontend Production Compilation:** **PASS (2.38s)**
- **Automated Deployment Execution:** **PAUSED** (Awaiting explicit human operator instruction)
