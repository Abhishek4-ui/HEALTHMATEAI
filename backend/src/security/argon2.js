const argon2 = require('argon2');

/**
 * Hash a plain-text password using Argon2id with memory-hard parameters
 * @param {string} password 
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
};

/**
 * Verify a plain-text password against an Argon2id hash
 * @param {string} hash 
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (hash, password) => {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    return false;
  }
};

module.exports = { hashPassword, verifyPassword };
