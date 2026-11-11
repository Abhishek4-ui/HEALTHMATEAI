/**
 * Redact sensitive fields from objects before logging
 * Prevents medical records, passwords, OTPs, and tokens from leaking into logs
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'otp',
  'mfaSecret',
  'cvv',
  'cardNumber',
  'symptomSummary',
  'chiefComplaint',
  'biomarkers',
  'extractedText',
  'chatHistory',
  'soapNotes',
];

const redactSensitiveData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

module.exports = { redactSensitiveData };
