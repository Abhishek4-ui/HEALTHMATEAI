const mongoose = require('mongoose');

const ConsentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  consentType: {
    type: String,
    enum: ['TEMPORARY_AI_ANALYSIS', 'PERSISTENT_HEALTH_VAULT', 'DOCTOR_CLINICAL_SHARE', 'TELEMEDICINE_RECORDING'],
    required: true,
  },
  status: {
    type: String,
    enum: ['GRANTED', 'REVOKED'],
    default: 'GRANTED',
    index: true,
  },
  purposeDescription: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  userAgent: {
    type: String,
    default: '',
  },
  grantedAt: {
    type: Date,
    default: Date.now,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'patient_consents',
});

module.exports = mongoose.model('Consent', ConsentSchema);
