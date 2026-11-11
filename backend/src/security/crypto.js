const crypto = require('crypto');

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 * @returns {string} 6-digit numeric string
 */
const generateSecureOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash an OTP with SHA-256 for secure storage at rest in Redis
 * @param {string} otp 
 * @returns {string}
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
};

/**
 * Verify Razorpay or third-party HMAC SHA256 webhook signature
 * @param {string|Buffer} body 
 * @param {string} signature 
 * @param {string} secret 
 * @returns {boolean}
 */
const verifyHmacSignature = (body, signature, secret) => {
  if (!signature || !secret) return false;
  try {
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch (err) {
    return false;
  }
};

/**
 * Generate a tamper-evident digital signature hash for clinical prescriptions
 * @param {object} payload 
 * @param {string} doctorRegistrationNumber 
 * @returns {string} SHA-256 digital signature hash
 */
const generatePrescriptionSignatureHash = (payload, doctorRegistrationNumber) => {
  const content = JSON.stringify({
    doctorRegistrationNumber,
    appointmentId: payload.appointmentId,
    patientId: payload.patientId,
    medications: payload.medications,
    diagnosis: payload.diagnosis,
    timestamp: new Date().toISOString(),
  });

  return '0x' + crypto.createHash('sha256').update(content).digest('hex');
};

module.exports = {
  generateSecureOTP,
  hashOTP,
  verifyHmacSignature,
  generatePrescriptionSignatureHash,
};
