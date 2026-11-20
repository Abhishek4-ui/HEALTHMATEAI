# HEALTHMATE AI — API INTEGRATION & ENDPOINT INVENTORY

**Audit Date:** November 12, 2026  
**Auditor:** Senior Full-Stack Engineer & API Architect  
**Base URL:** `https://healthmate-backend-9nmm.onrender.com/api/v1`  
**API Specification Standard:** OpenAPI 3.0 / REST  

---

## 1. COMPREHENSIVE ENDPOINT INVENTORY

### 1.1 Authentication & Identity (`/auth`)

| Method | Endpoint | Auth Required | Permitted Roles | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | No | All | Register patient or clinician with hashed credentials | **201 OK** |
| `POST` | `/auth/login` | No | All | Authenticate and issue JWT access & refresh tokens | **200 OK** |
| `POST` | `/auth/refresh-token` | No | All | Rotate expired access token using valid refresh token | **200 OK** |
| `POST` | `/auth/logout` | Yes | All | Invalidate active session and revoke refresh token | **200 OK** |
| `POST` | `/auth/otp/send` | No | All | Dispatch 6-digit verification code with 30s cooldown | **200 OK** |
| `POST` | `/auth/otp/verify` | No | All | Verify SHA-256 hash in Redis with single-use deletion | **200 OK** |
| `POST` | `/auth/forgot-password`| No | All | Initiate password recovery workflow | **200 OK** |
| `POST` | `/auth/reset-password` | No | All | Reset password with verified token | **200 OK** |
| `GET` | `/auth/me` | Yes | All | Retrieve authenticated user profile | **200 OK** |

---

### 1.2 Healthcare Provider & Facility Discovery (`/discovery`)

| Method | Endpoint | Auth Required | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/discovery/doctors` | No | Query doctors across 36 States/UTs with specialty filters | **200 OK** |
| `GET` | `/discovery/hospitals` | No | Query hospital facilities, trauma centers, and beds | **200 OK** |
| `GET` | `/discovery/nearby` | No | Geolocation discovery using Haversine distance | **200 OK** |
| `GET` | `/discovery/states` | No | Retrieve master directory of all 28 States and 8 UTs | **200 OK** |
| `GET` | `/discovery/districts`| No | Retrieve official districts for a specified Indian state | **200 OK** |
| `GET` | `/discovery/geocode` | No | Free OpenStreetMap Nominatim forward geocoding | **200 OK** |
| `GET` | `/discovery/reverse-geocode`| No | Free OpenStreetMap Nominatim reverse geocoding | **200 OK** |

---

### 1.3 Clinical Triage & Patient Services (`/patient`)

| Method | Endpoint | Auth Required | Permitted Roles | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/patient/symptom-check` | Optional | `PATIENT`, `GUEST` | AI differential triage with red-flag detection | **200 OK** |
| `POST` | `/patient/risk-assessment`| Optional | `PATIENT`, `GUEST` | Cardiovascular and metabolic risk screening | **200 OK** |
| `POST` | `/patient/reports/ocr-extract`| Optional| `PATIENT`, `GUEST` | Multi-format lab report OCR parsing (10MB limit) | **201 OK** |
| `POST` | `/patient/imaging/analyze`| Optional | `PATIENT`, `GUEST` | Computer vision for CXR, CT, MRI, Ultrasound | **200 OK** |
| `POST` | `/patient/cardiac/ecg-analyze`| Optional| `PATIENT`, `GUEST` | Lead II ECG rhythm & R-peak feature extraction | **200 OK** |
| `POST` | `/patient/vitals` | Yes | `PATIENT` | Log patient blood pressure, glucose, and heart rate | **201 OK** |
| `GET` | `/patient/prescriptions`| Yes | `PATIENT` | Retrieve authenticated patient prescriptions | **200 OK** |
| `DELETE`| `/patient/forget-me` | Yes/Session | `PATIENT`, `GUEST` | DPDP Act immediate cryptographic session erasure | **200 OK** |
| `GET` | `/patient/data-export` | Yes/Session | `PATIENT`, `GUEST` | Export machine-readable JSON data summary | **200 OK** |

