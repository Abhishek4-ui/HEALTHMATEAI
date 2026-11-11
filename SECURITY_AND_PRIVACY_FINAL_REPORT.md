# HEALTHMATE AI — SECURITY AND PRIVACY FINAL REPORT
## Enterprise Information Security, DPDPA 2023 Sovereign Privacy & Zero-Trust Governance

**Document Reference:** `HM-SEC-PRIV-FINAL-001`  
**Evaluation Date:** November 11, 2026  
**Auditor:** Chief Information Security Officer (CISO) & Data Protection Officer (DPO)  
**Compliance Standards:** Indian Digital Personal Data Protection Act (DPDPA 2023), HIPAA Security Rule, OWASP Top 10 API Security  
**Final Status:** **PASS (ZERO LEAKED CREDENTIALS; SOVEREIGN PRIVACY GUARANTEED)**

---

### 1. Priority Zero Credential Security & Git History Sanitation

#### 1.1 Git History & Working Tree Audit
- **Exposed Secret Elimination:** All historical commits were audited. Old credentials (including historical Google App Passwords) were permanently removed from the active Git history.
- **Pre-Rewrite Safety Branch:** `backup-pre-p8.1-history-rewrite` remains isolated in local storage as an encrypted safety backup.
- **Git Ignore Verification:**
  ```bash
  $ git check-ignore backend/.env
  backend/.env  # Verified ignored
  ```
- **Runtime Environment Injection:** No credentials or API keys exist in version-controlled source files, frontend build bundles, or documentation. All secrets are supplied solely via runtime environment variables (`process.env` in Node.js, `os.environ` in Python FastAPI).

---

### 2. Authentication, Session & Access Control Architecture

#### 2.1 Dual-Token Authentication Engine (`jwt.js` & `RefreshToken.js`)
- **Access Tokens:** Signed with HMAC SHA-256 (`JWT_ACCESS_SECRET`, 256-bit entropy). Short-lived (15 minutes). Contains minimal claims (`id`, `role`, `email`).
- **Refresh Tokens:** Long-lived (7 days), stored hashed using Argon2id in MongoDB collection `RefreshToken`. Tokens are revoked upon logout, password change, or user session invalidation.

#### 2.2 Role-Based Access Control (RBAC)
Strict role-based isolation is enforced across three distinct actors:
1. **`PATIENT`**: Authorized for symptom intake, appointments, payment checkout, teleconsultation room access, and consent management.
2. **`DOCTOR`**: Authorized for SOAP note drafting, prescription issuance, appointment slot configuration, and video consultation.
3. **`ADMINISTRATION`**: Authorized for healthcare facility sync, practitioner credential verification, quarantine review, and MLOps telemetry.

```javascript
// Enforcement in backend/src/middlewares/role.middleware.js
const requireRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) return errorResponse(res, 'Authentication required.', 401, 'UNAUTHORIZED');
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, `Access denied. Requires one of [${allowedRoles.join(', ')}] role privileges.`, 403, 'FORBIDDEN_ROLE');
    }
    next();
  };
};
```

#### 2.3 Anti-IDOR Ownership Middleware (`ownership.middleware.js`)
To protect against Insecure Direct Object References (IDOR), all medical resources (prescriptions, consultation records, uploaded reports) verify ownership:
- A patient can only access records matching their authenticated `userId`.
- An assigned doctor can access records for their active consultation sessions.
- Non-owning unauthorized access attempts are rejected with `403 Forbidden` (`FORBIDDEN_RESOURCE`).

---

### 3. Patient Data Privacy & DPDPA Sovereign Compliance

HealthMate AI is architected from the ground up to comply with the Indian **Digital Personal Data Protection Act (DPDPA 2023)**:

#### 3.1 Ephemeral Memory Storage (Redis volatile-ttl)
- Unauthenticated guest symptom queries, interactive AI chat buffers, and raw report text are stored exclusively in Redis in-memory storage with strict Time-To-Live (TTL):
  - Guest Triage Sessions: **3,600 seconds (1 hour)**
  - Report OCR Extraction Buffers: **1,800 seconds (30 minutes)**
  - Geocoding Cache: **7,200 seconds (2 hours)**
- Redis server is configured with `--maxmemory-policy volatile-ttl` ensuring unpersisted intake data automatically expires.

#### 3.2 DPDP "Forget Me" Sovereign Purge
The platform implements a sovereign data deletion endpoint (`DELETE /api/v1/patient/forget-me`):
- Instantly flushes Redis memory keys associated with `X-Session-ID`.
- Triggers AWS S3 report deletion for staged extraction files.
- Writes an immutable audit entry into MongoDB `AuditLog` recording the deletion timestamp, IP address, and actor ID (without storing any health data).
- Verified via integration tests in `phase6.test.js` and `api.test.js`.

#### 3.3 Zero PHI Logging & Redaction
The custom logging wrapper (`backend/src/utils/logger.js` and `backend/src/security/redact.js`) sanitizes incoming request and error payloads. Patient names, phone numbers, email addresses, and clinical notes are never written to disk or stdout.

---

### 4. Network & Application Hardening

| Protection Layer | Implementation Mechanism | Validation Finding | Status |
| :--- | :--- | :--- | :--- |
| **HTTP Security Headers** | Helmet.js middleware (`backend/src/app.js`) | Prevents MIME-sniffing, XSS, clickjacking, and enforces strict Referrer-Policy. | **PASS** |
| **Cross-Origin Resource Sharing** | Strict CORS middleware whitelist | Permitted origins: `CLIENT_URL`, `http://localhost:5173`, `http://127.0.0.1:5173`. Disallows wildcard origins. | **PASS** |
| **API Rate Limiting** | `express-rate-limit` (`middlewares/rateLimiter.js`) | Enforces 100 requests per 15-minute window for standard APIs; stricter limits for auth endpoints. | **PASS** |
| **Input Sanitization** | `sanitizeInputMiddleware` (`security/sanitize.js`) | Deeply strips MongoDB operator injection keys (`$`, `.`) from query parameters and request bodies. | **PASS** |
| **Password Hashing** | Argon2id (`backend/src/security/argon2.js`) | Configured with memory cost 65536 KB, time cost 3 iterations, 4 parallelism threads. | **PASS** |

**Conclusion:** The security posture conforms to enterprise healthcare standards and legal requirements under the Indian DPDPA 2023.
