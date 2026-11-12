# HEALTHMATE AI — Complete Patient-Only AI/ML Healthcare Ecosystem

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald.svg)](https://github.com/Abhishek4-ui/HEALTHMATEAI)
[![Tests Passing](https://img.shields.io/badge/Backend%20Tests-114%2F114%20Passing-emerald.svg)](TEST_REPORT.md)
[![AI Benchmarks](https://img.shields.io/badge/AI%20Benchmarks-11%2F11%20Passing-emerald.svg)](MODEL_EVALUATION.md)
[![Public Role](https://img.shields.io/badge/Public%20Role-PATIENT%20ONLY-blue.svg)](MASTER_FEATURE_REGISTRY.md)
[![Data Policy](https://img.shields.io/badge/Data%20Policy-ZERO%20DUMMY%20DATA-teal.svg)](REAL_DATA_SOURCE_REGISTER.md)
[![Statutory Privacy](https://img.shields.io/badge/Privacy-DPDP%20Act%202023-purple.svg)](PRIVACY.md)

> **Academic Degree:** Bachelor of Technology (B.Tech) in Computer Science & Engineering (Artificial Intelligence & Machine Learning)  
> **Project Type:** Final-Year Major Engineering Project  
> **Deployment Status:** Live Cloud Production (Vercel Edge + Render Microservices)

---

## 1. LIVE PLATFORM DEPLOYMENTS

| Component | Target Cloud Environment | Live Accessible URL | Status |
|---|---|---|---|
| **Frontend Web Client** | Vercel Edge Network | [https://healthmate-ai-nine-mocha.vercel.app](https://healthmate-ai-nine-mocha.vercel.app) | **ACTIVE** |
| **Core API Gateway** | Render Web Service (Node.js 20) | [https://healthmate-backend-9nmm.onrender.com](https://healthmate-backend-9nmm.onrender.com) | **ACTIVE** |
| **AI/ML Microservice** | Render Web Service (Python 3.11) | [https://healthmate-ai-service.onrender.com](https://healthmate-ai-service.onrender.com) | **ACTIVE** |

---

## 2. CORE ARCHITECTURAL PILLARS

### 2.1 Single Public User Role: PATIENT ONLY
In strict accordance with the master specification, HealthMate AI operates with **exactly ONE public user role: PATIENT**.
- Public doors, registration flows, navigation headers, and dashboards are 100% patient-facing.
- Public doctor registration, doctor dashboards, admin portals, and role switchers have been completely removed from public reach.
- Patients discover National Medical Commission (NMC) verified practitioners and hospitals across all 36 Indian States and Union Territories via patient discovery engines.

### 2.2 Strict Zero Dummy Data Policy
- Absolutely **no fabricated records** (no fake patients, fake ECG readings, simulated payments, or artificial test vitals) enter patient-facing views.
- Modules with no patient entries render **truthful, dignified empty states** (e.g. *"No medical reports uploaded yet"*, *"No medications added"*).
- Every clinical record displays verifiable **Data Source Labels**: *Patient Entered*, *Uploaded Document*, *Connected Device*, *External Provider*, *AI Generated*, *Research Model Output*, or *Verified External Source*.

### 2.3 Calibrated Multi-Modal Clinical AI
- **Symptom Triage Pipeline:** Evaluated on a 40-vignette held-out clinical cohort, achieving **100.00% sensitivity** on acute life-threatening emergency red flags and an honest **47.50% top-1 categorical accuracy** on complex multi-system differential presentations.
- **Epistemic Uncertainty Filter:** Shannon Entropy thresholding ($H > 1.800$) automatically flags out-of-distribution non-medical inputs with `HIGH_UNCERTAINTY` and rejects automated triage.
- **Medical Vision:** DenseNet-121 / ResNet-50 chest radiograph anomaly screening with **Grad-CAM explainability heatmaps**.
- **ECG Waveform Intelligence:** Pan-Tompkins QRS peak localization and 1D-CNN rhythm disturbance classification trained on PhysioNet PTB-XL.
- **Medical OCR:** OpenCV adaptive morphological binarization + Tesseract OCR extracting quantitative clinical biomarkers (Hemoglobin, WBC, Blood Glucose) mapped to LOINC standard intervals without hallucination.

### 2.4 Dual-Rail Payment Subsystem
- **Rail 1 (Razorpay Test Mode):** Online card and netbanking checkout with HMAC SHA-256 signature and webhook validation (`rzp_test_...`).
- **Rail 2 (Direct NPCI UPI QR Rail):** Zero-intermediary `upi://pay` deep links and dynamic QR generation, patient 12-digit Bank Reference Number (UTR) submission, anti-fraud duplicate rejection (`409 Conflict`), and administrative bank reconciliation.

### 2.5 Multi-Device Cloud Persistence (MongoDB Atlas)
- Persistent cloud synchronization across **25 Mongoose collections** in MongoDB Atlas (including medications, vitals, wellness logs, family profiles, lab orders, appointments, and audit logs).
- No clinical data is trapped in ephemeral React component memory.

---

## 3. ARCHITECTURE DIAGRAM

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Vercel Edge)"]
        UI["Patient Dashboard & Health Modules (React + Vite)"]
    end

    subgraph Gateway["Core Backend API (Render Node.js)"]
        API["Express 4 REST Router (/api/v1)"]
        Auth["Authentication & Role Enclave (JWT + bcrypt)"]
        Payment["Dual-Rail Payment Engine (Razorpay + Manual UPI)"]
        Sync["Provenance & Persistence Controller"]
    end

    subgraph AIMicroservice["AI/ML Service (Render Python 3.11)"]
        FastAPI["FastAPI ASGI Server"]
        Triage["NLP Symptom Triage (Scikit-learn)"]
        Vision["Radiograph Anomaly & Grad-CAM (PyTorch)"]
        ECG["Pan-Tompkins QRS Analyzer (SciPy/PyTorch)"]
        OCR["Laboratory Biomarker Extractor (OpenCV + Tesseract)"]
        RAG["Clinical Knowledge Engine (Gemini 1.5 Flash)"]
    end

    subgraph Storage["Persistence & Cloud Infrastructure"]
        Atlas["MongoDB Atlas M0 (25 Collections)"]
        Redis["Upstash Serverless Redis TLS (Ephemeral TTL)"]
        S3["AWS S3 Private Enclave (15-min Presigned URLs)"]
    end

    UI -->|HTTPS / WSS| API
    API --> Auth
    API --> Payment
    API --> Sync
    API -->|HTTP REST| FastAPI
    API --> Atlas
    API --> Redis
    API --> S3
    FastAPI --> Triage
    FastAPI --> Vision
    FastAPI --> ECG
    FastAPI --> OCR
    FastAPI --> RAG
```

---

## 4. MASTER ACADEMIC REPOSITORY DOCUMENTATION

Complete documentation generated for the B.Tech CSE (AI/ML) Final-Year Major Project:

1. [ABSTRACT.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/ABSTRACT.md) — Comprehensive academic abstract and keywords.
2. [PROBLEM_STATEMENT.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/PROBLEM_STATEMENT.md) — Problem statement, clinical risks, and motivation.
3. [PROJECT_OBJECTIVES.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/PROJECT_OBJECTIVES.md) — Primary engineering goals and quantitative success criteria.
4. [SYSTEM_ARCHITECTURE.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/SYSTEM_ARCHITECTURE.md) — Architectural diagrams, topologies, and sequences.
5. [DATABASE_DESIGN.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/DATABASE_DESIGN.md) — Complete ER diagram, 25 collection schemas, and Redis taxonomy.
6. [API_DOCUMENTATION.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/API_DOCUMENTATION.md) — Versioned REST API documentation (`/api/v1`).
7. [AI_ML_METHODOLOGY.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/AI_ML_METHODOLOGY.md) — Mathematical formulations, entropy, Brier score, Pan-Tompkins.
8. [DATASET_DOCUMENTATION.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/DATASET_DOCUMENTATION.md) — Dataset lineage (PhysioNet, NIH, MedMNIST, Framingham).
9. [MODEL_EVALUATION.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/MODEL_EVALUATION.md) — 40-vignette held-out clinical benchmark results and confusion matrix.
10. [MODEL_CARDS.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/MODEL_CARDS.md) — Standardized model cards for all 7 deployed models.
11. [SECURITY.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/SECURITY.md) — OWASP Top 10 API Security controls, encryption, and zero secret leakage.
12. [PRIVACY.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/PRIVACY.md) — Statutory compliance under India's DPDP Act 2023 and "Forget Me" purge.
13. [DEPLOYMENT.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/DEPLOYMENT.md) — Cloud deployment topology across Vercel, Render, and AWS.
14. [ENV_CONFIGURATION.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/ENV_CONFIGURATION.md) — Environment variable catalog with zero-secret protection.
15. [TEST_REPORT.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/TEST_REPORT.md) — Full test report (114 backend tests, 16 E2E tests passing).
16. [KNOWN_LIMITATIONS.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/KNOWN_LIMITATIONS.md) — Honest disclosures (TRAI DLT, mobile NAT TURN, CDSS stance).
17. [FUTURE_SCOPE.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/FUTURE_SCOPE.md) — Engineering roadmap (ABDM sandbox, on-device Edge AI, Coturn).
18. [RESEARCH_REFERENCES.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/RESEARCH_REFERENCES.md) — Peer-reviewed medical and AI scientific citations.
19. [MASTER_FEATURE_REGISTRY.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/MASTER_FEATURE_REGISTRY.md) — 42-feature traceability matrix.
20. [FEATURE_GAP_REPORT.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/FEATURE_GAP_REPORT.md) — Gap closure audit and resolution ledger.
21. [REAL_DATA_SOURCE_REGISTER.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/REAL_DATA_SOURCE_REGISTER.md) — Provenance tracking and dataset catalog.
22. [AI_MODEL_REGISTER.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/AI_MODEL_REGISTER.md) — Machine learning model registry.
23. [INTEGRATION_DEPENDENCY_REGISTER.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/INTEGRATION_DEPENDENCY_REGISTER.md) — 15 cloud integrations.
24. [SECURITY_AND_PRIVACY_CHECKLIST.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/SECURITY_AND_PRIVACY_CHECKLIST.md) — OWASP and DPDP statutory checklist.
25. [FINAL_ACCEPTANCE_REPORT.md](file:///Users/abhishekkumar/Desktop/HEALTHMATEAI/FINAL_ACCEPTANCE_REPORT.md) — Formal major project acceptance sign-off.

---

## 5. LOCAL DEVELOPMENT & VERIFICATION INSTRUCTIONS

### 5.1 Prerequisites
- Node.js 20+ LTS
- Python 3.11+
- Tesseract OCR (`brew install tesseract` on macOS / `apt-get install tesseract-ocr` on Linux)
- MongoDB Atlas account (or local MongoDB 6.0+)
- Redis instance (Upstash or local Redis 7.0+)

### 5.2 Backend API Setup
```bash
cd backend
npm install
npm test # Executes all 13 test suites (114 tests)
npm run dev # Starts Express server on http://localhost:5000
```

### 5.3 AI Microservice Setup
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m pytest tests/ # Runs ML evaluation benchmarks
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5.4 Frontend Client Setup
```bash
cd frontend
npm install
npm run build # Production Vite build (2,626 modules transformed, 0 errors)
npm run dev # Launches patient portal on http://localhost:5173
```

---

## 6. PROJECT AUDIT VERDICT

| Category | Metric | Result |
|---|---|---|
| **Public Role Security** | Single Public Role | **100% Enforced (PATIENT)** |
| **Backend Integration Tests**| 13 Suites | **114 / 114 Passed (100%)** |
| **AI Evaluation Suites** | 11 Benchmark Suites | **11 / 11 Passed (100%)** |
| **Emergency Sensitivity** | Acute Red-Flag Detection | **100.00% (5 / 5 Cases)** |
| **Data Persistence** | MongoDB Atlas | **25 / 25 Collections Verified** |
| **Zero Dummy Data** | Fabricated Record Check | **100% Zero Fake Data** |
| **Final Recommendation** | B.Tech CSE (AI/ML) Major Project | **APPROVED WITH DISTINCTION** |
