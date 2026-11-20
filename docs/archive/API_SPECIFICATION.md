# HealthMate AI - Master REST & WebSocket API Specification
**Document Version:** 1.0.0  
**Phase:** Phase 0 - Master Architecture, Requirements Analysis & Development Planning  
**Base URL (Public Gateway):** `https://api.healthmate.ai/api/v1`  
**Base URL (Internal AI Engine):** `https://ai.internal.healthmate.ai/internal/v1`  
**Authentication Scheme:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`  
**Internal Security Scheme:** `X-Internal-Service-Signature: HMAC-SHA256(<timestamp>.<body_hash>, <secret>)`  

---

## 1. Authentication & Identity Endpoints

### 1.1 User Registration (`POST /auth/register`)
- **Role:** All (PATIENT, DOCTOR)
- **Description:** Register a new user account with hashed credentials.
- **Request Body:**
```json
{
  "email": "doctor.sharma@healthmate.ai",
  "password": "SecurePassword123!",
  "role": "DOCTOR",
  "phone": "+919876543210"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email/phone OTP.",
  "data": {
    "userId": "6730ab9f1c4e7a892b10ef12",
    "email": "doctor.sharma@healthmate.ai",
    "role": "DOCTOR",
    "isVerified": false
  }
}
```

### 1.2 User Login (`POST /auth/login`)
- **Role:** All (PATIENT, DOCTOR, ADMINISTRATION)
- **Request Body:**
```json
{
  "email": "doctor.sharma@healthmate.ai",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):** Sets HTTP-only `refreshToken` cookie.
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "userId": "6730ab9f1c4e7a892b10ef12",
    "email": "doctor.sharma@healthmate.ai",
    "role": "DOCTOR",
    "verificationStatus": "CREDENTIAL_VERIFIED"
  }
}
```

### 1.3 Refresh Token Rotation (`POST /auth/refresh`)
- **Headers:** Includes HTTP-only Cookie `refreshToken=<token>`
- **Response (200 OK):** Issues fresh Access Token and rotates Refresh Token.

---

## 2. Ephemeral Patient & AI Health Copilot Endpoints

### 2.1 Initialize Guest Session (`POST /patient/session/init`)
- **Role:** Unauthenticated Guest / Patient
- **Description:** Allocates an ephemeral session in Redis with 60-minute TTL.
- **Response (200 OK):**
```json
{
  "sessionId": "sess_e98f7c10b4a84f329d28",
  "ttlSeconds": 3600,
  "expiresAt": "2026-11-10T16:32:00.000Z"
}
```

### 2.2 Ephemeral Symptom Check & Triage (`POST /patient/symptom-check`)
- **Headers:** `X-Session-ID: sess_e98f7c10b4a84f329d28`
- **Request Body:**
```json
{
  "age": 34,
  "gender": "male",
  "symptoms": ["chest discomfort", "shortness of breath on exertion"],
  "duration": "3 days",
  "severity": "moderate",
  "vitals": {
    "bloodPressure": "135/88",
    "heartRate": 92,
    "spO2": 96
  },
  "language": "en"
}
```
- **Response (200 OK):**
```json
{
  "triageLevel": "URGENT_ATTENTION",
  "recommendedSpecialist": "Cardiology",
  "confidenceScore": 0.88,
  "shapFeatureAttribution": [
    { "feature": "chest discomfort", "importance": 0.42 },
    { "feature": "shortness of breath", "importance": 0.31 },
    { "feature": "systolic BP > 130", "importance": 0.15 }
  ],
  "medicalDisclaimer": "This is an AI-generated risk assessment, not a clinical diagnosis. Please consult a qualified cardiologist.",
  "ephemeralStorage": "REDIS_ACTIVE_TTL_3600S"
}
```

### 2.3 Medical Report Upload & Ephemeral OCR (`POST /patient/reports/ocr-extract`)
- **Role:** PATIENT / Guest
- **Content-Type:** `multipart/form-data`
- **Payload:** File (PDF / PNG / JPEG)
- **Response (200 OK):**
```json
{
  "reportType": "Complete Blood Count (CBC)",
  "extractedBiomarkers": [
    { "testName": "Hemoglobin", "observedValue": 10.8, "unit": "g/dL", "referenceRange": "13.0 - 17.0", "flag": "LOW" },
    { "testName": "WBC Count", "observedValue": 7200, "unit": "/mcL", "referenceRange": "4000 - 11000", "flag": "NORMAL" }
  ],
  "temporaryFileExpiresIn": "1800s"
}
```

### 2.4 Immediate Session Deletion (`DELETE /patient/session/:sessionId`)
- **Role:** PATIENT / Guest
- **Description:** Zero-trust instant purge of all Redis keys linked to this session.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "All ephemeral records, conversation tokens, and uploaded report artifacts have been permanently deleted."
}
```

