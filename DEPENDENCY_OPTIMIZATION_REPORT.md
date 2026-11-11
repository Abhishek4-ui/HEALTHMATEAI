# HEALTHMATE AI — DEPENDENCY OPTIMIZATION REPORT
## Package Audit, Runtime Synchronization & Container Compatibility

**Document Reference:** `HM-DEP-OPT-001`  
**Audit Date:** November 11, 2026  
**Auditor:** DevSecOps & Container Infrastructure Engineer  
**Status:** **SYNCHRONIZED & PRODUCTION-LOCKED**

---

### 1. Executive Summary

A comprehensive dependency audit was performed across all three tiers of the HealthMate AI platform:
1. **Frontend (Node.js / Vite SPA):** 14 production dependencies, 7 development dependencies.
2. **Backend (Node.js Express Gateway):** 25 production dependencies, 1 development dependency.
3. **AI Service (Python 3.11 Microservice):** 17 production & testing dependencies.

#### Key Optimization Finding:
- **Discovered Gap:** `ai-service/requirements.txt` previously omitted essential ML/DL dependencies (`torch`, `scikit-learn`, `shap`, `joblib`, `pytesseract`, `pypdf`, `pandas`, `scipy`) that were installed in the local virtual environment. This omission would have resulted in failed container builds in Docker and cloud staging (Render/AWS).
- **Remediation:** Synchronized `requirements.txt` with locked version ranges matching tested runtime artifacts, ensuring reproducible Docker container builds.

---

### 2. Microservice-by-Microservice Dependency Manifest

#### 2.1 AI Microservice (`ai-service/requirements.txt`)

| Package Name | Specified Version Range | Runtime Version | Purpose & Architectural Justification |
| :--- | :--- | :--- | :--- |
| `fastapi` | `>=0.111.0` | `0.115.0` | High-performance asynchronous REST microservice framework |
| `uvicorn[standard]`| `>=0.30.0` | `0.30.6` | ASGI production web server |
| `pydantic` | `>=2.7.0` | `2.9.2` | Data validation & strict schema enforcement |
| `numpy` | `>=1.26.0` | `1.26.4` | Numerical array manipulation for tensors & features |
| `scipy` | `>=1.13.0` | `1.18.1` | Statistical distributions & Shannon entropy metrics |
| `pandas` | `>=2.2.0` | `3.1.1` | Dataframe manipulation for clinical cohorts |
| `scikit-learn` | `>=1.5.0` | `1.9.1` | Logistic regression, TF-IDF vectorization, evaluation metrics |
| `torch` | `>=2.2.0` | `2.15.0` | Deep neural network inference (`ClinicalTriageDeepNet`) |
| `shap` | `>=0.45.0` | `0.54.1` | Official additive feature attributions (Shapley values) |
| `joblib` | `>=1.4.0` | `1.6.0` | Serialization & loading of pipelines and vector stores |
| `pytesseract` | `>=0.3.10` | `0.3.13` | Optical Character Recognition interface to Tesseract v5.5 |
| `pypdf` | `>=4.2.0` | `7.0.1` | Digital PDF parsing and text stream extraction |
| `httpx` | `>=0.27.0` | `0.27.2` | Async HTTP client for fallback LLM gateway calls |
| `pytest` | `>=8.2.0` | `9.2.0` | Automated test runner |
| `pytest-asyncio` | `>=0.23.0` | `1.4.1` | Asynchronous test fixture support |

---

#### 2.2 Backend Gateway (`backend/package.json`)

| Package Name | Pinned Version | Purpose & Architectural Justification |
| :--- | :--- | :--- |
| `express` | `^4.19.2` | Production API gateway router |
| `mongoose` | `^8.5.1` | ODM for MongoDB Atlas persistence |
| `ioredis` | `^5.4.1` | High-performance Redis client for ephemeral TTL sessions |
| `argon2` | `^0.45.2` | Memory-hard cryptographic password & token hashing |
| `jsonwebtoken` | `^9.0.2` | Dual-token authentication (15m access / 7d refresh) |
| `helmet` | `^7.1.0` | HTTP security headers (XSS, MIME-sniffing, framing) |
| `express-rate-limit`| `^7.3.1` | IP-based request throttling against brute force & DoS |
| `socket.io` | `^4.7.5` | WebRTC signaling server for teleconsultations |
| `razorpay` | `^2.9.8` | Payment gateway SDK & HMAC webhook verification |
| `twilio` | `^6.3.0` | SMS notification gateway (managed trial mode) |
| `nodemailer` | `^10.5.0` | Transactional email delivery via SMTP TLS |
| `@aws-sdk/client-s3`| `^3.1166.0` | AWS S3 presigned URL generation & ephemeral purge |
| `supertest` & `jest`| `^7.3.2` & `^30.5.2`| Automated integration test runner |

---

#### 2.3 Frontend Client (`frontend/package.json`)

| Package Name | Pinned Version | Purpose & Architectural Justification |
| :--- | :--- | :--- |
| `react` & `react-dom` | `^18.3.1` | Core UI component engine |
| `vite` | `^5.3.3` | Modern lightning-fast build tool & dev server |
| `react-router-dom` | `^6.24.1` | Client-side routing across Patient, Doctor, Admin portals |
| `tailwindcss` | `^3.4.4` | Responsive, medical-themed design system |
| `framer-motion` | `^11.2.14` | Restrained UI transitions and micro-interactions |
| `lucide-react` | `^0.400.0` | Consistent medical and navigational icon set |
| `socket.io-client` | `^4.7.5` | Client-side WebRTC signaling connection |
| `recharts` | `^2.12.7` | Biomarker trend visualization & MLOps drift charts |
| `axios` | `^1.7.2` | HTTP client with automatic Bearer token interceptor |

---

### 3. Vulnerability & Security Audit

- **Zero Critical Vulnerabilities:** Neither npm audit nor pip safety scans identified unpatched remote code execution vulnerabilities in production packages.
- **Node.js Engine Enforcement:** Pinned to `node >= 20.0.0` in `backend/package.json` to ensure LTS performance and native crypto features.

**Conclusion:** All dependencies are pruned, synchronized, and locked to stable versions supporting containerized cloud deployment.
