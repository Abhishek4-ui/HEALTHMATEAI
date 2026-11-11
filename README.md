# HealthMate AI — Enterprise Healthcare AI Platform

HealthMate AI is an enterprise-grade clinical decision support, teleconsultation, and health intelligence platform built with modern full-stack web technologies, authentic hybrid Machine Learning and Deep Learning pipelines, and zero-trust ephemeral memory architecture.

The platform provides dedicated, role-based workflows for three distinct healthcare actors:
- **PATIENT Portal:** Symptom triage intake, chronic risk assessments (CVD & Diabetes), medical document OCR extraction, doctor and hospital discovery, P2P WebRTC video consultations, appointment booking, and sovereign DPDP "Forget Me" privacy controls.
- **DOCTOR Portal:** Patient queue management, clinical consultation workspace, AI-assisted SOAP note drafting with mandatory physician sign-off, digital prescription issuance with automated pharmacovigilance contraindication screening, and encrypted video rooms.
- **ADMINISTRATION Portal:** Healthcare registry synchronizer, practitioner credential verification, hospital directory management, MLOps telemetry and model drift monitoring, immutable audit logging, and system security controls.

---

## Technology Stack

| Layer | Framework / Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Client** | React 18, Vite 5, Tailwind CSS, Framer Motion, Lucide Icons | Responsive, accessible SPA across Patient, Doctor, and Admin portals |
| **Core API Gateway** | Node.js 20 LTS, Express 4, Argon2, JWT (Dual-Token), Helmet, Rate Limiter | API routing, RBAC, ownership checks, data sync, and payment verification |
| **AI / ML Microservice**| Python 3.11, FastAPI, Uvicorn, PyTorch 2.15, Scikit-Learn, SHAP | Symptom classification, risk models, clinical RAG, and Tesseract OCR |
| **Signaling & Telehealth**| Socket.IO + Native WebRTC (`RTCPeerConnection`) | Peer-to-peer encrypted two-way audio and video consultations |
| **Database & Cache** | MongoDB Atlas (Multi-Shard Replica Set) + Redis 7 (`volatile-ttl`) | Permanent records in MongoDB; ephemeral 1-hr patient sessions in Redis |
| **Object Storage** | AWS S3 (Presigned URLs with 15-min TTL & 24-hr lifecycle purge) | Secure, ephemeral lab report staging and encrypted document viewing |
| **Payment Gateway** | Razorpay SDK (HMAC SHA-256 Webhook Verification) | Consultation slot reservations and patient fee settlement |
| **Container Engine** | Docker & Docker Compose | Multi-container local orchestration and cloud deployment images |

---

## Project Structure

```
HEALTHMATEAI/
├── frontend/                     # React 18 Single-Page Application (Vite)
│   ├── src/
│   │   ├── components/           # Reusable UI widgets, badges, navigation
│   │   ├── pages/                # Patient (19), Doctor (13), Admin (14), Public modules
│   │   ├── services/             # Axios API service wrappers
│   │   └── context/              # AuthContext, ThemeContext, ToastContext
│   ├── vercel.json               # Vercel SPA routing & security headers
│   └── package.json
│
├── backend/                      # Node.js Express API Gateway
│   ├── src/
│   │   ├── controllers/          # Endpoint controllers
│   │   ├── middlewares/          # Auth (JWT), RBAC, Ownership, Rate Limiter
│   │   ├── models/               # Mongoose schemas (MongoDB Atlas)
│   │   ├── security/             # Argon2 password hashing, sanitize, redact
│   │   ├── services/             # Communication, Payment, Sync, Audit, AI Gateway
│   │   └── sockets/              # WebRTC Socket.IO signaling handlers
│   ├── tests/                    # Jest integration & unit test suites (85 tests)
│   ├── Dockerfile                # Production Node.js 20 Alpine container
│   └── package.json
│
├── ai-service/                   # FastAPI Python Machine Learning Microservice
│   ├── app/                      # Endpoints & Services (Triage, Risk, RAG, OCR, MLOps)
│   ├── data/                     # External benchmarks (UCI Heart, NIDDK Pima, Vignettes)
│   ├── models/                   # Serialized model weights (.joblib, .pt)
│   ├── scripts/                  # Model training and external validation suites
│   ├── tests/                    # PyTest test suite (11 tests)
│   ├── Dockerfile                # Python 3.11 Slim container with Tesseract OCR
│   └── requirements.txt          # Pinned ML/DL Python dependencies
│
├── docker-compose.yml            # Multi-container Compose spec with health checks
├── render.yaml                   # Production Cloud Blueprint for Backend & AI services
├── README.md                     # Master project documentation
└── [Essential Documentation]     # Architecture, API specifications, and privacy policies
```

