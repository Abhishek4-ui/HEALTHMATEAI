# HealthMate AI — REST API Documentation

**Base URL:** `http://localhost:5001/api/v1`  
**Interactive Swagger UI:** `http://localhost:5001/api-docs`  
**Authentication:** Header `Authorization: Bearer <access_token>` or `X-Session-ID: <session_id>`

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Register a new Patient or Doctor.
- **Request:**
  ```json
  {
    "email": "patient@healthmate.ai",
    "password": "SecurePassword123!",
    "fullName": "Aarav Sharma",
    "role": "PATIENT"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful. Verification code dispatched.",
    "data": { "id": "6732...", "email": "patient@healthmate.ai", "role": "PATIENT" }
  }
  ```

### `POST /auth/login`
Authenticate with email and password.
- **Request:**
  ```json
  {
    "email": "patient@healthmate.ai",
    "password": "SecurePassword123!",
    "role": "PATIENT"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbG...",
      "refreshToken": "4a71...",
      "user": { "id": "6732...", "email": "patient@healthmate.ai", "role": "PATIENT" }
    }
  }
  ```

### `POST /auth/otp/send` & `POST /auth/otp/verify`
Dispatch and verify a cryptographically secure 6-digit verification code.

---

## 2. Patient Endpoints (`/patient`)

### `GET /patient/profile` (Protected - PATIENT)
Retrieve current patient's clinical and personal profile.

### `DELETE /patient/forget-me` (Public / Patient)
Executes instant purge of all ephemeral memory in Redis under DPDP Act 2023.

---

## 3. Doctor Endpoints (`/doctor`)

### `GET /doctor/discovery` (Public)
Search certified medical practitioners across India.
- **Query Parameters:** `city`, `state`, `specialization`, `search`, `page`, `limit`.

### `PUT /doctor/availability` (Protected - DOCTOR)
Set weekly consultation hours and slot durations.

---

## 4. Hospital & Facility Endpoints (`/hospitals`)

### `GET /hospitals` (Public)
Search clinics, diagnostic labs, and hospitals across India.

### `GET /hospitals/nearby` (Public)
Geo-spatial discovery using latitude and longitude coordinates.

---

## 5. Appointment Endpoints (`/appointments`)

### `POST /appointments` (Protected - PATIENT)
Create a new teleconsultation booking with slot collision prevention.

---

## 6. Prescription Endpoints (`/prescriptions`)

### `POST /prescriptions` (Protected - DOCTOR)
Generate and digitally seal a clinical prescription with SHA-256 hash.

### `GET /prescriptions/:id/verify` (Public)
Verify digital signature integrity against doctor NMC registration number.

---

## 7. Administration Endpoints (`/admin`)

### `GET /admin/overview` (Protected - ADMINISTRATION)
System telemetry, doctor verification counts, and service status.

### `POST /admin/doctor-verifications/:id/decision` (Protected - ADMINISTRATION)
Approve or reject doctor medical council registration documents.
