# HealthMate AI - Master Feature Implementation Tracker
**Document Version:** 1.0.0  
**Phase:** Phase 0 - Master Architecture, Requirements Analysis & Development Planning  
**Status Key:** ⚪ NOT_STARTED | 🟡 IN_PROGRESS | 🟢 VERIFIED_COMPLETE  

---

## 1. Patient Portal Features Matrix

| Feature ID & Name | Role | Frontend Screen | Backend API | Database Requirement | External Service | AI/ML Requirement | Privacy Classification | Testing Requirement | Completion Criteria | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **P-01** Guest Health Session | PATIENT | `/triage/guest` | `POST /patient/session/init` | Redis `session:guest:*` (TTL 3600s) | None | None | Ephemeral (Zero persistent) | Unit test TTL eviction & session token generation | Session created in Redis without any MongoDB insert. | ⚪ |
| **P-02** Patient Auth & Profile | PATIENT | `/auth/login`, `/patient/profile` | `POST /auth/login`, `GET /patient/me` | MongoDB `users` | SMS OTP Gateway | None | Persistent (Authenticated) | Auth token validation & bcrypt verification | User authenticated, token rotated, profile retrieved. | ⚪ |
| **P-03** AI Health Copilot | PATIENT | `/copilot/chat` | `POST /patient/copilot/message` | Redis `session:copilot:*` | Gemini 1.5 / OpenRouter | LLM Medical RAG + Prompt Guardrails | Ephemeral Dialogue | Mock LLM response, safety guardrail test | Safe, non-prescriptive, informative medical dialogue. | ⚪ |
| **P-04** Multilingual Voice Assistant | PATIENT | `/copilot/voice` | `POST /patient/voice/transcribe` | Redis buffer | Web Audio API / Whisper | Speech-to-Text (Hindi/English) | Ephemeral Audio | Audio stream ingestion and transcription test | Real-time transcription in Hindi & English. | ⚪ |
| **P-05** Symptom Checker & Risk Assessment | PATIENT | `/triage/symptom-checker` | `POST /patient/symptom-check` | Redis temporary buffer | None | XGBoost Classifier + SHAP Explainability | Ephemeral Input | Precision/Recall benchmark & SHAP factor test | Triage risk returned with top 3 contributing factors. | ⚪ |
| **P-06** Medical Report OCR Extraction | PATIENT | `/reports/upload` | `POST /patient/reports/ocr-extract` | Redis OCR cache (TTL 1800s) | Encrypted Temp S3 Storage | PaddleOCR + RegEx Lab Biomarker Parser | Ephemeral Document | OCR accuracy benchmark on lab test images | Key lab values (Hb, WBC, Glucose) extracted correctly. | ⚪ |
| **P-07** India-Wide Doctor Discovery | PATIENT | `/discovery/doctors` | `GET /discovery/search` | MongoDB `doctor_profiles` (2dsphere index) | None (Internal DB) | Fuzzy search matching | Public Clinical Info | Query filter tests (state, city, specialty) | Accurate filtered doctor listings without fabrications. | ⚪ |
| **P-08** Nearby Facility & Pharmacy Discovery | PATIENT | `/discovery/nearby` | `GET /discovery/nearby` | MongoDB `health_facilities` | Google Places API / GeoJSON | Geospatial indexing | Ephemeral Location | 2dsphere geo-query tests within radius | Accurate facilities returned within user-authorized radius. | ⚪ |
| **P-09** Appointment Booking & Rescheduling | PATIENT | `/appointments/book` | `POST /appointments/book`, `PUT /appointments/:id` | MongoDB `appointments` | Razorpay API | None | Transactional Persistent | Concurrency slot booking & idempotency test | No double bookings, payment receipt recorded. | ⚪ |
| **P-10** WebRTC Video/Audio Consultation | PATIENT | `/telehealth/room/:id` | Socket.IO WebRTC Signaling | Redis `webrtc:room:*` | Twilio STUN/TURN | None | Ephemeral Media Stream | Peer connection establishment & ICE handshake | Stable peer-to-peer audio/video stream. | ⚪ |
| **P-11** Digital Prescriptions & Interaction Alert | PATIENT | `/prescriptions` | `GET /prescriptions/my` | MongoDB `prescriptions` | None | Drug-Drug Interaction Ruleset | Persistent Clinical Record | Digital signature verification test | Prescriptions viewable with verified doctor signature. | ⚪ |
| **P-12** Vitals & Health Metrics Tracker | PATIENT | `/vitals/tracker` | `POST /patient/vitals`, `GET /patient/vitals` | MongoDB `patient_vitals` (with consent) | None | Anomaly Detection Model | Consent-based Persistent | Vitals range validation & chart rendering | Trends visualized; abnormal spikes flagged. | ⚪ |
| **P-13** Instant Session Purge ("Forget Me") | PATIENT | Floating Security Modal | `DELETE /patient/session/:id` | Redis key purge | None | None | Privacy Deletion | Redis key existence check before and after | Zero residual data remaining in Redis or MongoDB. | ⚪ |
| **P-14** Emergency SOS Trigger | PATIENT | Quick Access Bar | `POST /emergency/sos` | MongoDB `audit_logs` + Redis alert bus | Google Geocoding API | Nearest emergency routing | High Priority Ephemeral | Latency benchmark (<500ms trigger) | Alerts emitted to nearest emergency facility. | ⚪ |