---

### 1.4 Appointments & Consultations (`/appointments`, `/consultations`)

| Method | Endpoint | Auth Required | Permitted Roles | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/appointments/book` | Yes | `PATIENT` | Reserve verified doctor schedule slot | **201 OK** |
| `GET` | `/appointments/my` | Yes | `PATIENT`, `DOCTOR` | Retrieve upcoming and past appointment ledger | **200 OK** |
| `PUT` | `/appointments/:id/cancel`| Yes | `PATIENT`, `DOCTOR` | Cancel appointment with mandatory cancellation notice | **200 OK** |
| `GET` | `/consultations/:id/token`| Yes | `PATIENT`, `DOCTOR` | Issue WebRTC signaling token for consultation room | **200 OK** |
| `POST` | `/consultations/encounter` | Yes | `DOCTOR` | Record clinical encounter SOAP notes | **201 OK** |

---

### 1.5 Payment Processing & Manual UPI Reconciliation (`/payments`)

| Method | Endpoint | Auth Required | Permitted Roles | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/payments/config` | No | All | Discover payment capabilities (Razorpay + Manual UPI) | **200 OK** |
| `POST` | `/payments/order` | Yes | `PATIENT` | Create Razorpay payment order in Test Mode | **201 OK** |
| `POST` | `/payments/verify-signature`| Yes | `PATIENT` | Verify Razorpay HMAC SHA-256 signature | **200 OK** |
| `POST` | `/payments/upi/initiate`| Yes | `PATIENT` | Generate unique manual UPI payment reference | **201 OK** |
| `POST` | `/payments/upi/submit-utr`| Yes | `PATIENT` | Submit 12-digit bank UTR reference number | **200 OK** |
| `GET` | `/payments/my-transactions`| Yes | `PATIENT` | View patient transaction history and live statuses | **200 OK** |
| `POST` | `/payments/refund-request`| Yes | `PATIENT` | Submit refund request for verified payment | **200 OK** |
| `GET` | `/payments/admin/pending`| Yes | `ADMINISTRATION` | Retrieve pending UTR reconciliations for admin review | **200 OK** |
| `POST` | `/payments/admin/verify` | Yes | `ADMINISTRATION` | Admin verifies UTR against bank credits | **200 OK** |
| `POST` | `/payments/admin/reject` | Yes | `ADMINISTRATION` | Admin rejects fraudulent UTR with mandatory reason | **200 OK** |
| `POST` | `/payments/admin/refund-process`| Yes | `ADMINISTRATION`| Approve and finalize patient refund | **200 OK** |
| `POST` | `/payments/webhook` | No (HMAC Auth)| Razorpay Webhook | Automated webhook processor with idempotency | **200 OK** |

---

### 1.6 Administration Portal (`/admin`)

| Method | Endpoint | Auth Required | Permitted Roles | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/overview` | Yes | `ADMINISTRATION` | Aggregated metrics on users, doctors, and visits | **200 OK** |
| `POST` | `/admin/doctors/:id/verify`| Yes | `ADMINISTRATION`| Approve or reject doctor credentials and NMC license | **200 OK** |
| `GET` | `/admin/facilities` | Yes | `ADMINISTRATION` | Manage hospital facility directory | **200 OK** |
| `POST` | `/admin/sync/trigger` | Yes | `ADMINISTRATION` | Trigger sync with national registry sources | **200 OK** |
| `GET` | `/admin/mlops/models` | Yes | `ADMINISTRATION` | View active clinical AI models and versions | **200 OK** |
| `GET` | `/admin/mlops/telemetry` | Yes | `ADMINISTRATION` | View AI inference latency and throughput | **200 OK** |
| `GET` | `/admin/mlops/drift` | Yes | `ADMINISTRATION` | Monitor population stability and feature drift | **200 OK** |
| `GET` | `/admin/compliance/audit-logs`| Yes | `ADMINISTRATION`| Immutable audit log trail for regulatory oversight | **200 OK** |
