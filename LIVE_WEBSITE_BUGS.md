# HEALTHMATE AI — LIVE WEBSITE BUGS AND DEFECT LEDGER

**Report Date:** November 12, 2026, 10:44:00 IST  
**Environment:** Live Deployed Systems (Vercel Frontend, Render Node.js Backend, Render FastAPI AI Microservice)  
**Verification Method:** Automated Playwright Headless Chrome Testing, Network Interception, Manual Cloud Endpoint Inspection  

---

## 1. DEFECT CLASSIFICATION & SUMMARY

| Severity | Total Discovered | Resolved / Mitigated | Blocked on External | Open / Backlog |
| :--- | :--- | :--- | :--- | :--- |
| **Critical (P0)** | 0 | 0 | 0 | 0 |
| **High (P1)** | 1 | 1 | 0 | 0 |
| **Medium (P2)** | 2 | 1 | 1 | 0 |
| **Low / Minor (P3)** | 2 | 1 | 0 | 1 |
| **Informational / Policy** | 1 | 1 | 0 | 0 |
| **Total** | **6** | **4** | **1** | **1** |

---

## 2. EXHAUSTIVE DEFECT INVENTORY

### BUG-LIVE-001: Relative Fetch to Backend Imaging Endpoints Intercepted by Vercel SPA Rewrite
- **Severity:** High (P1)
- **Component:** `frontend/src/pages/patient/modules/Module20_MedicalImagingCenter.jsx` & `Module21_ECGCardiacCenter.jsx`
- **Description:**  
  The client invoked relative fetch calls directly to `/api/v1/patient/imaging/analyze` and `/api/v1/patient/cardiac/ecg-analyze`. Because Vercel's default SPA rewrite rule catches `/(.*)` and directs it to `/index.html`, this returned HTML (`content-type: text/html`) instead of JSON, resulting in `SyntaxError: Unexpected token '<'`.
- **Steps to Reproduce:**
  1. Open live Vercel site at `/patient/medical-imaging`.
  2. Upload a scan image and click "Run Clinical Analysis".
  3. Inspect Network tab: request to `/api/v1/patient/imaging/analyze` returns 200 with `index.html` body.
- **Root Cause:**  
  Missing explicit API proxy rewrite rule in `frontend/vercel.json` and bypassing `aiService` client.
- **Remediation Implemented:**
  1. Added proxy rewrite rule in `frontend/vercel.json`:
     ```json
     {
       "source": "/api/v1/(.*)",
       "destination": "https://healthmate-backend-9nmm.onrender.com/api/v1/$1"
     }
     ```
  2. Added `analyzeImagingScan` and `analyzeECG` methods to `frontend/src/services/aiService.js` utilizing the configured `apiClient` with base URL `https://healthmate-backend-9nmm.onrender.com/api/v1`.
  3. Refactored both components to call `aiService` methods with standard multipart headers.
- **Status:** **RESOLVED & VERIFIED IN PRODUCTION BUILD**

---

### BUG-LIVE-002: Navbar Responsive Gap Between 640px and 1024px (Tablet Portrait)
- **Severity:** Low (P3)
- **Component:** `frontend/src/components/layout/PublicNavbar.jsx`
- **Description:**  
  The desktop navigation links are hidden below `lg` breakpoint (`< 1024px`), while the mobile hamburger toggle button is hidden above `sm` breakpoint (`>= 640px`). Between 640px and 1023px (e.g., iPad portrait at 768px), neither the desktop links nor the hamburger menu button are visible, leaving only the brand logo and theme toggle.
- **Steps to Reproduce:**
  1. Set browser viewport width to 768px (Tablet portrait).
  2. Inspect navbar header.
  3. Notice navigation items ("Home", "Find Doctors", "Emergency Care") are omitted.
- **Workaround:**  
  Users on tablets can navigate directly via portal cards on the homepage or resize to landscape.
