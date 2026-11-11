const mongoose = require('mongoose');

const MLOpsTelemetrySchema = new mongoose.Schema({
  modelId: {
    type: String,
    required: true,
    index: true,
  },
  task: {
    type: String,
    default: 'INFERENCE',
  },
  latencyMs: {
    type: Number,
    required: true,
  },
  statusCode: {
    type: Number,
    default: 200,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'mlops_telemetry',
});

module.exports = mongoose.model('MLOpsTelemetry', MLOpsTelemetrySchema);
