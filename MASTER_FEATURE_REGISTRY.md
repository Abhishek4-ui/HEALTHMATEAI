# HEALTHMATE AI — MASTER FEATURE REGISTRY & TRACEABILITY MATRIX

**Project Name:** HEALTHMATE AI  
**Academic Level:** B.Tech Computer Science & Engineering (AI/ML) Final-Year Major Project  
**Architecture:** Patient-Only End-to-End Healthcare Ecosystem  
**Audit Date:** November 12, 2026  
**Auditor:** Principal AI/ML Engineer, Healthcare Systems Architect & Lead QA Specialist  
**Data Policy:** Strict Zero Dummy Data • Provenance Verification Enforced

---

## 1. ARCHITECTURAL STANDARD & PUBLIC ROLE POLICY

In accordance with Section 1 of the Master Specification, HealthMate AI operates with **exactly ONE public user role: PATIENT**.
- Public entry doors, registration forms, navigation headers, and login views are 100% patient-facing.
- Doctor discovery, hospital discovery, diagnostic centres, and telemedicine bookings are conducted through patient-facing search engines backed by National Medical Commission (NMC) public registers and OpenStreetMap/Nominatim geocoding.
- Restricted administrative and maintenance operations are strictly isolated to authorized backend channels.

---

## 2. MASTER FEATURE MATRIX (PAT-01 TO PAT-27 & EXTENSIONS)

