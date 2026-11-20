# HealthMate AI — Security Implementation Architecture

**Document Version:** 1.0.0  
**Compliance Standard:** OWASP Top 10 + DPDP Act 2023  
**Security Layers:** 25 Integrated Defense Controls

---

## 1. 25-Point Security Defense Matrix

| # | Security Control | Implementation Mechanism | Location in Codebase |
| :--- | :--- | :--- | :--- |
| 1 | **Security Headers** | Helmet with disabled inline eval and strict CSP | `backend/src/app.js` |
| 2 | **CORS Restrictions** | Whitelist limited to client origin (`localhost:5173`, production domain) | `backend/src/app.js` |
| 3 | **Global Rate Limiting** | 300 requests per 15-minute sliding window | `backend/src/middlewares/rateLimiter.js` |
| 4 | **Auth Rate Limiting** | 30 attempts per 10-minute window for login / register | `backend/src/middlewares/rateLimiter.js` |
| 5 | **Password Hashing** | Memory-hard Argon2id (64MB memory, 3 iterations) | `backend/src/security/argon2.js` |
| 6 | **JWT Access Control** | 15-minute short-lived access tokens with HMAC SHA-256 | `backend/src/security/jwt.js` |
| 7 | **Refresh Token Rotation** | SHA-256 hashed at rest; invalidated upon each refresh | `backend/src/services/auth.service.js` |
| 8 | **Token Reuse Detection** | Automatic revocation of entire user session family if revoked token reused | `backend/src/services/auth.service.js` |
| 9 | **Cryptographic OTP** | `crypto.randomInt` 6-digit numeric generation | `backend/src/security/crypto.js` |
| 10 | **OTP Hashing at Rest** | SHA-256 hash stored in Redis/memory; raw OTP never persisted | `backend/src/services/otp.service.js` |
| 11 | **OTP Attempt Limiting** | Maximum 3 attempts before permanent invalidation | `backend/src/services/otp.service.js` |
| 12 | **OTP Resend Cooldown** | 60-second enforced cooldown to stop SMS/Email flooding | `backend/src/services/otp.service.js` |
| 13 | **NoSQL Injection Defense** | Custom recursive sanitizer stripping `$` and `.` operators | `backend/src/security/sanitize.js` |
| 14 | **Input Schema Validation** | Strict Joi schemas stripping unapproved fields | `backend/src/validators/` |
| 15 | **Object-Level Authorization** | `requireOwnership` middleware verifying resource `patientId` | `backend/src/middlewares/ownership.middleware.js` |
| 16 | **IDOR Prevention** | Patient can never query another patient's appointments or records | `backend/src/middlewares/ownership.middleware.js` |
| 17 | **Privilege Escalation** | Admin registration blocked; role verification at route level | `backend/src/middlewares/role.middleware.js` |
| 18 | **Digital Signatures** | SHA-256 prescription signature hash with doctor NMC credentials | `backend/src/security/crypto.js` |
| 19 | **Webhook Integrity** | Cryptographic timing-safe HMAC SHA-256 verification | `backend/src/security/crypto.js` |
| 20 | **File Upload Restrictions** | Whitelist (PDF, PNG, JPG), 10MB limit, unique UUID tokens | `backend/src/services/report.service.js` |
| 21 | **Private Medical Files** | Private uploads directory; never exposed via public static URLs | `backend/src/services/report.service.js` |
| 22 | **Sensitive Log Redaction** | Passwords, symptoms, OTPs, and tokens replaced with `[REDACTED]` | `backend/src/security/redact.js` |
| 23 | **Immutable Audit Trail** | MongoDB collection with `updatedAt: false` | `backend/src/models/AuditLog.js` |
| 24 | **Payload Size Limits** | Express body parser strictly capped at 10MB | `backend/src/app.js` |
| 25 | **Graceful Shutdown** | Handled `SIGINT` and `SIGTERM` with 10s connection flush timeout | `backend/src/server.js` |
