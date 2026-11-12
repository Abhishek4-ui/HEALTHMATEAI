# HEALTHMATE AI — SECURITY & COMPLIANCE ACCEPTANCE REPORT
**Standards Baseline: OWASP ASVS 5.0 (Application Security Verification Standard) & DPDP Act 2023**  
**Classification: Level 2 Healthcare Data Architecture Verification**

---

## 1. OWASP ASVS 5.0 VERIFICATION MATRIX

| ASVS Section | Verification Requirement | Implementation in HealthMate AI | Verified Status |
| :--- | :--- | :--- | :--- |
| **V1: Architecture** | Single Public User Role Policy | Public entry restricted strictly to PATIENT. Doctor and Admin routes isolated. | **PASS** |
| **V2: Authentication** | Password Storage & Hashing | Passwords hashed using Argon2id with cryptographically random salt. | **PASS** |
| **V3: Session Management**| Short-Lived Tokens & Rotation | 15-minute JWT access tokens + rotating cryptographically hashed refresh tokens. | **PASS** |
| **V4: Access Control** | Role-Based Access Control (RBAC)| Middlewares `authenticateToken`, `requireRoles`, and tenant isolation on MongoDB queries. | **PASS** |
| **V5: Validation** | Input Sanitization & Typing | Joi schemas on all routes. Strict alphanumeric UTR check and date constraints. | **PASS** |
| **V6: Cryptography** | Tamper-Evident Signatures | HMAC-SHA256 for payment verification and SHA-256 digital prescription signatures. | **PASS** |
| **V8: Data Protection** | DPDP Act 2023 Ephemeral Privacy | Ephemeral health sessions stored in Redis with 1-hour TTL. Instant purge via Forget-Me. | **PASS** |
| **V13: API Security** | Rate Limiting & Denial of Service| Redis-backed rate limiter on OTP dispatches and API gateways (`express-rate-limit`). | **PASS** |

---

## 2. PRODUCTION SECRETS & REDACTION AUDIT

1. **OTP Security Verification**:
   * Production responses never return OTP values (`tests/unit/otp_security.test.js`).
   * OTP values are stored as SHA-256 hashes in Redis (`src/security/crypto.js`).
   * Development fallback OTP is automatically disabled when `NODE_ENV === 'production'`.
2. **Logging Sanitization**:
   * Custom Winston logger actively scrubs sensitive fields (`password`, `passwordHash`, `token`, `otp`, `secret`, `ssn`, `aadhaar`) from stdout and disk logs (`src/security/redact.js`).
3. **Storage Security**:
   * AWS S3 bucket blocks public access. Presigned URLs are scoped to 15-minute time limits for medical report viewing.

---

## 3. DIGITAL PERSONAL DATA PROTECTION (DPDP) ACT 2023 COMPLIANCE

* **Right to be Forgotten (Immediate Ephemeral Purge)**:
  - Invoking `DELETE /api/v1/patient/forget-me` immediately purges the active Redis session key, removes staged in-memory uploads, and invalidates current session tokens.
* **Statutory Retention Boundaries**:
  - In accordance with National Medical Commission Telemedicine Practice Guidelines (Section 3.8) and the Income Tax Act 1961 (Section 44AA), confirmed doctor appointments, tax invoices, and digitally signed clinical prescriptions are retained for mandatory statutory compliance (3 to 7 years) with encryption at rest.