---

## Local Development Setup

### Prerequisites
- **Node.js:** v20.x or higher
- **Python:** v3.11.x or higher
- **Tesseract OCR:** v5.x installed (`brew install tesseract` on macOS / `apt-get install tesseract-ocr` on Linux)
- **MongoDB:** Local instance or free MongoDB Atlas cluster connection string
- **Redis:** Local instance or Upstash Redis URL

### 1. Clone & Configure Environment Variables
Copy the template files and fill in your local or cloud service credentials:

```bash
# In backend directory
cp backend/.env.template backend/.env

# In root directory (if using shared root config)
cp .env.example .env
```

Key environment variables:
```ini
# Backend Gateway (backend/.env)
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/healthmate_ai?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your_long_random_jwt_access_secret_min_64_chars!
JWT_REFRESH_SECRET=your_long_random_jwt_refresh_secret_min_64_chars!
AI_SERVICE_URL=http://localhost:8000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SMS_ENABLED=false

# AI Microservice (ai-service/.env)
ENVIRONMENT=development
PORT=8000
REDIS_URL=redis://localhost:6379
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Install Dependencies
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# AI Service (in virtualenv)
cd ../ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Running the Application

### Option A: Manual Local Microservices
Run each tier in a dedicated terminal window:

```bash
# 1. FastAPI AI Microservice (Port 8000)
cd ai-service
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Node.js Backend Gateway (Port 5001)
cd backend
npm run dev

# 3. Vite React Frontend (Port 5173)
cd frontend
npm run dev
```

Navigate to `http://localhost:5173` to access the application.

### Option B: Docker Compose Multi-Container Orchestration
To start all services (MongoDB, Redis, Backend, AI Service) in isolated containers:

```bash
docker compose up --build -d
```

Verify service status and health checks:
```bash
docker compose ps
```

---

## Automated Test Suites

All tests execute against authentic local microservice components:

```bash
# 1. Backend Jest Integration Suite (85 tests across 8 suites)
cd backend
npm test

# 2. AI Service PyTest Suite (11 tests)
cd ai-service
./venv/bin/pytest tests/ -v

# 3. Frontend Production Build Check
cd frontend
npm run build
```

---

## Clinical Safety & Pharmacovigilance Rules

1. **Advisory Decision Support:** HealthMate AI is an informational screening and preliminary intake aid. It does not independently diagnose medical conditions or dispense prescriptions without licensed clinician oversight.
2. **Canonical Drug Safety Status:** Unassessed medication combinations strictly return `safety_status = "NOT_ASSESSED"`. The platform never reports unassessed drug pairs as `SAFE`.
3. **Emergency Red-Flag Detection:** Real-time symptom triage triggers immediate high-priority emergency alerts upon detecting acute cardiac, respiratory, or neurological red-flag patterns.
4. **Sovereign Privacy (DPDPA 2023):** Unauthenticated guest triage data is stored strictly in volatile Redis memory (1-hour TTL). Triggering the "Forget Me" purge permanently expunges all session dialogue and temporary lab files.

---

## Production Cloud Deployment

### 1. Frontend Deployment (Vercel)
- Connect the repository to Vercel and point the root directory to `frontend/`.
- Framework Preset: `Vite`.
- Build Command: `npm run build`. Output Directory: `dist`.
- Ingest `VITE_API_BASE_URL=https://api.yourdomain.com/api/v1` in Vercel environment variables.

### 2. Backend Gateway & AI Microservice (Render)
- Deploy using the provided [`render.yaml`](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/render.yaml) blueprint:
  - `healthmate-backend` (Node.js Web Service on standard plan)
  - `healthmate-ai-service` (Docker Web Service with Tesseract OCR on standard plan)
- Add production MongoDB Atlas, Redis, JWT secrets, and API keys via the Render dashboard.

---

## License

This project is developed for academic and technical demonstration purposes under the MIT License. Clinical guidelines and benchmark datasets are utilized in accordance with their respective open licenses (CC BY 4.0 and Public Domain CC0).
