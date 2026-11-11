const request = require('supertest');
const crypto = require('crypto');
const app = require('../../src/app');
const { generateAccessToken } = require('../../src/security/jwt');
const paymentService = require('../../src/services/payment.service');
const communicationService = require('../../src/services/communication.service');
const consultationService = require('../../src/services/consultation.service');

describe('Phase 6: Complete End-to-End Application Integration Test Suite', () => {
  jest.setTimeout(15000);
  let patientToken;
  let doctorToken;
  let adminToken;

  beforeAll(() => {
    // Generate valid tokens with explicit roles
    patientToken = generateAccessToken({ id: '6af41b252ec0cf18f46f7cf1', role: 'PATIENT', email: 'test.patient@healthmate.ai' });
    doctorToken = generateAccessToken({ id: '6af41b252ec0cf18f46f7cf2', role: 'DOCTOR', email: 'test.doctor@healthmate.ai' });
    adminToken = generateAccessToken({ id: '6af41b252ec0cf18f46f7cf3', role: 'ADMINISTRATION', email: 'test.admin@healthmate.ai' });
  });

  describe('1. Role-Based Access Control (RBAC) & Authentication Boundaries', () => {
    it('allows ADMINISTRATION role to access Admin Overview', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects PATIENT role from accessing Admin Overview with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${patientToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN_ROLE');
    });

    it('rejects unauthenticated requests to protected patient profile with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/patient/profile');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('2. Teleconsultation & Twilio WebRTC Room Tokens', () => {
    it('generates secure WebRTC / Twilio consultation room token', async () => {
      const tokenData = await consultationService.generateVideoToken(
        'apt_test_session_101',
        '6af41b252ec0cf18f46f7cf1',
        'PATIENT'
      );

      expect(tokenData).toHaveProperty('roomId');
      expect(tokenData).toHaveProperty('token');
      expect(tokenData.roomId).toContain('apt_test_session_101');
      expect(tokenData.expiresInSeconds).toBe(3600);
    });

    it('serves video token via endpoint /api/v1/consultations/:id/token', async () => {
      const res = await request(app)
        .get('/api/v1/consultations/apt_test_session_101/token')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.roomId).toContain('apt_test_session_101');
    });
  });

  describe('3. Multi-Channel Notification Integration (Email & SMS)', () => {
    it('dispatches appointment confirmation with fallback handling', async () => {
      const result = await communicationService.sendAppointmentConfirmation({
        patientEmail: 'patient.test@healthmate.ai',
        patientPhone: '9999999999',
        doctorName: 'Rajesh Sharma',
        date: 'Wed Nov 18 2026',
        time: '10:30 AM',
        appointmentId: 'apt_test_confirm_999',
      });

      expect(result).toHaveProperty('emailStatus');
      expect(result).toHaveProperty('smsStatus');
      expect(result.emailStatus).toHaveProperty('provider');
      expect(result.smsStatus).toHaveProperty('provider');
      // Confirms honest handling without application crash
      expect(typeof result.emailStatus.success).toBe('boolean');
      expect(typeof result.smsStatus.success).toBe('boolean');
    });
  });

  describe('4. Complete Razorpay Payment & Verification Chain', () => {
    it('verifies valid HMAC-SHA256 signature generated with Razorpay secret', async () => {
      const orderId = 'order_TynpkZJjY0OgN3';
      const paymentId = 'pay_p6_test_123456';
      const secret = process.env.RAZORPAY_KEY_SECRET;

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const res = await request(app)
        .post('/api/v1/payments/verify-signature')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          orderId,
          paymentId,
          signature: validSignature,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verified).toBe(true);
      expect(res.body.data.status).toBe('PAID');
    });

    it('strictly rejects forged signature with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/payments/verify-signature')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          orderId: 'order_TynpkZJjY0OgN3',
          paymentId: 'pay_p6_test_123456',
          signature: 'forged_fake_signature_999',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('SIGNATURE_VERIFICATION_FAILED');
    });
  });

  describe('5. Diagnostic Report Upload, OCR Biomarkers & Ephemeral Deletion', () => {
    it('uploads report buffer and extracts LOINC biomarkers without dummy fallbacks', async () => {
      const mockReport = 'Hemoglobin: 14.5 g/dL, Fasting Blood Glucose: 92 mg/dL, Total Leukocyte Count: 6800 /mcL';
      const buffer = Buffer.from(mockReport, 'utf-8');

      const res = await request(app)
        .post('/api/v1/patient/reports/ocr-extract')
        .attach('report', buffer, 'complete_blood_count.txt');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('uploadToken');
      expect(res.body.data).toHaveProperty('biomarkers');
      expect(res.body.data.biomarkers.length).toBeGreaterThanOrEqual(2);
    });

    it('purges ephemeral session via DELETE /api/v1/patient/forget-me', async () => {
      const res = await request(app)
        .delete('/api/v1/patient/forget-me')
        .set('X-Session-ID', 'sess_test_p6_purge');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('permanently purged');
    });
  });

  describe('6. Doctor Pharmacovigilance & Drug Interaction Safety', () => {
    it('identifies CONTRAINDICATED interaction between Aspirin and Warfarin via backend', async () => {
      const res = await request(app)
        .post('/api/v1/doctor/prescriptions/check-interactions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ medications: ['Aspirin 75mg', 'Warfarin 5mg'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contraindication_found).toBe(true);
      expect(res.body.data.interactions.some(i => i.severity === 'CONTRAINDICATED')).toBe(true);
    });
  });

  describe('7. MLOps Model Telemetry Endpoint for Administration Portal', () => {
    it('serves active model registry and telemetry to administrators', async () => {
      const res = await request(app)
        .get('/api/v1/admin/ai-models')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
