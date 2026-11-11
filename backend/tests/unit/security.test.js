const { hashPassword, verifyPassword } = require('../../src/security/argon2');
const { generateAccessToken, generateRefreshToken, hashToken, verifyAccessToken } = require('../../src/security/jwt');
const { generateSecureOTP, hashOTP, generatePrescriptionSignatureHash, verifyHmacSignature } = require('../../src/security/crypto');
const { redactSensitiveData } = require('../../src/security/redact');
const { cleanObject } = require('../../src/security/sanitize');

describe('Security & Cryptography Unit Test Suite', () => {
  describe('Argon2id Password Hashing', () => {
    it('should hash password with Argon2id and verify successfully', async () => {
      const rawPassword = 'ClinicalSecurePassword@2026';
      const hash = await hashPassword(rawPassword);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await verifyPassword(hash, rawPassword);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword(hash, 'WrongPassword123');
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT Access & Refresh Token System', () => {
    it('should issue valid short-lived JWT access token', () => {
      const user = { id: 'usr_patient_123', email: 'patient@healthmate.ai', role: 'PATIENT', fullName: 'Patient Test' };
      const token = generateAccessToken(user);

      expect(typeof token).toBe('string');
      const decoded = verifyAccessToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe('PATIENT');
    });

    it('should issue secure refresh token with SHA-256 hash', () => {
      const { token, tokenHash, expiresAt } = generateRefreshToken();
      expect(token).toBeDefined();
      expect(tokenHash).toBeDefined();
      expect(hashToken(token)).toBe(tokenHash);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Cryptographic OTP Generation & Verification', () => {
    it('should generate a 6-digit numeric OTP and match SHA-256 hash', () => {
      const otp = generateSecureOTP();
      expect(otp).toHaveLength(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
      expect(Number(otp)).toBeLessThanOrEqual(999999);

      const hash1 = hashOTP(otp);
      const hash2 = hashOTP(otp);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it('should verify HMAC SHA256 webhook signatures', () => {
      const secret = 'webhook_secret_key_123';
      const body = JSON.stringify({ event: 'payment.captured' });
      const crypto = require('crypto');
      const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

      const isValid = verifyHmacSignature(body, signature, secret);
      expect(isValid).toBe(true);

      const isInvalid = verifyHmacSignature(body, 'tampered_signature', secret);
      expect(isInvalid).toBe(false);
    });

    it('should generate tamper-evident prescription signature hashes', () => {
      const payload = {
        appointmentId: 'apt_123',
        patientId: 'pat_456',
        medications: [{ medicineName: 'Metformin', dosage: '500mg' }],
        diagnosis: [{ description: 'Type 2 Diabetes' }],
      };
      const nmcNumber = 'KMC/2018/98712';

      const sig1 = generatePrescriptionSignatureHash(payload, nmcNumber);
      expect(sig1.startsWith('0x')).toBe(true);
      expect(sig1).toHaveLength(66); // 0x + 64 hex chars
    });
  });

  describe('Sensitive Data Redaction in Logging', () => {
    it('should redact medical symptoms, passwords, and OTPs from log payloads', () => {
      const payload = {
        email: 'patient@healthmate.ai',
        password: 'SuperSecretPassword',
        otp: '123456',
        chiefComplaint: 'Severe retrosternal chest pain radiating to left shoulder',
        vitals: { heartRate: 98 },
      };

      const redacted = redactSensitiveData(payload);
      expect(redacted.email).toBe('patient@healthmate.ai');
      expect(redacted.password).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(redacted.otp).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(redacted.chiefComplaint).toBe('[REDACTED_SENSITIVE_DATA]');
      expect(redacted.vitals.heartRate).toBe(98);
    });
  });

  describe('NoSQL Injection Sanitization', () => {
    it('should strip operator injection attacks ($gt, $where) from request payload', () => {
      const maliciousPayload = {
        username: 'admin',
        password: { $gt: '' },
        $where: 'sleep(5000)',
        nested: {
          $ne: null,
          validKey: 'validValue',
        },
      };

      const cleaned = cleanObject(maliciousPayload);
      expect(cleaned.username).toBe('admin');
      expect(cleaned.password).toEqual({});
      expect(cleaned.$where).toBeUndefined();
      expect(cleaned.nested.$ne).toBeUndefined();
      expect(cleaned.nested.validKey).toBe('validValue');
    });
  });
});
