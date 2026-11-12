const otpService = require('../../src/services/otp.service');
const communicationService = require('../../src/services/communication.service');

describe('OTP Security Hardening & Lifecycle Verification', () => {
  const testEmail = 'abhishekgga140@gmail.com';
  const testType = 'EMAIL';
  const testPurpose = 'VERIFICATION';

  beforeAll(() => {
    // Mock external network transmission to isolate cryptographic & lifecycle logic
    jest.spyOn(communicationService, 'sendEmail').mockResolvedValue({
      success: true,
      provider: 'smtp',
      messageId: 'mock-unit-test-id'
    });
    jest.spyOn(communicationService, 'sendSMS').mockResolvedValue({
      success: true,
      provider: 'mock-sms',
      sid: 'mock-sid'
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    // Clear keys before each test
    const key = `otp:${testType.toLowerCase()}:${testEmail.toLowerCase()}:${testPurpose.toLowerCase()}`;
    await otpService.invalidateOTP(key);
    await otpService.invalidateOTP(`cooldown:${key}`);
  });

  test('SEC-OTP-001: Disallow OTP value in production mode response', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const result = await otpService.sendOTP(testEmail, testType, testPurpose);
      expect(result.success).toBe(true);
      expect(result.rawOTP).toBeUndefined();
      expect(result.otp).toBeUndefined();
      expect(result.expiresInSeconds).toBe(300);
      expect(result.resendCooldownSeconds).toBe(30);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test('SEC-OTP-002: Expose rawOTP strictly under test environment for test runner assertions', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'test';
      const result = await otpService.sendOTP(testEmail, testType, testPurpose);
      expect(result.success).toBe(true);
      expect(result.rawOTP).toBeDefined();
      expect(/^\d{6}$/.test(result.rawOTP)).toBe(true);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test('SEC-OTP-003: Single-use enforcement & replay attack rejection', async () => {
    const result = await otpService.sendOTP(testEmail, testType, testPurpose);
    const validOTP = result.rawOTP;

    // First verification MUST succeed
    const verifiedFirst = await otpService.verifyOTP(testEmail, testType, validOTP, testPurpose);
    expect(verifiedFirst).toBe(true);

    // Immediate replay attempt MUST be rejected
    await expect(
      otpService.verifyOTP(testEmail, testType, validOTP, testPurpose)
    ).rejects.toThrow(/expired or was not requested/i);
  });

  test('SEC-OTP-004: Incorrect code rejection and attempts decrementing', async () => {
    const result = await otpService.sendOTP(testEmail, testType, testPurpose);
    const validOTP = result.rawOTP;
    const invalidOTP = validOTP === '123456' ? '654321' : '123456';

    // First bad attempt -> 2 remaining
    await expect(
      otpService.verifyOTP(testEmail, testType, invalidOTP, testPurpose)
    ).rejects.toThrow(/2 attempt\(s\) remaining/i);

    // Second bad attempt -> 1 remaining
    await expect(
      otpService.verifyOTP(testEmail, testType, invalidOTP, testPurpose)
    ).rejects.toThrow(/1 attempt\(s\) remaining/i);

    // Third bad attempt -> 0 remaining, invalidates
    await expect(
      otpService.verifyOTP(testEmail, testType, invalidOTP, testPurpose)
    ).rejects.toThrow(/0 attempt\(s\) remaining/i);

    // Fourth attempt -> code has been wiped due to too many attempts
    await expect(
      otpService.verifyOTP(testEmail, testType, validOTP, testPurpose)
    ).rejects.toThrow(/too many incorrect verification attempts|has expired/i);
  });

  test('SEC-OTP-005: Resend rate limiting and cooldown enforcement', async () => {
    // First dispatch succeeds
    const firstDispatch = await otpService.sendOTP(testEmail, testType, testPurpose);
    expect(firstDispatch.success).toBe(true);

    // Immediate second dispatch within cooldown MUST throw 60-second notice
    await expect(
      otpService.sendOTP(testEmail, testType, testPurpose)
    ).rejects.toThrow(/Please wait/i);
  });

  test('SEC-OTP-006: Expiration handling for non-existent or expired code', async () => {
    await expect(
      otpService.verifyOTP('nonexistent@healthmate.ai', testType, '999999', testPurpose)
    ).rejects.toThrow(/expired or was not requested/i);
  });
});