---

## 2. Doctor Portal Features Matrix

| Feature ID & Name | Role | Frontend Screen | Backend API | Database Requirement | External Service | AI/ML Requirement | Privacy Classification | Testing Requirement | Completion Criteria | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **D-01** Doctor Registration & Onboarding | DOCTOR | `/doctor/register` | `POST /doctor/profile/create` | MongoDB `users`, `doctor_profiles` | S3 Secure Storage | OCR Certificate Extraction | Persistent Credential | Validation of registration number and files | Profile created with status `DISCOVERED` or `PENDING`. | ⚪ |
| **D-02** Availability & Calendar Management | DOCTOR | `/doctor/schedule` | `POST /doctor/availability` | MongoDB `doctor_profiles` | None | None | Public Operational | Slot collision and timezone test | Availability rules correctly generated for patients. | ⚪ |
| **D-03** Clinical Consultation Dashboard | DOCTOR | `/doctor/consultation/:id` | `GET /doctor/appointments/:id` | MongoDB `appointments`, Redis temp cache | Twilio STUN/TURN | None | Confidential Clinical | Patient consent token validation test | Access allowed only during active consultation window. | ⚪ |
| **D-04** AI Clinical Copilot & Summarizer | DOCTOR | `/doctor/copilot` | `POST /doctor/copilot/summarize` | Redis buffer | Gemini 1.5 Pro | BioBERT / Medical RAG | Ephemeral Clinical | Accuracy of SOAP clinical note generation | Accurate SOAP note drafted for doctor review. | ⚪ |
| **D-05** Digital Prescription Generator | DOCTOR | `/doctor/prescription/new` | `POST /doctor/prescriptions/generate` | MongoDB `prescriptions` | None | RxNorm Interaction Checker | Persistent Clinical Record | SHA-256 signature verification test | Prescription issued with immutable doctor signature. | ⚪ |
| **D-06** Doctor Earnings & Remittance | DOCTOR | `/doctor/earnings` | `GET /doctor/finance/ledger` | MongoDB `payment_transactions` | Razorpay Payouts | None | Financial Confidential | Ledger balance calculation test | Net earnings after platform commission calculated. | ⚪ |

---

## 3. Administration Portal Features Matrix

| Feature ID & Name | Role | Frontend Screen | Backend API | Database Requirement | External Service | AI/ML Requirement | Privacy Classification | Testing Requirement | Completion Criteria | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A-01** Doctor Credential Verification | ADMINISTRATION | `/admin/doctors/review` | `POST /admin/doctors/:id/verify` | MongoDB `doctor_profiles`, `audit_logs` | NMC / State Council Registry | Automated Credential Extraction | Administrative Confidential | State transition test (PENDING -> VERIFIED) | Doctor moved to `CREDENTIAL_VERIFIED` with audit log. | ⚪ |
| **A-02** Facility Ingestion Pipeline Monitor | ADMINISTRATION | `/admin/facilities/sync` | `POST /admin/discovery/trigger-sync` | MongoDB `health_facilities` | Google Places / ABDM API | Deduplication Matcher | Public Data Catalog | Sync throughput and duplicate check | Ingested facilities deduplicated and cataloged. | ⚪ |
| **A-03** MLOps Model Registry & Drift Telemetry | ADMINISTRATION | `/admin/mlops/models` | `GET /admin/mlops/metrics` | MongoDB `ai_model_metrics` | MLflow Server | KS-Test / Drift Detector | Technical Telemetry | Metrics retrieval and threshold alarm test | Accuracy, ROC-AUC, latency, and drift status visible. | ⚪ |
| **A-04** Financial & Refund Ledger | ADMINISTRATION | `/admin/finance` | `GET /admin/finance/summary` | MongoDB `payment_transactions` | Razorpay Dashboard API | Anomaly Fraud Detection | Financial Confidential | Ledger reconciliation test | Commission splits and refund authorizations logged. | ⚪ |
| **A-05** DPDP Compliance & Audit Inspection | ADMINISTRATION | `/admin/compliance/audit` | `GET /admin/compliance/logs` | MongoDB `audit_logs`, `patient_consents` | None | None | Compliance Immutable | Query latency and immutability test | Comprehensive audit trail filterable by actor and action. | ⚪ |

---

## 4. Phase Verification Checklist
- [x] All 3 roles strictly mapped (PATIENT, DOCTOR, ADMINISTRATION).
- [x] No auxiliary login roles present.
- [x] Every feature explicitly bounded with Database, API, ML, and Privacy classification.
- [x] Completion criteria established with zero fabricated data assumptions.
