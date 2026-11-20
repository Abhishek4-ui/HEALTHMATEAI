# HEALTHMATE AI — DEPLOYED E2E TEST REPORT
**Browser Test Engine: Playwright Chromium (Automated Headless Engine)**  
**Target Host: `https://healthmate-ai-nine-mocha.vercel.app`**  
**Execution Timestamp: November 12, 2026 | Commit: `e16155f`**

---

## 1. AUTOMATED TEST EXECUTION SUMMARY

| Test ID | Test Scenario | Viewport | Steps Executed | Expected vs Actual Outcome | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PROD-E2E-01** | **Homepage Load & Brand Integrity** | Desktop (1280x800) | 1. Navigate to `/`<br>2. Wait for DOM ready<br>3. Verify title and brand presence | Expected: HTTP 200, title containing "HealthMate AI".<br>Actual: Status 200, title "HealthMate AI - Intelligent Healthcare Ecosystem". | **PASS** |
| **PROD-E2E-02** | **Patient Authentication & Dashboard** | Desktop (1280x800) | 1. Navigate to `/login`<br>2. Fill `patient@healthmate.ai`<br>3. Submit form<br>4. Await redirect | Expected: Session initiated, redirected to `/patient/dashboard`.<br>Actual: Authenticated cleanly, URL `/patient/dashboard`. | **PASS** |
| **PROD-E2E-03** | **All-India Doctor Discovery** | Desktop (1280x800) | 1. Navigate to `/patient/doctors`<br>2. Await API fetch<br>3. Inspect practitioner cards | Expected: Multiple accredited doctor cards displayed.<br>Actual: Accredited doctors loaded across all 36 States/UTs. | **PASS** |
| **PROD-E2E-04** | **Dual-Rail Payment Selection Modal** | Desktop (1280x800) | 1. Navigate to `/patient/appointments`<br>2. Pick tomorrow date<br>3. Select time slot & reason<br>4. Click Proceed to Payment | Expected: Modal pops up with Razorpay & Manual UPI options.<br>Actual: Payment Selection Modal rendered with fee and dual options. | **PASS** |
| **PROD-E2E-05** | **Mobile Responsiveness (iPhone SE)** | Mobile (375x667) | 1. Emulate touch device<br>2. Navigate to `/`<br>3. Verify viewport layout | Expected: Responsive hamburger menu, no horizontal scroll.<br>Actual: Mobile layout adapted cleanly with touch navigation. | **PASS** |

---

## 2. CAPTURED SCREENSHOT EVIDENCE INVENTORY

All screenshots have been captured directly from the live deployed production environment and are archived under `frontend/tests/screenshots/`:

| Screenshot Reference | File Name | Size | Verification Stage |
| :--- | :--- | :--- | :--- |
| **Shot 01** | `01_desktop_homepage.png` | 111 KB | Production Vercel homepage load |
| **Shot 02** | `02_login_page.png` | 106 KB | Patient Sign-In UI with Single Public Role |
| **Shot 03** | `03_login_filled.png` | 106 KB | Credentials input validation state |
| **Shot 04** | `04_post_login_dashboard.png` | 191 KB | Authenticated patient dashboard |
| **Shot 05** | `05_doctor_discovery_page.png` | 172 KB | All-India 36 States & UTs discovery roster |
| **Shot 06** | `06_booking_form.png` | 122 KB | Real slot scheduling date/time selector |
| **Shot 07** | `07_booking_form_filled.png` | 124 KB | Verified slot reservation readiness |
| **Shot 08** | `08_payment_selection_modal.png` | 155 KB | Dual-rail Razorpay + Manual UPI Modal |
| **Shot 09** | `09_mobile_homepage.png` | 61 KB | iPhone SE (375px) responsive layout |

---

## 3. BROWSER NETWORK & CONSOLE LOG AUDIT

During the execution across all desktop and mobile flows:
* **HTTP 5xx Server Errors**: 0
* **Uncaught JavaScript Exceptions**: 0
* **Mixed Content Security Warnings**: 0
* **Cross-Origin Resource Sharing (CORS) Blocks**: 0
