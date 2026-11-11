const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

/**
 * Generate a short-lived access token (15 mins)
 * @param {object} payload - { id, email, role, fullName }
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id || payload._id,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn || '15m' }
  );
};

/**
 * Generate a long-lived cryptographically secure refresh token (7 days)
 * @returns {{ token: string, tokenHash: string, expiresAt: Date }}
 */
const generateRefreshToken = () => {
  const token = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return { token, tokenHash, expiresAt };
};

/**
 * Hash a plain refresh token to compare with database hash
 * @param {string} token 
 * @returns {string}
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify an access token
 * @param {string} token 
 * @returns {object|null}
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
};
