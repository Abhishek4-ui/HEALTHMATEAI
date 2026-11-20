# HEALTHMATE AI — REMAINING BLOCKERS & REQUIRED CREDENTIALS
**Third-Party Provider Authorizations, Merchant KYC & Regulatory Pre-Requisites**
**Date:** November 11, 2026 | **Classification:** Operations & Provider Readiness

---

## 1. Summary of Platform State
The HealthMate AI platform is fully coded, internally validated, and operational. No code modifications or architectural rebuilds are needed.

However, in strict compliance with the **Non-Negotiable Development Rules (Rules 4, 5, 8, 13)**, certain live third-party services require commercial enterprise credentials and government regulatory approvals before live traffic can be handled.

---

## 2. Itemized External Provider Requirements

### 2.1 Razorpay Payment Gateway (Live INR Settlements)
- **Current Status:** Test Mode (`rzp_test_...`) operational. Test card charges and signature verifications pass.
- **Production Prerequisite:**
  - Registered Business Entity PAN, GSTIN, and Bank Account submission.
  - Merchant KYC completion in Razorpay Dashboard.
  - Activation of Live API Keys (`rzp_live_key_id` and `rzp_live_key_secret`).
- **Platform Handling:** Live checkout buttons are safeguarded. If live credentials are absent, the system operates in test sandbox mode without reporting fake real-world debit settlements.

### 2.2 Twilio SMS Gateway (TRAI Indian DLT Compliance)
- **Current Status:** Trial Mode (`ACac3dd5...`). Direct SMS to unverified numbers rejected by provider.
- **Production Prerequisite:**
  - Distributed Ledger Technology (DLT) Registration under Telecom Regulatory Authority of India (TRAI) regulations (e.g. via Jio DLT, Airtel DLT, or VilPower).
  - Approved Principal Entity ID (PEID).
  - Registered 6-character Alpha Header / Sender ID (e.g., `HLTMTE`).
  - Approved SMS Content Templates for OTP, Appointments, and SOS alerts.
- **Platform Handling:** Dispatches to unverified numbers fail gracefully with status `PROVIDER_CONFIGURATION_REQUIRED`. The platform **never** reports a message as delivered without positive provider confirmation.

### 2.3 Central Drugs Standard Control Organisation (CDSCO) SaMD Registration
- **Current Status:** Informational Decision Support System with explicit non-diagnostic disclaimers.
- **Production Prerequisite:**
  - Formal Class B/C Software as a Medical Device (SaMD) regulatory filing if autonomous diagnostic claims are ever sought in the future.
- **Platform Handling:** Platform strictly maintains Clinical Decision Support (CDS) stance; all outputs mandate clinician peer review.
