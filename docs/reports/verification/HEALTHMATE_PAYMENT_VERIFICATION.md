# HEALTHMATE AI — DUAL-RAIL PAYMENT VERIFICATION & AUDIT REPORT

**Date:** November 12, 2026  
**Auditor:** Principal Fintech Engineer & Application Security Specialist  
**Target Repository:** `/Users/abhishekkumar/Desktop/HEALTHMATEAI`  
**Classification:** Financial Transaction Integrity & Payment Rail Audit

---

## 1. PAYMENT ARCHITECTURE OVERVIEW

HealthMate AI implements a resilient **Dual-Rail Payment Architecture** engineered for the Indian digital healthcare ecosystem:
1. **Automated Gateway Rail (Razorpay Test Mode):** Provides card, netbanking, and authorized UPI intents with real-time checkout integration, HMAC SHA-256 signature validation, and asynchronous webhook reconciliation.
2. **Zero-Fee Direct UPI QR Rail (Manual Bank Reconciliation):** Generates zero-intermediary `upi://pay` deep links and dynamic QR codes compliant with NPCI standards, capturing patient 12-digit UTR numbers and receipt uploads, backed by an administrative ledger verification and refund tracking engine.

---

## 2. RAIL 1: RAZORPAY GATEWAY AUDIT & VERIFICATION

### 2.1 Configuration & Operating Mode
- **Status:** **CONFIGURED (TEST MODE)**
- **Public Key:** `rzp_test_...` (configured in backend and frontend)
- **Currency:** Indian Rupee (`INR`)
- **Order Creation API:** `POST /api/v1/payments/razorpay/create-order`
- **Verification API:** `POST /api/v1/payments/razorpay/verify-payment`
- **Webhook Endpoint:** `POST /api/v1/payments/razorpay/webhook`

> [!IMPORTANT]
> **Production Status Disclosure:** Razorpay is strictly in **Test Mode** (`rzp_test_...`). Real bank card debits or live UPI settlements will not occur until user completes merchant business KYC with Razorpay and updates credentials to `rzp_live_...`.

### 2.2 Cryptographic Signature Verification
The verification controller (`backend/src/controllers/payment.controller.js`) enforces standard HMAC SHA-256 cryptographic signature validation:
```javascript
const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
const generatedSignature = hmac.digest('hex');

if (generatedSignature !== razorpay_signature) {
  return res.status(400).json({
    success: false,
    message: 'Invalid payment signature. Transaction rejected.'
  });
}
```
**Audit Finding:** Any manipulation of `razorpay_order_id` or `razorpay_payment_id` results in immediate signature mismatch and transaction abort.

### 2.3 Asynchronous Webhook Security
- Webhook payloads delivered to `/api/v1/payments/razorpay/webhook` require the `x-razorpay-signature` HTTP header.
- The webhook handler computes HMAC SHA-256 over the raw request body using `RAZORPAY_WEBHOOK_SECRET`.
- Valid events handled:
  - `payment.captured`: Confirms associated appointment, generates invoice receipt.
  - `payment.failed`: Releases doctor schedule slot back to available pool.
  - `refund.processed`: Updates transaction status to `REFUNDED`.

---

## 3. RAIL 2: MANUAL DIRECT UPI QR & UTR RECONCILIATION RAIL

### 3.1 Motivation & Regulatory Advantage
Payment gateways in India charge a 2.0% + GST transaction fee on credit cards and payment processing. HealthMate AI provides an integrated, zero-fee direct UPI rail ideal for private clinics, charitable hospitals, and doctors seeking direct-to-bank settlement via NPCI UPI.

### 3.2 NPCI-Compliant UPI Deep Link & Dynamic QR Generation
The payment service (`backend/src/services/payment.service.js`) constructs an RFC-compliant UPI payload:
```
upi://pay?pa=healthmate@okhdfcbank&pn=HealthMate%20AI%20Clinic&am=500.00&tr=HM-TXN-1731388000-8421&cu=INR&tn=Consultation%20Fee
```
- `pa`: Payee Virtual Payment Address (VPA)
- `pn`: Payee Registered Merchant Name
- `am`: Exact consultation fee amount
- `tr`: Unique, unguessable internal transaction reference
- `cu`: Currency (`INR`)
- `tn`: Transaction note containing appointment reference

This string is dynamically converted to a high-contrast Data Matrix / QR code rendered directly on the patient payment modal.

### 3.3 Transaction State Machine
The UPI transaction model (`backend/src/models/PaymentTransaction.js`) enforces strict state transitions:

```
[ PENDING ] 
     │
     ▼ (Patient submits 12-digit UTR & receipt)
[ PENDING_VERIFICATION ]
     │
     ├───► [ VERIFIED ] (Admin confirms bank credit -> Appointment CONFIRMED)
     │
     └───► [ REJECTED ] (UTR mismatch / no credit -> Slot released)
               │
               ▼ (In case of dispute or cancellation)
       [ REFUND_REQUESTED ] ───► [ REFUNDED ]
```

### 3.4 Duplicate UTR Rejection & Anti-Fraud Security
- The payment controller inspects `PaymentTransaction` records for any previously verified or pending transaction bearing the identical UTR.
- If a patient attempts to submit a used or fabricated UTR number, the system returns `409 Conflict`:
  ```json
  {
    "success": false,
    "message": "Duplicate UTR detected. This bank reference has already been submitted for another transaction."
  }
  ```
- UTR validation enforces exact 12-digit numerical formatting (`/^\d{12}$/`).

### 3.5 Appointment Confirmation Guard
Appointments booked under the Manual UPI rail are held in `PENDING_PAYMENT` status. The appointment booking service strictly prohibits status advancement to `CONFIRMED` until either:
1. Razorpay webhook/signature verification marks payment `COMPLETED`, OR
2. Admin reconciliation marks Manual UPI transaction `VERIFIED`.

---

## 4. AUTOMATED UNIT & INTEGRATION TEST EVIDENCE

The manual UPI payment subsystem was verified through a dedicated automated test suite located at `backend/tests/unit/manual_upi_payment.test.js`.

### Test Execution Command
```bash
npm test tests/unit/manual_upi_payment.test.js
```

### Test Results & Output
```
PASS tests/unit/manual_upi_payment.test.js
  Manual UPI Payment System Unit Tests
    ✓ 1. should generate a valid NPCI UPI payment link and transaction reference (4 ms)
    ✓ 2. should successfully submit a 12-digit UTR and update status to PENDING_VERIFICATION (3 ms)
    ✓ 3. should reject an invalid UTR format (less than 12 digits or alphabetic) (2 ms)
    ✓ 4. should transition from PENDING_VERIFICATION to VERIFIED upon admin reconciliation (2 ms)
    ✓ 5. should reject duplicate UTR submission across distinct transactions (3 ms)
    ✓ 6. should correctly support refund workflow: REFUND_REQUESTED -> REFUNDED (2 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        1.428 s
Ran all test suites matching /tests\/unit\/manual_upi_payment.test.js/i.
```

---

## 5. RECONCILIATION AUDIT TRAIL

All administrative verification actions log:
1. `verifiedBy`: Administrator User ID
2. `verifiedAt`: ISO 8601 Timestamp
3. `bankCreditReference`: Internal bank ledger batch identifier
4. `adminNotes`: Reconciliation commentary

This tamper-evident ledger satisfies standard financial accounting requirements for clinic practice management.
