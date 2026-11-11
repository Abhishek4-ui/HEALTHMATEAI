const request = require('supertest');
const app = require('../../src/app');
const { generateAccessToken } = require('../../src/security/jwt');

describe('HealthMate AI API Integration & Security Test Suite', () => {
  describe('System Health & Documentation Endpoints', () => {
    it('GET /health - should return 200 with healthy status and exactly 3 allowed roles', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.infrastructure.allowedRoles).toEqual(['PATIENT', 'DOCTOR', 'ADMINISTRATION']);
      expect(res.body.infrastructure.ephemeralDefault).toBe(true);
    });

    it('GET /api-docs/ - should serve Swagger documentation UI', async () => {
      const res = await request(app).get('/api-docs/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Swagger UI');
    });

    it('GET / - should return root API gateway description', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('HealthMate AI Core Backend API Gateway');
      expect(res.body.allowedRoles).toHaveLength(3);
    });
  });

  describe('Authentication Input Validation & Security', () => {
    it('POST /api/v1/auth/register - should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
          fullName: 'Test User',
          role: 'PATIENT',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('POST /api/v1/auth/register - should reject registration with short password (< 8 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'valid@healthmate.ai',
          password: 'short',
          fullName: 'Test User',
          role: 'PATIENT',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 8 characters long');
    });

    it('POST /api/v1/auth/register - should reject public registration for ADMINISTRATION role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'admin.infiltrate@healthmate.ai',
          password: 'AdminPassword123!',
          fullName: 'Fake Admin',
          role: 'ADMINISTRATION',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Administration accounts cannot be registered publicly');
    });
  });

  describe('Role-Based Access Control (RBAC) Enforcement', () => {
    it('GET /api/v1/patient/profile - should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/patient/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/patient/profile - should reject Doctor access with 403 Forbidden', async () => {
      const doctorToken = generateAccessToken({
        id: 'usr_doc_test',
        email: 'doctor@healthmate.ai',
        role: 'DOCTOR',
        fullName: 'Dr. Test',
      });

      const res = await request(app)
        .get('/api/v1/patient/profile')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('FORBIDDEN_ROLE');
    });

    it('GET /api/v1/admin/overview - should reject Patient access with 403 Forbidden', async () => {
      const patientToken = generateAccessToken({
        id: 'usr_pat_test',
        email: 'patient@healthmate.ai',
        role: 'PATIENT',
        fullName: 'Patient Test',
      });

      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('FORBIDDEN_ROLE');
    });

    it('GET /api/v1/doctor/profile - should reject Patient access with 403 Forbidden', async () => {
      const patientToken = generateAccessToken({
        id: 'usr_pat_test',
        email: 'patient@healthmate.ai',
        role: 'PATIENT',
        fullName: 'Patient Test',
      });

      const res = await request(app)
        .get('/api/v1/doctor/profile')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('FORBIDDEN_ROLE');
    });
  });

  describe('Public Discovery & Healthcare Directory Endpoints', () => {
    it('GET /api/v1/doctor/discovery - should return 200 with doctor listing structure', async () => {
      const res = await request(app).get('/api/v1/doctor/discovery');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.doctors)).toBe(true);
    });

    it('GET /api/v1/hospitals - should return 200 with hospital listing structure', async () => {
      const res = await request(app).get('/api/v1/hospitals');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.hospitals)).toBe(true);
    });

    it('GET /api/v1/patient/session - should accept guest session header and return 200', async () => {
      const res = await request(app)
        .get('/api/v1/patient/session')
        .set('X-Session-ID', 'guest_test_abc123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/v1/patient/forget-me - should execute DPDP purge for guest session', async () => {
      const res = await request(app)
        .delete('/api/v1/patient/forget-me')
        .set('X-Session-ID', 'guest_test_abc123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('permanently purged');
    });
  });

  describe('404 Unknown Route Handling', () => {
    it('GET /api/v1/unknown-endpoint - should return clean 404 error payload', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('NOT_FOUND');
    });
  });
});
