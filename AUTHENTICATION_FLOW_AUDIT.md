# HEALTHMATE AI — AUTHENTICATION FLOW AUDIT
**Role-Based Access Control, Session Lifecycle & Route Guard Audit**
**Date:** November 11, 2026 | **Classification:** Security Engineering Report

---

## 1. Authentication Architecture

HealthMate AI enforces a 3-tier Role-Based Access Control (RBAC) architecture separating user domains:
1. `PATIENT` (Consumers, Caregivers)
2. `DOCTOR` (Registered Medical Practitioners, NMC-Verified)
3. `ADMINISTRATION` (Enterprise Health Officers, System Operators)

```mermaid
sequenceDiagram
  autonumber
  actor User as User / Client
  participant Client as React Router / ProtectedRoute
  participant API as Express Auth Gateway
  participant Mongo as MongoDB Atlas
  participant Redis as Redis Session Store

  User->>Client: Enters Protected URL (e.g. /patient/dashboard)
  Client->>Client: Check user state & role
  alt Unauthenticated or Wrong Role
    Client-->>User: Redirect to /login?role=ROLE
  else Authenticated & Authorized Role
    Client->>API: HTTP Request with Bearer JWT
    API->>API: Verify Signature & Expiration (auth.middleware)
    API->>API: Verify Role Permission (role.middleware)
    alt Valid Token & Role
      API->>Redis: Hydrate Ephemeral State
      API-->>Client: 200 OK + Payload
      Client-->>User: Render Dashboard
    else Invalid / Expired Token
      API-->>Client: 401 Unauthorized / 403 Forbidden
      Client-->>User: Clear Session & Force Relogin
    end
  end
```

---

## 2. Route Protection Audit
- **Frontend Guard (`frontend/src/components/auth/ProtectedRoute.jsx`):**
  - Reads `user` and `token` from `AuthContext`.
  - Checks if role matches `allowedRole`.
  - Redirects unauthenticated requests to `/login?role=${allowedRole}`.
  - Redirects mismatched roles to the user's canonical portal.
- **Top-Level Navigation Doors:**
  - Hero action buttons on `HomePage.jsx` route directly to `/login?role=PATIENT`, `/login?role=DOCTOR`, and `/login?role=ADMINISTRATION`.
  - Admin login hides public registration to prevent unauthorized privilege escalation.

---

## 3. JWT & Session Security Audit
1. **Token Lifetime:** Access tokens configured for 1-hour expiration; Refresh tokens managed with secure HTTP-only cookies where applicable.
2. **Signature Verification:** HMAC SHA-256 (`HS256`) signed with strong secret `JWT_SECRET`.
3. **Session Purge:** Logout invalidates both client memory storage and ephemeral Redis cache sessions.
