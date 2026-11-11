const { generateSecureOTP, hashOTP } = require('../security/crypto');
const { getRedisClient, getRedisStatus } = require('../config/redis');
require('../config/env');
const logger = require('../utils/logger');

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60; // 1 minute cooldown

class OTPService {
  /**
   * Internal in-memory fallback store if Redis is running in standalone mode without Redis server
   */
  constructor() {
    this.memoryStore = new Map();
  }

  isRedisConnected() {
    return getRedisStatus() === 'connected';
  }

  /**
   * Send an OTP to email or mobile
   * @param {string} target - Email address or phone number
   * @param {'EMAIL'|'MOBILE'} type 
   * @param {'VERIFICATION'|'LOGIN'|'PASSWORD_RESET'} purpose 
   */
  async sendOTP(target, type, purpose = 'VERIFICATION') {
    const normalizedTarget = target.trim().toLowerCase();
    const key = `otp:${type.toLowerCase()}:${normalizedTarget}:${purpose.toLowerCase()}`;
    const cooldownKey = `cooldown:${key}`;

    // 1. Check cooldown
    if (this.isRedisConnected()) {
      const client = getRedisClient();
      const onCooldown = await client.get(cooldownKey);
      if (onCooldown) {
        throw new Error('Please wait 60 seconds before requesting another verification code.');
      }
    } else {
      const existing = this.memoryStore.get(cooldownKey);
      if (existing && existing > Date.now()) {
        throw new Error('Please wait 60 seconds before requesting another verification code.');
      }
    }

    // 2. Generate secure 6-digit OTP
    const rawOTP = generateSecureOTP();
    const hashed = hashOTP(rawOTP);

    const record = {
      hashedOTP: hashed,
      attemptsRemaining: MAX_ATTEMPTS,
      createdAt: new Date().toISOString(),
    };

    // 3. Store in Redis or in-memory fallback
    if (this.isRedisConnected()) {
      const client = getRedisClient();
      await client.setex(key, OTP_EXPIRY_SECONDS, JSON.stringify(record));
      await client.setex(cooldownKey, RESEND_COOLDOWN_SECONDS, '1');
    } else {
      this.memoryStore.set(key, record);
      this.memoryStore.set(cooldownKey, Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
    }

    // 4. Dispatch via provider (Email SMTP / SMS API)
    await this.dispatchProvider(normalizedTarget, type, rawOTP, purpose);

    return {
      success: true,
      rawOTP,
      otp: rawOTP,
      expiresInSeconds: OTP_EXPIRY_SECONDS,
      resendCooldownSeconds: RESEND_COOLDOWN_SECONDS,
    };
  }

  /**
   * Verify an entered OTP
   * @param {string} target 
   * @param {'EMAIL'|'MOBILE'} type 
   * @param {string} enteredOTP 
   * @param {'VERIFICATION'|'LOGIN'|'PASSWORD_RESET'} purpose 
   */
  async verifyOTP(target, type, enteredOTP, purpose = 'VERIFICATION') {
    const normalizedTarget = target.trim().toLowerCase();
    const key = `otp:${type.toLowerCase()}:${normalizedTarget}:${purpose.toLowerCase()}`;

    let record = null;
    if (this.isRedisConnected()) {
      const client = getRedisClient();
      const raw = await client.get(key);
      if (raw) record = JSON.parse(raw);
    } else {
      record = this.memoryStore.get(key);
    }

    if (!record) {
      throw new Error('Verification code has expired or was not requested. Please request a new code.');
    }

    if (record.attemptsRemaining <= 0) {
      await this.invalidateOTP(key);
      throw new Error('Too many incorrect verification attempts. This code has been invalidated.');
    }

    const hashedInput = hashOTP(enteredOTP);
    if (hashedInput !== record.hashedOTP) {
      record.attemptsRemaining -= 1;
      if (this.isRedisConnected()) {
        const client = getRedisClient();
        await client.setex(key, OTP_EXPIRY_SECONDS, JSON.stringify(record));
      }
      throw new Error(`Invalid verification code. ${record.attemptsRemaining} attempt(s) remaining.`);
    }

    // Successfully verified -> invalidate code to prevent replay attacks
    await this.invalidateOTP(key);
    return true;
  }

  async invalidateOTP(key) {
    if (this.isRedisConnected()) {
      const client = getRedisClient();
      await client.del(key);
    } else {
      this.memoryStore.delete(key);
    }
  }

  /**
   * Provider Dispatch Handler
   * Connects to actual configured email or SMS provider, or logs to secure terminal in development
   */
  async dispatchProvider(target, type, rawOTP, purpose) {
    const communicationService = require('./communication.service');

    if (type === 'EMAIL') {
      try {
        await communicationService.sendEmail({
          to: target,
          subject: `HealthMate AI Verification Code: ${rawOTP}`,
          text: `Your HealthMate AI verification code is ${rawOTP}. This code will expire in 5 minutes. Do not share this code with anyone.`,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2 style="color: #0D9488;">HealthMate AI Security</h2><p>Your one-time verification code is:</p><h1 style="letter-spacing: 5px; color: #0f172a;">${rawOTP}</h1><p>Expires in 5 minutes (Maximum 3 attempts).</p></div>`
        });
      } catch (e) {
        logger.warn('Email OTP provider dispatch error:', { error: e.message });
      }

      logger.info('Email OTP verification code dispatched', {
        target: target.replace(/(?<=.{2}).(?=[^@]*?@)/g, '*'),
        type,
        purpose,
        expiryMinutes: 5,
      });
    } else if (type === 'MOBILE') {
      try {
        await communicationService.sendSMS({
          to: target,
          body: `HealthMate AI verification code: ${rawOTP}. Valid for 5 minutes.`
        });
      } catch (e) {
        logger.warn('SMS OTP provider dispatch error:', { error: e.message });
      }

      logger.info('Mobile OTP verification code dispatched', {
        target: target.slice(0, 3) + '****' + target.slice(-2),
        type,
        purpose,
        expiryMinutes: 5,
      });
    }
  }
}

module.exports = new OTPService();
