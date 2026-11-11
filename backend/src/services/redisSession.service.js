const { getRedisClient, getRedisStatus } = require('../config/redis');
const logger = require('../utils/logger');

// Standard TTLs in seconds
const DEFAULT_SESSION_TTL = 3600; // 1 hour
const REPORT_TOKEN_TTL = 1800; // 30 mins
const RISK_ASSESSMENT_TTL = 3600; // 1 hour

/**
 * Service managing ephemeral Redis sessions for zero-trust patient privacy
 */
class RedisSessionService {
  /**
   * Check if Redis is operational
   */
  isAvailable() {
    return getRedisStatus() === 'connected';
  }

  /**
   * Save or update an ephemeral patient session
   * @param {string} sessionId 
   * @param {object} sessionData 
   * @param {number} ttlSeconds 
   */
  async setSession(sessionId, sessionData, ttlSeconds = DEFAULT_SESSION_TTL) {
    if (!this.isAvailable()) {
      logger.warn('Redis unavailable: Cannot persist ephemeral session to memory.', { sessionId });
      throw new Error('Ephemeral memory storage service is temporarily unreachable. Temporary health data is never saved to database.');
    }

    const client = getRedisClient();
    const key = `session:guest:${sessionId}`;
    const payload = JSON.stringify({
      ...sessionData,
      updatedAt: new Date().toISOString(),
    });

    await client.setex(key, ttlSeconds, payload);
    return { sessionId, ttlSeconds };
  }

  /**
   * Retrieve active ephemeral session
   * @param {string} sessionId 
   */
  async getSession(sessionId) {
    if (!this.isAvailable()) {
      return null;
    }

    const client = getRedisClient();
    const key = `session:guest:${sessionId}`;
    const raw = await client.get(key);

    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Store temporary AI chat dialogue in ephemeral memory
   * @param {string} sessionId 
   * @param {object} message 
   */
  async appendChatMessage(sessionId, message) {
    const session = (await this.getSession(sessionId)) || { chatHistory: [] };
    if (!session.chatHistory) session.chatHistory = [];

    session.chatHistory.push({
      ...message,
      timestamp: new Date().toISOString(),
    });

    // Keep up to 50 dialogue turns per session
    if (session.chatHistory.length > 50) {
      session.chatHistory.shift();
    }

    await this.setSession(sessionId, session);
    return session.chatHistory;
  }

  /**
   * Store temporary symptom checker results
   * @param {string} sessionId 
   * @param {object} assessmentData 
   */
  async setSymptomAssessment(sessionId, assessmentData) {
    const session = (await this.getSession(sessionId)) || {};
    session.symptomAssessment = {
      ...assessmentData,
      evaluatedAt: new Date().toISOString(),
    };
    await this.setSession(sessionId, session);
    return session.symptomAssessment;
  }

  /**
   * Store temporary health risk assessment results
   * @param {string} sessionId 
   * @param {object} riskData 
   */
  async setRiskAssessment(sessionId, riskData) {
    const session = (await this.getSession(sessionId)) || {};
    session.healthRiskAssessment = {
      ...riskData,
      assessedAt: new Date().toISOString(),
    };
    await this.setSession(sessionId, session);
    return session.healthRiskAssessment;
  }

  /**
   * Store temporary report OCR extraction results
   * @param {string} uploadToken 
   * @param {object} extractedData 
   */
  async setReportExtraction(uploadToken, extractedData) {
    if (!this.isAvailable()) {
      throw new Error('Redis ephemeral storage unavailable for OCR results.');
    }

    const client = getRedisClient();
    const key = `session:ocr:${uploadToken}`;
    await client.setex(key, REPORT_TOKEN_TTL, JSON.stringify(extractedData));
    return { uploadToken, ttlSeconds: REPORT_TOKEN_TTL };
  }

  /**
   * Retrieve report extraction by upload token
   * @param {string} uploadToken 
   */
  async getReportExtraction(uploadToken) {
    if (!this.isAvailable()) return null;
    const client = getRedisClient();
    const raw = await client.get(`session:ocr:${uploadToken}`);
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Execute immediate "Forget Me" purge:
   * Wipes all active patient temporary sessions, chat logs, symptom evaluations, and OCR tokens
   * @param {string} sessionId 
   * @returns {boolean}
   */
  async purgeSession(sessionId) {
    if (!this.isAvailable()) {
      logger.warn('Redis unavailable during Forget Me purge request.', { sessionId });
      return false;
    }

    const client = getRedisClient();
    const keys = [
      `session:guest:${sessionId}`,
      `session:ocr:${sessionId}`,
      `session:risk:${sessionId}`,
    ];

    await client.del(...keys);
    logger.info('Ephemeral patient health session purged under DPDP Right to be Forgotten.', { sessionId });
    return true;
  }
}

module.exports = new RedisSessionService();
