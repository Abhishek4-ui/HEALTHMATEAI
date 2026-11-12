# HEALTHMATE AI — SECURITY POLICY & AUDIT ARCHITECTURE

**Project Name:** HEALTHMATE AI  
**Academic Degree:** B.Tech Computer Science & Engineering (AI/ML)  
**Document Code:** ENG-DOC-12  
**Standard:** OWASP Top 10 API Security (2023) • CIS Benchmarks • Zero Secret Leakage  

---

## 1. APPLICATION SECURITY ARCHITECTURE

HealthMate AI enforces a multi-tier defense-in-depth model across transport, application runtime, database, and cloud perimeter enclaves:

```
[ Cloudflare / Vercel Edge ] (DDoS Protection, TLS 1.3 Termination, CSP Headers)
             │
             ▼
[ Express API Gateway ] (Helmet, Strict CORS Origin, Rate Limiting, Joi Validation)
             │
             ▼
[ Role Enclave: PATIENT ] (JWT HMAC-SHA256, Anti-IDOR Object Ownership Verification)
             │
             ▼
[ Persistence Tier ] (MongoDB AES-256 at Rest, Upstash Redis TLS, AWS S3 Private Enclave)
```

---

## 2. KEY CRYPTOGRAPHIC INVARIANTS

1. **Password Hashing:**
   - Evaluated via `bcryptjs` with a work factor of **12 salt rounds**.
   - Timing-attack resistant verification (`bcrypt.compare()`).
2. **Access Token Lifecycles:**
   - Stateless JSON Web Tokens (JWT) signed with a 64-byte cryptographically random hex key (`openssl rand -hex 32`).
   - Short-lived Access Tokens ($15\,\text{minutes}$) paired with long-lived Refresh Tokens ($7\,\text{days}$) stored in HTTP-Only, Secure, SameSite=Strict cookies.
3. **Medical S3 Object Protection:**
   - Private bucket permissions (`BlockPublicAcls: true`, `IgnorePublicAcls: true`, `BlockPublicPolicy: true`, `RestrictPublicBuckets: true`).
   - Ephemeral AWS SDK presigned URLs with exact **15-minute expiration** ($900\,\text{seconds}$).
4. **Zero Production OTP Leakage:**
   - 6-digit numeric OTP generated via OS entropy source (`crypto.randomInt(100000, 1000000)`).
   - Never included in API JSON responses, never printed to console logs, and never rendered on UI screens.
   - Atomic single-use deletion upon verification (`redisClient.del()`).
   - 3-strike brute-force token destruction.
5. **Anti-IDOR (Insecure Direct Object Reference) Verification:**
   - Every patient endpoint (`/reports`, `/vitals`, `/appointments`, `/medications`) compares `record.patientId.toString() === req.user.id`. Manipulation of route parameters returns `403 Forbidden`.

---

## 3. ZERO SECRET DISCLOSURE AUDIT

A complete repository audit confirmed:
- Zero `.env` files committed to Git (`git status`, `git log -p`).
- All environment files strictly listed in `.gitignore`.
- Example configuration templates (`.env.example`) provide sanitized placeholders (`your_key_here`) with zero live credentials.
