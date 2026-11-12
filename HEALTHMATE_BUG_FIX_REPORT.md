# HEALTHMATE AI — BUG FIX & REGRESSION AUDIT REPORT

**Report Date:** November 12, 2026  
**Auditor:** Principal QA Automation Engineer & Senior Full-Stack Engineer  
**Scope:** Exhaustive defect ledger, root-cause analysis, code remediations, and regression verification for HealthMate AI.

---

## 1. DEFECT METRICS & SUMMARY

```
Total Defects Discovered: 8
Total Defects Resolved:   8
Regression Test Suites:   12 Passed / 12 Total (108 Tests)
Production Rollup Status: Clean build (2,657 modules, 0 errors)
```

---

## 2. EXHAUSTIVE BUG LEDGER & REMEDIATION DETAILS

### BUG-01: Vercel SPA Catch-All Rewrite Intercepting Relative API Requests
- **Severity:** High (P1)
- **Component:** `frontend/src/pages/patient/modules/Module20_MedicalImagingCenter.jsx` & `Module21_ECGCardiacCenter.jsx`
- **Reproduction:** Calling `fetch('/api/v1/patient/imaging/analyze')` on the deployed Vercel domain returned HTTP 200 with `index.html` content (`content-type: text/html`), causing `SyntaxError: Unexpected token '<'` during JSON parsing.
- **Root Cause:** Missing explicit reverse proxy rewrite rule in `frontend/vercel.json` for API endpoints.
- **Fix:**
  1. Configured `/api/v1/(.*)` rewrite in `frontend/vercel.json` pointing to `https://healthmate-backend-9nmm.onrender.com/api/v1/$1`.
  2. Extended `aiService.js` with `analyzeImagingScan` and `analyzeECG` methods utilizing configured `apiClient`.
- **Regression Verification:** Tested live file upload via Playwright automation script (`TEST-LIVE-11`). Upload succeeded with valid JSON response.
- **Status:** **RESOLVED**

---

### BUG-02: Public Navbar Responsive Breakpoint Gap on Tablet Viewports
- **Severity:** Low (P3)
- **Component:** `frontend/src/components/layout/PublicNavbar.jsx`
- **Reproduction:** On viewports between 640px and 1024px (e.g. iPad portrait at 768px), desktop nav links (`hidden lg:flex`) were hidden, and the mobile hamburger menu (`flex sm:hidden`) was also hidden.
- **Root Cause:** Incongruent breakpoint utilities (`sm:hidden` vs `lg:flex`).
- **Fix:** Changed hamburger button wrapper and drawer from `sm:hidden` to `lg:hidden`.
- **Regression Verification:** Tested viewports 1440x900 (Desktop), 768x1024 (Tablet), and 375x667 (Mobile) via Playwright (`TEST-LIVE-16`). All viewports render functional navigation.
- **Status:** **RESOLVED**

---

### BUG-03: Gmail SMTP Authentication Failure (535 BadCredentials)
- **Severity:** High (P1)
- **Component:** `backend/src/services/communication.service.js` & `.env`
- **Reproduction:** Sending email OTP returned `535-5.7.8 Username and Password not accepted`.
- **Root Cause:**
  1. `SMTP_USER` in `.env` was mistakenly set to `smtp.gmail.com` instead of the account email address `abhishekgga140@gmail.com`.
  2. 16-character Google App Password contained internal whitespace characters.
- **Fix:**
  1. Corrected `SMTP_USER=abhishekgga140@gmail.com`.
  2. Added `.replace(/\s+/g, '')` sanitization on `SMTP_PASS`.
- **Regression Verification:** Tested live email dispatch. Real email delivered with Message ID `<3fa12808-5099-a517-5dfe-afa9ce2bb10f@gmail.com>`.
- **Status:** **RESOLVED**

---

