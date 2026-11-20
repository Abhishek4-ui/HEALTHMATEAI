# HEALTHMATE AI — AUTHENTICATION TEST REPORT
**Automated RBAC, Route Guard & JWT Security Test Results**
**Date:** November 11, 2026 | **Classification:** Test Verification & Security Audit

---

## 1. Test Suite Summary
- **Test Runner:** Jest (Node.js) & React Testing Framework
- **Test Target:** Authentication routes, RBAC middleware, token validation, and route guards.
- **Total Tests Executed:** 16 tests
- **Pass Rate:** $100\%$ (16/16 Passed)

---

## 2. Test Execution Details

| Test Case | Method / Route | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-AUTH-01 | `POST /api/v1/auth/register` (Patient) | Returns 201 with token & user record | 201 Created | **PASS** |
| TC-AUTH-02 | `POST /api/v1/auth/login` (Patient) | Returns 200 with JWT access token | 200 OK | **PASS** |
| TC-AUTH-03 | `GET /api/v1/patient/profile` (No Token) | Returns 401 Unauthorized | 401 Unauthorized | **PASS** |
| TC-AUTH-04 | `GET /api/v1/patient/profile` (Doctor Token) | Returns 403 Forbidden (Role mismatch) | 403 Forbidden | **PASS** |
| TC-AUTH-05 | `GET /api/v1/admin/overview` (Patient Token) | Returns 403 Forbidden | 403 Forbidden | **PASS** |
| TC-AUTH-06 | `GET /api/v1/admin/overview` (Admin Token) | Returns 200 with platform metrics | 200 OK | **PASS** |
| TC-AUTH-07 | Client `/patient/dashboard` (Unauthenticated) | Redirects to `/login?role=PATIENT` | Redirected | **PASS** |
| TC-AUTH-08 | Client `/doctor/dashboard` (Unauthenticated) | Redirects to `/login?role=DOCTOR` | Redirected | **PASS** |
| TC-AUTH-09 | Client `/admin/dashboard` (Unauthenticated) | Redirects to `/login?role=ADMINISTRATION` | Redirected | **PASS** |
| TC-AUTH-10 | Password Strength Validation | Rejects weak passwords (<8 chars, no symbol) | 400 Bad Request | **PASS** |
| TC-AUTH-11 | Expired Token Handling | Rejects expired JWT with 401 | 401 Unauthorized | **PASS** |
| TC-AUTH-12 | Admin Registration Guard | Rejects public POST to `/register` with Admin role | 403 Forbidden | **PASS** |
