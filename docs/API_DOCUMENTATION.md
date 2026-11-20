# HealthMate AI — REST & WebSocket API Specification

> **Base Production URL (Direct Render):** `https://healthmate-backend-9nmm.onrender.com/api/v1`  
> **Base Production URL (Vercel Edge Proxy):** `https://healthmate-ai-nine-mocha.vercel.app/api/v1` *(Recommended — eliminates ISP egress latency)*  
> **AI Service Base URL:** `https://healthmate-ai-service.onrender.com/ai/v1`  
> **Authentication:** Bearer JWT in `Authorization` header (`Bearer <token>`)  

---

## 1. Authentication & Session Endpoints (`/api/v1/auth`)

### 1.1 Register New Patient
- **Endpoint:** `POST /api/v1/auth/register`
- **Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "StrongPassword123!",
  "fullName": "Aarav Sharma",
  "phone": "+919876543210"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully. Verification OTP dispatched.",
  "data": {
    "userId": "6732d8f1e2b0a19c...",
    "email": "patient@example.com",
    "role": "patient"
  }
}
```

### 1.2 Patient Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "StrongPassword123!"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6732d8f1e2b0a19c...",
    "fullName": "Aarav Sharma",
    "email": "patient@example.com",
    "role": "patient"
  }
}
```

### 1.3 Verify Email OTP
- **Endpoint:** `POST /api/v1/auth/verify-otp`
- **Request Body:**
```json
{
  "email": "patient@example.com",
  "otp": "482910"
}
```

---

## 2. Health Records & Document Vault (`/api/v1/records`)

### 2.1 Upload Medical Document
- **Endpoint:** `POST /api/v1/records/upload`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data:**
  - `file`: Binary file (PDF, PNG, JPG)
  - `recordType`: `LAB_REPORT` | `PRESCRIPTION` | `IMAGING` | `DISCHARGE_SUMMARY`
- **Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "recordId": "6733a1f9e2b0a19c...",
    "fileName": "blood_panel_nov2026.pdf",
    "recordType": "LAB_REPORT",
    "ocrStatus": "COMPLETED",
    "biomarkers": [
      { "name": "Hemoglobin", "value": 14.2, "unit": "g/dL", "status": "NORMAL" },
      { "name": "Fasting Glucose", "value": 105.0, "unit": "mg/dL", "status": "ELEVATED" }
    ],
    "uploadedAt": "2026-11-20T10:15:00.000Z"
  }
}
```

---

## 3. Medical Imaging Diagnostics (`/api/v1/imaging`)

### 3.1 Analyze Chest Radiograph
- **Endpoint:** `POST /api/v1/imaging/chest-xray`
- **Form Data:** `image`: Binary image file (JPEG / PNG)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "engine": "alg_cxr_anatomical_screen_v1",
  "provenance": "Deterministic Morphological Screening",
  "findings": {
    "cardiothoracicRatio": 0.46,
    "cardiomegalyDetected": false,
    "thoracicDiameterPx": 840,
    "cardiacDiameterPx": 386,
    "lungFieldSymmetry": 0.94
  },
  "safetyDisclaimer": "Experimental non-diagnostic prototype. Not cleared for diagnostic interpretation. Consult a licensed radiologist."
}
```

### 3.2 Analyze Brain MRI
- **Endpoint:** `POST /api/v1/imaging/brain-mri`
- **Form Data:** `image`: Binary image file (JPEG / PNG)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "engine": "alg_mri_gradient_triage_v1",
  "findings": {
    "signalToNoiseRatio": 24.8,
    "hemisphericSymmetryScore": 0.96,
    "edgeSharpnessGradient": 142.5,
    "qualityTier": "ACCEPTABLE"
  },
  "safetyDisclaimer": "Experimental non-diagnostic triage heuristic only."
}
```

---

## 4. Digital Signal Processing — ECG (`/api/v1/imaging/ecg`)

### 4.1 Process Lead II ECG Timeseries
- **Endpoint:** `POST /api/v1/imaging/ecg-analysis`
- **Request Body:**
```json
{
  "samplingRate": 250,
  "lead": "II",
  "signal": [0.012, 0.015, -0.004, 0.450, 1.250, -0.320, ...]
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "engine": "mdl_ecg_lead12_waveform_v2",
  "rhythmMetrics": {
    "heartRateBpm": 72,
    "rrIntervalMeanMs": 833,
    "rrIntervalStdMs": 28,
    "qrsDurationMs": 88,
    "rhythmClassification": "NORMAL_SINUS_RHYTHM"
  },
  "provenance": "Pan-Tompkins DSP (PhysioNet PTB-XL validated)"
}
```

---

## 5. Doctor Discovery & Appointments (`/api/v1/doctors`, `/api/v1/appointments`)

### 5.1 Search Doctors Across 36 States
- **Endpoint:** `GET /api/v1/doctors?state=Maharashtra&specialty=Cardiology`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 14,
  "data": [
    {
      "doctorId": "DOC_MH_042",
      "fullName": "Dr. Ananya Deshmukh",
      "specialty": "Cardiology",
      "hospital": "Lilavati Hospital & Research Centre",
      "city": "Mumbai",
      "state": "Maharashtra",
      "nmcRegistration": "MCI-48192-2015",
      "consultationFee": 800
    }
  ]
}
```

### 5.2 Book Appointment
- **Endpoint:** `POST /api/v1/appointments/book`
- **Request Body:**
```json
{
  "doctorId": "DOC_MH_042",
  "date": "2026-11-25",
  "timeSlot": "10:30 AM",
  "consultationType": "VIDEO"
}
```

---

## 6. Dual-Rail Payment Subsystem (`/api/v1/payments`)

### 6.1 Create Razorpay Order
- **Endpoint:** `POST /api/v1/payments/razorpay/create-order`
- **Request Body:**
```json
{
  "appointmentId": "6734c219e2b0a19c...",
  "amount": 80000,
  "currency": "INR"
}
```

### 6.2 Verify Razorpay Signature
- **Endpoint:** `POST /api/v1/payments/razorpay/verify`
- **Request Body:**
```json
{
  "razorpay_order_id": "order_P19xKa92nd...",
  "razorpay_payment_id": "pay_P19xQb41...",
  "razorpay_signature": "4f8a92bce9..."
}
```

### 6.3 Submit Direct UPI Bank Reference (UTR)
- **Endpoint:** `POST /api/v1/payments/upi/submit-utr`
- **Request Body:**
```json
{
  "appointmentId": "6734c219e2b0a19c...",
  "utrNumber": "432109876543",
  "amount": 800
}
```

---

## 7. WebRTC Real-Time Signaling (Socket.io)

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join-consultation-room` | Client $\rightarrow$ Server | `{ roomId, patientId }` | Authenticated peer joins telehealth room |
| `webrtc-offer` | Peer A $\rightarrow$ Peer B | `{ sdp, roomId }` | Session Description Protocol (SDP) offer |
| `webrtc-answer` | Peer B $\rightarrow$ Peer A | `{ sdp, roomId }` | SDP answer to establish media transport |
| `ice-candidate` | Peer $\leftrightarrow$ Peer | `{ candidate, roomId }` | ICE candidate exchange for NAT traversal |
| `leave-consultation` | Client $\rightarrow$ Server | `{ roomId }` | Terminates media session and releases room |