- **Recommended Fix:**  
  Change hamburger wrapper class from `sm:hidden` to `lg:hidden`, so the hamburger menu displays on all viewports below 1024px.
- **Status:** **OPEN / SCHEDULED FOR SPRINT 1 POLISH**

---

### BUG-LIVE-003: Razorpay Payment Route Endpoint Path Discrepancy
- **Severity:** Medium (P2)
- **Component:** `backend/src/routes/index.js` vs Test Harness
- **Description:**  
  Initial test probe attempted to invoke `/api/v1/patient/payment/create-order` returning HTTP 404.
- **Root Cause:**  
  The actual mounted payment route on the backend is `/api/v1/payments/order` protected by JWT authentication and `requireRoles(['PATIENT'])`.
- **Resolution:**  
  Corrected test script path to `https://healthmate-backend-9nmm.onrender.com/api/v1/payments/order`. Verified backend responds with HTTP 401 UNAUTHORIZED when unauthenticated, confirming security middleware is actively defending the route.
- **Status:** **RESOLVED & VERIFIED**

---

### BUG-LIVE-004: Fast2SMS Carrier SMS Delivery Blocked by Indian Telecom DLT Requirements
- **Severity:** Medium (P2) — External Blocker
- **Component:** `backend/src/services/sms.service.js`
- **Description:**  
  Fast2SMS requires Telecom Regulatory Authority of India (TRAI) Distributed Ledger Technology (DLT) entity registration and pre-approved SMS templates before transactional SMS messages can be dispatched to Indian mobile networks.
- **Current State:**  
  Fast2SMS integration is deliberately blocked from transmitting live SMS until TRAI DLT verification is finalized. The system does not fabricate success: if SMS fails, it surfaces clean logging without synthetic delivery.
- **Mitigation:**  
  Dual-channel authentication uses Gmail SMTP (`abhishekgga140@gmail.com`) with verified Resend fallback (`re_[REDACTED]`) for instant 6-digit OTP delivery to email.
- **Status:** **BLOCKED (EXTERNAL REGULATORY COMPLIANCE REQUIRED)**

---

### BUG-LIVE-005: Razorpay Payment Gateway Merchant Activation Pending KYC
- **Severity:** Low (P3) — Controlled Operation
- **Component:** `backend/src/services/payment.service.js`
- **Description:**  
  Razorpay payment processing is running with Test Mode API credentials (`rzp_test_...`). Real credit card and UPI charges cannot be collected until Razorpay business KYC and merchant verification is completed.
- **Safeguard:**  
  Razorpay Test Mode prevents accidental real-money transactions during testing and clinical pilots.
- **Status:** **CONTROLLED IN TEST MODE**

---

### BUG-LIVE-006: Clinical AI Diagnostic Boundary Compliance
- **Severity:** Informational / Medical Regulatory
- **Component:** `frontend/src/pages/patient/modules/Module03_SymptomChecker.jsx`
- **Description:**  
  Under Central Drugs Standard Control Organisation (CDSCO) guidelines for Software as a Medical Device (SaMD), automated algorithmic outputs cannot act as definitive diagnoses without clinical trial clearance.
- **Safeguard Active:**  
  All AI symptom assessments and image scans prominently feature the statutory medical disclaimer:  
  `"Automated assessment for informational review only. In case of emergency or severe symptoms, immediately contact nearest hospital or call 112."`
- **Status:** **COMPLIANT (INFORMATIONAL TRIAGE MODE ACTIVE)**

---

## 3. SUMMARY OF OPEN ACTIONS

1. **DLT Registration:** Complete TRAI DLT entity onboarding for transactional SMS sender ID.
2. **Merchant KYC:** Submit organization banking and tax documentation to Razorpay dashboard for live key activation.
3. **Navbar Breakpoint Update:** Update `sm:hidden` to `lg:hidden` in `PublicNavbar.jsx` to show hamburger drawer on tablet portrait screens.
