const mongoose = require('mongoose');

const IntegrationStatusSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  domain: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['HEALTHY', 'STANDBY', 'DEGRADED', 'DOWN'],
    default: 'STANDBY',
    index: true,
  },
  latencyMs: {
    type: Number,
    default: 0,
  },
  endpoint: {
    type: String,
    default: '',
  },
  lastCheckedAt: {
    type: Date,
    default: Date.now,
  },
  errorDetails: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'integration_statuses',
});

module.exports = mongoose.model('IntegrationStatus', IntegrationStatusSchema);