---

## 3. Discovery Pipeline Endpoints (Doctors & Facilities)

### 3.1 Search Nearby Facilities & Doctors (`GET /discovery/nearby`)
- **Parameters:** `lat`, `lng`, `radius` (meters, max 25000), `type` (hospital | clinic | doctor | pharmacy)
- **Response (200 OK):**
```json
{
  "resultsCount": 3,
  "facilities": [
    {
      "id": "fac_6730ab9f1c4e7a892b10",
      "name": "Apollo Clinic Indiranagar",
      "facilityType": "CLINIC",
      "statusTier": "SOURCE_VERIFIED",
      "distanceMeters": 850,
      "address": "100 Feet Road, Indiranagar, Bengaluru",
      "location": { "lat": 12.9716, "lng": 77.6412 },
      "departments": ["General Medicine", "Cardiology", "Diagnostics"]
    }
  ]
}
```

### 3.2 India-Wide Filtered Discovery (`GET /discovery/search`)
- **Parameters:** `state`, `city`, `specialization`, `pincode`, `keyword`, `verificationStatus`
- **Response (200 OK):** List of verified medical professionals and accredited hospitals.

---

## 4. Teleconsultation & Appointment Endpoints

### 4.1 Book Appointment (`POST /appointments/book`)
- **Role:** PATIENT (Authenticated)
- **Request Body:**
```json
{
  "doctorId": "6730ab9f1c4e7a892b10ef12",
  "scheduledAt": "2026-11-12T10:30:00.000Z",
  "consultationType": "VIDEO",
  "consentToShareVitals": true
}
```
- **Response (201 Created):**
```json
{
  "appointmentId": "apt_89123891023",
  "status": "CONFIRMED",
  "consultationFee": 700,
  "paymentUrl": "https://api.razorpay.com/v1/checkout/...",
  "teleconsultationRoomId": "room_a8f9b201-92cd-41e9-9a28-128a3014cfa8"
}
```

### 4.2 Doctor Prescription Generation (`POST /doctor/prescriptions/generate`)
- **Role:** DOCTOR (Must be `CREDENTIAL_VERIFIED`)
- **Request Body:** Contains diagnosis, prescription drugs, dosage, instructions, follow-up date, and digital signature hash.
- **Response (201 Created):** Digitally signed immutable prescription object.

---

## 5. Administration & Governance Endpoints

### 5.1 Doctor Verification Review (`POST /admin/doctors/:doctorId/verify`)
- **Role:** ADMINISTRATION
- **Request Body:**
```json
{
  "decision": "APPROVED", // APPROVED | REJECTED | SUSPENDED
  "nmcVerificationNotes": "Registration verified against State Medical Council Portal on 2026-11-10",
  "statusTier": "CREDENTIAL_VERIFIED"
}
```

### 5.2 Model Registry Telemetry (`GET /admin/mlops/metrics`)
- **Role:** ADMINISTRATION
- **Response (200 OK):** Model evaluation accuracy, inference latency, drift statistics, and active weights version.

---

## 6. Socket.IO Real-Time & WebRTC Signaling Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client -> Server | `{ roomId, token, userRole }` | Authenticated client connects to appointment room |
| `webrtc-offer` | Client -> Server -> Peer | `{ sdp, roomId }` | WebRTC Session Description Protocol offer |
| `webrtc-answer` | Client -> Server -> Peer | `{ sdp, roomId }` | WebRTC SDP answer |
| `ice-candidate`| Client -> Server -> Peer | `{ candidate, roomId }` | ICE network connectivity candidate exchange |
| `emergency-sos`| Patient -> Server -> Admin | `{ patientLocation, vitals }` | Real-time emergency trigger |