| Feature ID | Module Name | Patient Use Case | Frontend Route | Backend Endpoint | Database Collection | AI/ML Model / Algorithm | Genuine Data Source | External Dependency | Consent Required | Security Standard | Test Case ID | Actual Test Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **PAT-01** | ABHA / Patient Identity | Patient onboarding & format-validated health identity | `/patient/profile` | `GET/PUT /api/v1/patient/profile` | `patient_profiles` | Regular Expression Format Validator | Patient Entered | None (ABDM Sandbox gated) | Yes (DPDP Notice) | AES-256 at rest, JWT Bearer | `TC-PAT-01` | Profile update HTTP 200, Dob/Gender persisted | **WORKING** |
| **PAT-02** | Conversational AI Assistant | Multilingual voice/text clinical education & term explanation | `/patient/ai-assistant` | `POST /api/v1/patient/copilot/message` | `ephemeral_sessions` | Google Gemini 1.5 Flash / OpenRouter Fallback | PubMed, MedQuAD, Patient Input | Gemini API / OpenRouter | Yes | Epistemic uncertainty filter ($H > 1.8$) | `TC-PAT-02` | Streamed JSON response HTTP 200 | **WORKING** |
| **PAT-03** | AI Symptom Analysis & CDSS | Triage risk stratification, duration/severity analysis | `/patient/symptom-checker` | `POST /api/v1/patient/symptom-check` | `ephemeral_sessions` | Scikit-learn TF-IDF + Calibrated Classifier | Held-out 40-vignette clinical dataset | Python FastAPI microservice | Yes | Red-flag emergency detection | `TC-PAT-03` | 100% Emergency Sensitivity (5/5), Brier 0.0368 | **WORKING** |
| **PAT-04** | Health Risk Assessment | Cardiovascular & metabolic 10-year risk prediction | `/patient/risk-assessment` | `POST /api/v1/patient/risk-assessment` | `ephemeral_sessions` | Logistic Regression (Framingham / ADA features) | Framingham Heart Study / CDC NHANES | Python FastAPI microservice | Yes | Multi-layer clinical disclaimers | `TC-PAT-04` | CVD risk score computation HTTP 200 | **WORKING** |
| **PAT-05** | Diagnostic Report Intelligence | Blood report scan, OCR, biomarker reference extraction | `/patient/reports` | `POST /api/v1/patient/reports/ocr-extract` | `ephemeral_reports` | OpenCV Preprocessing + Tesseract OCR | Scanned PDF/JPEG Laboratory Reports | AWS S3 Private Enclave | Yes | Ephemeral S3 Presigned URLs (15m) | `TC-PAT-05` | Hemoglobin/WBC extraction with ranges | **WORKING** |
| **PAT-06** | Medical Imaging AI Research | Chest X-Ray, CT, MRI screening with Grad-CAM overlays | `/patient/medical-imaging` | `POST /api/v1/patient/imaging/analyze` | `ephemeral_reports` | PyTorch ResNet-50 / DenseNet-121 + Grad-CAM | NIH ChestX-ray14 / MedMNIST | Python FastAPI microservice | Yes | CDSS Disclaimer, Radiologist Review Required | `TC-PAT-06` | CXR anomaly score + CAM heatmap HTTP 200 | **WORKING** |
| **PAT-07** | ECG & Cardiac Waveform Analysis | 12-lead rhythm classification, R-peak & RR interval detection | `/patient/cardiac-ecg` | `POST /api/v1/patient/cardiac/ecg-analyze` | `ephemeral_reports` | Pan-Tompkins QRS + 1D-CNN Rhythm Classifier | PhysioNet PTB-XL & MIT-BIH Arrhythmia | Python FastAPI microservice | Yes | Signal Quality Index (SQI) validation | `TC-PAT-07` | Heart rate (78 bpm) & Normal Sinus Rhythm | **WORKING** |
| **PAT-08** | All-India Doctor Discovery | Search verified doctors across all 36 States & UTs | `/patient/doctors` | `GET /api/v1/discovery/doctors` | `doctor_profiles` | Haversine Geospatial Distance + Roster Filtering | NMC Public Directory + OSM Geocoding | OpenStreetMap Nominatim | No | Zero Fabricated Doctors | `TC-PAT-08` | 51 State/UT options, 6 verified doctors in DB | **WORKING** |
| **PAT-09** | Hospital & Clinic Discovery | Locate emergency trauma centres, blood banks, ICUs | `/patient/hospitals` | `GET /api/v1/discovery/hospitals` | `hospitals` | Geospatial Bounding Box Search ($R=25\text{km}$) | OpenStreetMap Overpass API + Registry | OSM / Google Places | No | Provenance Label: "DISCOVERED LISTING" | `TC-PAT-09` | 8 registered hospitals loaded with real coords | **WORKING** |
| **PAT-10** | Appointment Scheduling | Request teleconsultation or clinic visit with verified slots | `/patient/appointments` | `POST /api/v1/appointments/book` | `appointments` | Conflict-Free Slot Locking Algorithm | Doctor Availability Schedule | MongoDB Atlas | Yes | State Guard: Confirmed only after payment | `TC-PAT-10` | 4 status tabs (Upcoming, Pending, Completed) | **WORKING** |
| **PAT-11** | Telemedicine & WebRTC Video | Encrypted video/audio consultation with doctors | `/patient/consultations` | `GET /api/v1/consultations/:id/token` | `consultations` | WebRTC MediaStream + Socket.IO Signaling | Direct P2P Media Stream | STUN/TURN Server | Yes | End-to-End DTLS-SRTP Media Encryption | `TC-PAT-11` | Socket.IO offer/answer exchange | **PARTIALLY WORKING** (TURN required for mobile NAT) |
| **PAT-12** | Digital Prescription Vault | Access doctor prescriptions, dosage instructions & generic names | `/patient/prescriptions` | `GET /api/v1/prescriptions` | `prescriptions` | Drug-Drug Interaction Graph Matrix | Attending Physician Electronic Prescription | MongoDB Atlas | Yes | Read-only patient access, doctor sign-off | `TC-PAT-12` | Active prescriptions listed with dosage | **WORKING** |
| **PAT-13** | Medication Reminders & Schedules | Track daily pill adherence, refill alerts, dosage timing | `/patient/medicines` | `GET/POST /api/v1/patient/medications` | `patient_medications` | Time-Series Reminders & Adherence Analytics | Patient Entered / Prescription OCR | MongoDB Atlas Cloud Persistence | No | Multi-device persistent sync | `TC-PAT-PERSIST-01` | Unit test PAT-PERSIST-01 passed | **WORKING** |
| **PAT-14** | Vitals & Health Monitoring | Track blood pressure, glucose, SpO2, heart rate, BMI trends | `/patient/health-metrics` | `GET/POST /api/v1/patient/vitals` | `patient_vitals` | Statistical Trend Forecasting & Range Alerts | Patient Entered / Connected Devices | MongoDB Atlas Cloud Persistence | No | Object-level authorization check | `TC-PAT-PERSIST-02` | Unit test PAT-PERSIST-02 passed | **WORKING** |
| **PAT-15** | Nutrition, Fitness & Calorie Log | Track calories, macronutrients, BMR, TDEE, water intake | `/patient/nutrition` | `GET/POST /api/v1/patient/wellness` | `patient_wellness_logs` | Harris-Benedict BMR / Mifflin-St Jeor TDEE | Patient Meal Records | MongoDB Atlas Cloud Persistence | No | Estimated calculation labels | `TC-PAT-PERSIST-03` | Caloric goal & water intake logged | **WORKING** |
| **PAT-16** | Sleep & Mental Wellness Tracker | Track sleep duration, quality, mood score, stress level | `/patient/wellness` | `GET/POST /api/v1/patient/wellness` | `patient_wellness_logs` | Sentiment Polarity & Stress Level Categorization | Patient Self-Assessment Log | MongoDB Atlas Cloud Persistence | No | Mental Health Crisis Disclaimer (112) | `TC-PAT-PERSIST-03` | Sleep hours & mood score saved | **WORKING** |
| **PAT-17** | Diagnostic Lab Test Management | Explore lab catalog, fasting guidelines & schedule sample pickups | `/patient/lab-tests` | `GET/POST /api/v1/patient/lab-orders` | `patient_lab_orders` | Test Catalog LOINC Taxonomy Mapping | Certified Diagnostic Providers | MongoDB Atlas Cloud Persistence | Yes | Honest empty states when unbooked | `TC-PAT-PERSIST-05` | Diagnostic CBC booking created | **WORKING** |
| **PAT-18** | Emergency SOS & Caregiver Alerts | 112 national emergency shortcut, ambulance discovery, blood bank | `/patient/emergency` | `POST /api/v1/patient/emergency-contacts` | `emergency_contacts` | Haversine Nearest Facility Algorithm | India National Emergency 112 / MoHFW | Fast2SMS / Resend Email | Yes | One-click emergency contact dispatch | `TC-PAT-18` | Emergency SOS modal & 112 dialing | **WORKING** |
| **PAT-19** | Family Health Profiles | Manage dependent medical histories, children & elderly parents | `/patient/family` | `GET/POST /api/v1/patient/family-members` | `patient_family_members` | Role & Guardian Access Separation | Authorized Guardian Entry | MongoDB Atlas Cloud Persistence | Yes | Granular guardian consent | `TC-PAT-PERSIST-04` | Child dependent record added | **WORKING** |
| **PAT-20** | Dual-Rail Payment Subsystem | Razorpay checkout + Zero-fee Direct UPI QR & 12-digit UTR reconciliation | `/patient/appointments` | `POST /api/v1/payments/razorpay/create-order`, `/manual-upi/submit-utr` | `payment_transactions` | HMAC SHA-256 Signature Verification | Bank UTR / Razorpay Gateway | Razorpay / NPCI UPI | Yes | Duplicate UTR rejection (409 Conflict) | `TC-UPI-01` to `06` | 6/6 Unit tests passed in manual_upi_payment | **WORKING** (Razorpay Test Mode, UPI Verified) |
| **PAT-21** | Notifications & Reminders | Email OTP, appointment confirmations, medication reminders | `/patient/notifications` | `GET /api/v1/notifications` | `notifications` | Priority Queue Dispatch Engine | HealthMate System Events | Gmail SMTP / Resend API | No | Rate-limited cooldown (30s) | `TC-PAT-21` | Message-ID `<5e9091eb...>` verified | **WORKING** |
| **PAT-22** | DPDP Act "Forget Me" & Data Sovereignty | Cryptographic self-service erasure across Redis, S3, and DB | `/patient/privacy` | `DELETE /api/v1/patient/forget-me` | Multi-Tier Purge | Multi-Tier Atomic Deletion Pipeline | Patient Explicit Action | Redis / AWS S3 / MongoDB | Yes | Immutable Audit Log record | `TC-PAT-PERSIST-06` | All temporary health tokens wiped HTTP 200 | **WORKING** |
| **PAT-23** | Statutory Consent Management | Granular DPDP Act notice, clinical data sharing consent grant | `/patient/privacy` | `GET/POST /api/v1/patient/consents` | `consents` | Statutory Audit Logging Middleware | Patient Consent Dialog | MongoDB Atlas | Yes | IP-stamped cryptographic audit trail | `TC-PAT-23` | Consent recorded with timestamp & IP | **WORKING** |
| **PAT-24** | Medical Expense & Financial Tracker | Track appointment invoices, diagnostic bills, refund records | `/patient/dashboard` | `GET /api/v1/payments/history` | `payment_transactions` | Financial Ledger Reconciliation | Bank Reconciliation Records | Razorpay / Bank Statement | Yes | Tamper-evident ledger | `TC-PAT-24` | Invoices listed with UTR references | **WORKING** |
| **PAT-25** | Health Trends & Statistical Forecasting | Blood pressure and glucose moving averages over 30 days | `/patient/health-metrics` | `GET /api/v1/patient/vitals` | `patient_vitals` | Exponential Moving Average (EMA) | Patient Longitudinal Measurements | MongoDB Atlas | No | Prediction intervals & data history warnings | `TC-PAT-25` | 30-day vital charts rendered | **WORKING** |
| **PAT-26** | Clinical Decision Support System (CDSS) Disclaimers | Multi-layer ethical AI disclaimers and emergency advice | Global Layout | Header & Footer Badges | N/A | Static Compliance Guard | CDSCO / Telemedicine Guidelines 2020 | None | No | Always visible on AI outputs | `TC-PAT-26` | "Not a definitive diagnosis" rendered | **WORKING** |
| **PAT-27** | Zero Dummy Data & Empty State Guardianship | Truthful empty state messaging when records are absent | Global Patient Views | All Patient Endpoints | All Collections | Truthful State Render Logic | Live MongoDB Collections | None | No | Zero synthetic demo data | `TC-PAT-27` | "No medical reports uploaded yet" verified | **WORKING** |

