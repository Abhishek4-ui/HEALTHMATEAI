# HealthMate AI — Project Changelog & Revision Ledger

All notable changes to the HealthMate AI project are documented in this file. The project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] — 2026-11-20 (Current Baseline: `289f01a`)

### Added
- **Repository Organization:** Consolidated all 117 loose root markdown files into clean, categorized directories under `docs/` (`docs/reports/`, `docs/archive/`, `docs/screenshots/`).
- **Standard Project Root:** Added comprehensive `CONTRIBUTING.md`, updated `SECURITY.md`, and added standard MIT `LICENSE`.
- **Pre-Submission Emergency Banner:** Added mandatory clinical safety banner with 112/102 emergency callout to `Module03_SymptomChecker.jsx` prior to user symptom input.
- **Master Documentation:** Authored comprehensive technical guides in `docs/` (`PROJECT_OVERVIEW.md`, `ARCHITECTURE.md`, `FEATURES.md`, `AI_ML_DOCUMENTATION.md`, `API_DOCUMENTATION.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, `KNOWN_LIMITATIONS.md`).

### Fixed
- **Doctor Honorific Normalization:** Resolved duplicate `Dr. Dr.` prefix display in `Module01_Dashboard.jsx` using regex boundary checks.
- **Camera Button Visual Contrast:** Resolved white-on-white text contrast defect on `Take Live Photo` secondary button in `UniversalUpload.jsx`.
- **Vercel Edge Rewrite Proxy:** Configured `/api/v1/*` proxy in `vercel.json` and set `VITE_API_BASE_URL=/api/v1` in `frontend/.env.production` to eliminate regional ISP connection timeouts to Render.

### Security & Privacy
- **Multi-Tenant Scoping:** Hardened tenant isolation across all medical records and appointment endpoints, verified via 8/8 automated privacy test suite (`test_live_production_security_privacy.cjs`).

---

## [2.0.0] — 2026-11-15 (Commit: `ba64620`)

### Changed
- **AI Model Transparency Reconciliation:** Replaced misleading deep learning claims for CT and MRI with truthful deterministic image processing:
  - Chest X-ray explicitly labeled as `alg_cxr_anatomical_screen_v1` (CTR anatomical screening).
  - Brain MRI explicitly labeled as `alg_mri_gradient_triage_v1` (Sobel gradient & SNR image quality triage).
  - ECG analysis clarified as Lead II rhythm-strip DSP (`mdl_ecg_lead12_waveform_v2`), not full 12-lead diagnostic ECG.
- **Non-Diagnostic Badges:** Enforced mandatory experimental prototype disclaimers across all imaging and AI service responses.

### Added
- **Razorpay Scenario Suite:** Created and passed automated validation suite for all 9 payment lifecycle scenarios (`scripts/test_razorpay_scenarios.js`).

---

## [1.5.0] — 2026-11-12 (Commit: `0915db7`)

### Added
- **Physical Hardware Camera Integration:** Verified client-side hardware camera preview, 1280x720 capture, retake, and canvas handoff in `UniversalUpload.jsx`.
- **Pan-India Doctor Directory:** Expanded doctor discovery engine across all 36 Indian States and Union Territories with NMC registration badges.
- **Dual-Rail Digital Payments:** Completed dual checkout workflows supporting Razorpay Test Mode and direct NPCI UPI QR with UTR submission.

---

## [1.0.0] — 2026-11-10 (Commit: `1c43f8e`)

### Architecture
- **Patient-Only Public Perimeter Pivot:** Removed all public doctor registration doors, admin portals, and role switchers from public routes in adherence to single-role patient architecture.
- **Core Microservices Architecture:** Initial split into Vite frontend SPA, Node.js/Express API Gateway, and Python/FastAPI AI Microservice.
- **Multi-Tenant Database Design:** Deployed initial MongoDB Atlas schemas for patients, appointments, medical records, and payments.
