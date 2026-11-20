# HealthMate AI — Redis Temporary Session Architecture

**Document Version:** 1.0.0  
**Compliance Standard:** Digital Personal Data Protection (DPDP) Act 2023 (India)  
**Storage Tier:** Ephemeral In-Memory Key-Value Store  
**Engine:** Redis Cloud (with ioredis cluster client)

---

## 1. Architectural Philosophy: Temporary By Default

In contrast to conventional healthtech applications that accumulate unencrypted user queries in relational or document databases, HealthMate AI enforces a **strict Zero-Trust Ephemeral Patient Privacy Baseline**:

1. **Patient Health Information (PHI) is Ephemeral by Default:**
   - Symptom inquiries, AI Copilot conversation turns, preliminary triage evaluations, and report OCR text extractions are held exclusively in RAM via Redis with an enforced Time-To-Live (TTL).
   - Once the TTL expires, the key is permanently reclaimed by the Redis eviction engine with zero residual traces.
2. **Never Written Silently to Persistent Storage:**
   - If Redis becomes unreachable, the backend fails safely with a clear warning. It **never silently moves temporary health data to MongoDB**.
3. **Statutory Transactional Exceptions:**
   - Only legally mandated transactional ledgers (confirmed appointments, digitally signed prescriptions, payment IDs, and DPDP consent grant/revocation tokens) are written to MongoDB Atlas.

---

## 2. Key Topology & TTL Policies

| Key Pattern | Data Structure | Default TTL | Description |
| :--- | :--- | :--- | :--- |
| `session:guest:<sessionId>` | JSON String | 3,600s (60 min) | Holds active guest triage context, vitals inputs, and recent chat history. |
| `session:ocr:<uploadToken>` | JSON String | 1,800s (30 min) | Holds extracted lab biomarkers and report metadata during analysis. |
| `session:risk:<sessionId>` | JSON String | 3,600s (60 min) | Holds cardiovascular / metabolic risk score parameters. |
| `otp:<type>:<target>:<purpose>` | JSON String | 300s (5 min) | Holds SHA-256 hashed 6-digit OTP with 3-attempt limit. |
| `cooldown:otp:<type>:<target>:<purpose>` | String ('1') | 60s (1 min) | Enforces 1-minute rate limiting cooldown between OTP requests. |
| `consultation:<appointmentId>` | Set | 7,200s (2 hours) | Live WebRTC peer connection tracking. |

---

## 3. The "Forget Me" Immediate Purge Operation

Under Section 12 of India's DPDP Act 2023, data principals hold the absolute right to have their personal data erased. HealthMate AI exposes this via `DELETE /api/v1/patient/forget-me`:

```javascript
// Atomically deletes all temporary patient health information in Redis
await client.del(
  `session:guest:${sessionId}`,
  `session:ocr:${sessionId}`,
  `session:risk:${sessionId}`
);
```

### Verification & Audit
- Once executed, all subsequent queries for `sessionId` return `null`.
- An immutable audit entry (`action: 'PURGE_EPHEMERAL_SESSION'`) is recorded in the `audit_logs` collection documenting that the purge was executed upon user request.