### BUG-04: OTP Secret Code Disclosure in Production Responses
- **Severity:** Critical (P0) — Healthcare Security Vulnerability
- **Component:** `backend/src/controllers/auth.controller.js` & `backend/src/services/otp.service.js`
- **Reproduction:** `POST /api/v1/auth/otp/send` and `/register` returned `rawOTP` in production API JSON responses.
- **Root Cause:** Development convenience code was not gated by environment checks.
- **Fix:**
  1. Gated `rawOTP` field strictly behind `process.env.NODE_ENV === 'test'`.
  2. In production mode, responses return only `{ success: true, expiresInSeconds: 300, resendCooldownSeconds: 30 }`.
  3. Removed all backup codes and hardcoded debug OTPs from frontend pages (`MobileOTPPage.jsx`, `RegisterPage.jsx`).
- **Regression Verification:** Added unit test `SEC-OTP-001` in `tests/unit/otp_security.test.js`. Verified production responses contain 0 OTP digits.
- **Status:** **RESOLVED**

---

### BUG-05: Missing Manual UPI Payment Lifecycle & Reconciliation
- **Severity:** High (P1)
- **Component:** `backend/src/models/PaymentTransaction.js` & `payment.service.js`
- **Reproduction:** Patients had no alternative to Razorpay, preventing payment when Razorpay was in Test Mode or merchant KYC was pending.
- **Root Cause:** Platform lacked a manual UPI QR and UTR reconciliation workflow.
- **Fix:**
  1. Upgraded `PaymentTransaction` schema with `manualUpi` subdocument and statuses (`PENDING`, `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, `REFUND_REQUESTED`, `REFUNDED`).
  2. Implemented `initiateManualUpi`, `submitUpiUtr`, `adminVerifyUpiPayment`, `adminRejectUpiPayment`, and refund endpoints.
  3. Added frontend service methods in `patientService.js` and `adminService.js`.
- **Regression Verification:** Created dedicated unit test suite `backend/tests/unit/manual_upi_payment.test.js` (6/6 tests passed).
- **Status:** **RESOLVED**

---

### BUG-06: Google Places Hard Dependency for India-Wide Location Search
- **Severity:** Medium (P2)
- **Component:** `backend/src/services/hospital.service.js` & `places.service.js`
- **Reproduction:** Searching for doctors or hospitals outside seeded areas failed if `GOOGLE_PLACES_API_KEY` was missing or unbilled.
- **Root Cause:** No free open-source geocoding fallback.
- **Fix:** Implemented `osmDiscovery.service.js` utilizing OpenStreetMap Nominatim and pre-computed state centroids for all 36 Indian States and UTs.
- **Regression Verification:** Tested live geocoding of Delhi, Mumbai, Bengaluru; verified offline directory and Nominatim resolve accurately with 0 API keys.
- **Status:** **RESOLVED**

---

### BUG-07: Unauthenticated Direct Access to Admin Dashboard
- **Severity:** High (P1) — Authorization Bypass
- **Component:** `frontend/src/components/auth/ProtectedRoute.jsx`
- **Reproduction:** Typing `/admin/dashboard` into browser address bar without logging in.
- **Root Cause:** Client router required robust redirection and server-side RBAC validation.
- **Fix:**
  1. `ProtectedRoute.jsx` intercepts unauthenticated visits and redirects to `/login?role=ADMINISTRATION`.
  2. If user is authenticated as `PATIENT` or `DOCTOR`, it blocks access and displays the red "Access Restricted" alert.
  3. Backend Express routes enforce `authenticateToken` and `requireRoles(['ADMINISTRATION'])`.
- **Regression Verification:** Automated Playwright test `TEST-LIVE-08` verified unauthenticated redirect and role barrier.
- **Status:** **RESOLVED**

---

### BUG-08: Memory Leaks and Hanging Jest Processes during SMTP Unit Tests
- **Severity:** Medium (P2)
- **Component:** `backend/tests/unit/otp_security.test.js`
- **Reproduction:** Running `npm test` caused Jest to hang for 30 seconds due to live Google SMTP socket connections during test runs.
- **Root Cause:** Unit tests triggered real network calls across the internet.
- **Fix:** Added `jest.spyOn(communicationService, 'sendEmail')` to isolate unit tests to cryptographic hashing and rate-limiting logic.
- **Regression Verification:** Backend test suite execution time reduced from 45s to 25s with 100% passing tests.
- **Status:** **RESOLVED**
