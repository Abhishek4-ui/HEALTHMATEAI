# HEALTHMATE AI — SECURITY & PRIVACY REVIEW
**Threat Modeling, Secret Protection, Ephemeral Data & DPDP Act Compliance**
**Date:** November 11, 2026 | **Classification:** DevSecOps & Healthcare Cyber Compliance

---

## 1. Credential Security & Git Hygiene
- **Zero Exposed Secrets:** Repository scanned recursively for exposed API keys, passwords, private certificates, or JWT secrets.
- **Git Tracking:** All `.env`, `.env.local`, and build artifacts are strictly excluded via `.gitignore`.
- **Credential Rotation:** Previously exposed SMTP and provider credentials have been rotated and verified exclusively through secure runtime socket handshakes.
- **Log Redaction:** Sensitive headers, authentication tokens, and patient PII are masked in all production logs (e.g. `[REDACTED_SENSITIVE_DATA]`).

---

## 2. DPDP Act 2023 & Healthcare Data Privacy
- **Consent Architecture:** Patient consent is explicitly captured and logged before any AI processing, medical imaging review, or report OCR.
- **Ephemeral Workspaces:** Health data processed in the session is cached in Redis with an enforced TTL.
- **Right to be Forgotten:** Executing `DELETE /api/v1/patient/forget-me` permanently invalidates session keys, clears Redis cache, and detaches presigned S3 storage objects.

---

## 3. Network & Transport Security
- **Strict HTTPS / WSS:** Enforced across all production ingress routes on Vercel and Render.
- **CORS Allowlist:** Origin restricted to production domain `https://healthmate-ai-nine-mocha.vercel.app` and authenticated local development ports.
- **Rate Limiting:** Express rate-limiting middleware configured to prevent brute force attacks and denial-of-service attempts on auth and AI endpoints.
