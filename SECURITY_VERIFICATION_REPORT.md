# HEALTHMATE AI — SECURITY & PRIVACY VERIFICATION REPORT

**Date:** November 11, 2026  
**Security Standard:** OWASP Top 10, Digital Personal Data Protection Act 2023 (DPDP India), HIPAA Security Rule Baseline  
**Classification:** Enterprise Healthcare Security Audit  
**Status:** **PASSED & VERIFIED**  

---

## 1. Role-Based Access Control (RBAC) Architecture

HealthMate AI strictly enforces exactly **three distinct user roles**:
1. `PATIENT`
2. `DOCTOR`
3. `ADMINISTRATION`

### Boundary Enforcement Matrix

| Endpoint Group | Required Role | Unauthenticated Response | Unauthorized Role Response |
| :--- | :---: | :---: | :---: |
| `/api/v1/patient/*` | `PATIENT` | 401 Unauthorized (`UNAUTHORIZED`) | 403 Forbidden (`FORBIDDEN_ROLE`) |
| `/api/v1/doctor/*` | `DOCTOR` | 401 Unauthorized (`UNAUTHORIZED`) | 403 Forbidden (`FORBIDDEN_ROLE`) |
| `/api/v1/admin/*` | `ADMINISTRATION` | 401 Unauthorized (`UNAUTHORIZED`) | 403 Forbidden (`FORBIDDEN_ROLE`) |
| `/api/v1/consultations/*` | `PATIENT` or `DOCTOR` | 401 Unauthorized (`UNAUTHORIZED`) | 403 Forbidden (`FORBIDDEN_ROLE`) |

---

## 2. Cryptographic Security Standards

1. **Password Hashing:**
   - Algorithm: **Argon2id** (Memory: 64 MB, Iterations: 3, Parallelism: 4).
   - Resistant to GPU/ASIC brute-force attacks.
2. **Session & Token Security:**
   - **Access Token:** Short-lived JWT (15-minute expiration) signed with HS256 / SHA-256 HMAC secret.
   - **Refresh Token:** Stored in HttpOnly, Secure, SameSite=Strict cookies (7-day sliding expiration).
   - Revocation: Invalidation tracked in Redis blacklist.
3. **Electronic Prescription Sealing:**
   - Tamper-evident cryptographic signature:
     $$\text{Signature} = \text{HMAC-SHA256}(\text{AppointmentId} + \text{PatientId} + \text{Medications} + \text{Diagnosis}, \text{DoctorNMCNumber})$$
   - Any post-issuance alteration of medication names, dosages, or quantities invalidates the hash.
4. **Payment Integrity:**
   - Server-side verification of Razorpay signatures:
     $$\text{Signature} = \text{HMAC-SHA256}(\text{order\_id} \parallel \text{"|"} \parallel \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$

---

## 3. Ephemeral Health Data & "Right to be Forgotten"

- **Zero-Trust Ephemeral Default:**
  - Patient chat sessions, symptom queries, and OCR parsing tokens are stored in Redis Cloud with a strict default TTL (30 minutes to 24 hours).
  - Unpinned records expire automatically without manual intervention.
- **Immediate "Forget Me" Purge:**
  - Triggering `DELETE /api/v1/patient/forget-me` flushes the patient's active Redis session keys, chat transcripts, and temporary extraction tokens immediately.
  - An immutable, anonymized record is logged in MongoDB `AuditLog` for DPDP Act 2023 compliance.
- **Audit Logging:** Every critical transaction (login, authentication failure, appointment booking, prescription issuance, data purge) records actor ID, actor role, action, target resource, IP address, and timestamp.

---

## 4. Cloud Object Storage & Signed URL Security

- **Storage Bucket:** AWS S3 (`healthmate-ai-storage-2026`).
- **Access Level:** **Private (No Public Read Permissions)**.
- **Presigned URLs:**
  - Medical reports uploaded by patients are inaccessible via public URLs.
  - Temporary access requires authenticated API requests to `/api/v1/reports/:token/signed-url`.
  - The server verifies user ownership/assigned doctor relationship before generating an AWS S3 presigned URL with a **strict 15-minute expiration window**.
- **IAM Principle of Least Privilege:** AWS access keys are constrained to required S3 actions (`PutObject`, `GetObject`, `DeleteObject`, `GetBucketLocation`).

---

## 5. Network & API Abuse Protection

- **Rate Limiting:**
  - Authentication endpoints: Max 5 requests per 15 minutes per IP.
  - General API endpoints: Max 100 requests per 15 minutes per IP.
  - OTP verification: Max 3 attempts before code invalidation with 60-second resend cooldown.
- **Input Validation:**
  - Joi / Zod validation schemas on every mutation endpoint.
  - Strict regex sanitization on symptom text and query parameters.
- **File Upload Protection:**
  - Whitelist of permitted MIME types (`application/pdf`, `image/jpeg`, `image/png`, `text/plain`).
  - Max file size ceiling of 10 MB enforced at the gateway reverse proxy / Multer middleware.
- **Zero Secrets in Source Code:** All API keys, connection URIs, and credentials reside strictly in `.env` files omitted from git tracking via `.gitignore`.