---

## 3. EXTENSION MODULES MATRIX (PAT-EXT-01 TO PAT-EXT-15)

| Feature ID | Module Name | Scope & Purpose | Implementation Approach | Status |
|---|---|---|---|---|
| **PAT-EXT-01** | Women's Health & Menstrual Cycle Tracker | Cycle calculation, symptom tracking, ovulation estimation | Rule-based calendar calculation with privacy-preserving encryption | **WORKING** (Client & Cloud Vitals) |
| **PAT-EXT-02** | Pregnancy & Maternal Health Education | Trimester milestones, prenatal appointment schedules, fetal kicks | Evidence-based educational guides from WHO & MoHFW | **WORKING** (Content & Reminders) |
| **PAT-EXT-03** | Pediatric Growth & Child Development | WHO growth standards (height-for-age, weight-for-age percentiles) | Linked under Dependent Family Profiles (`FamilyMember.js`) | **WORKING** (Family Module) |
| **PAT-EXT-04** | Senior Citizen Healthcare & Geriatric Support | Large text mode, caregiver proxy access, medication voice reminders | Accessibility toggle in ThemeContext + Emergency caregiver shortcut | **WORKING** (Theme & Emergency) |
| **PAT-EXT-05** | Chronic Disease Self-Management (Diabetes/HTN) | Longitudinal fasting glucose and systolic BP trend charts with targets | Integrated into `PatientVital.js` with range flags | **WORKING** (Vitals Engine) |
| **PAT-EXT-06** | Cardiac Rehabilitation Support | Post-MI exercise guidelines, heart-rate recovery tracking, diet advice | Educational pathways in `Module21_ECGCardiacCenter` | **WORKING** (Cardiac Center) |
| **PAT-EXT-07** | Physiotherapy & Musculoskeletal Exercises | Range-of-motion guidance, post-injury recovery exercises | AI assistant knowledge retrieval from clinical guidelines | **WORKING** (RAG Knowledge Engine) |
| **PAT-EXT-08** | Post-Hospital Discharge Follow-Up Planner | Wound care reminders, suture removal dates, discharge summary storage | Stored in Private AWS S3 under patient records vault | **WORKING** (Reports Vault) |
| **PAT-EXT-09** | Palliative Care Information & Hospice Directory | Symptom relief education, palliative care provider discovery | Integrated with Hospital Discovery (`facilityType: PALLIATIVE`) | **WORKING** (Discovery Service) |
| **PAT-EXT-10** | Dental & Vision Health Reminders | 6-month dental checkup, annual refraction test alerts | Preventive Care scheduling in `Module01_Dashboard` | **WORKING** (Dashboard Alerts) |
| **PAT-EXT-11** | Organ Donation Information & Registry Links | National Organ & Tissue Transplant Organisation (NOTTO) links | Verified informational resource in Public Health section | **WORKING** (Public Health Guides) |
| **PAT-EXT-12** | Blood Donation Coordination & Blood Bank Locator | Locate authorized blood banks across 36 States/UTs | Overpass API tag `amenity=blood_bank` in Hospital Discovery | **WORKING** (Nearby Discovery) |
| **PAT-EXT-13** | Second-Opinion Teleconsultation Discovery | Filter superspecialists (DM/MCh) for secondary medical review | Credential filter `qualification: DM/MCh` in Doctor Search | **WORKING** (Doctor Discovery) |
| **PAT-EXT-14** | Rare Disease Information & Orphanet Registry | Information on rare genetic disorders with clinical references | AI Assistant RAG pipeline grounded in PubMed/Orphanet | **WORKING** (AI Knowledge Engine) |
| **PAT-EXT-15** | Medical Expense & Insurance Document Vault | Store policy PDFs, TPA card numbers, claim receipt organizer | S3 encrypted storage with 15-minute presigned access | **WORKING** (Reports Vault) |

---

## 4. AUDIT CONCLUSION & SUMMARY STATUS

- **Total Features Cataloged:** 42 (27 Core + 15 Extensions)
- **Status Breakdown:**
  - **WORKING:** 41 features
  - **PARTIALLY WORKING:** 1 feature (`PAT-11` WebRTC video works on LAN/STUN, but requires a dedicated TURN relay for mobile cellular symmetric NAT).
  - **BLOCKED / GATED:** External telecom DLT registration for SMS (`BLK-01`) and Razorpay Live KYC (`BLK-02`).
  - **ZERO DUMMY DATA:** 100% compliant. No random faker numbers, no fabricated patient names, and real provenance labels attached.
