const mongoose = require('mongoose');

const AIModelMetadataSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  modelVersion: {
    type: String,
    required: true,
  },
  framework: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  metrics: {
    accuracy: { type: Number, default: 0 },
    rocAuc: { type: Number, default: 0 },
    f1Score: { type: Number, default: 0 },
    latencyP95Ms: { type: Number, default: 0 },
  },
  driftDetected: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['ACTIVE_PRODUCTION', 'SHADOW', 'DEPRECATED'],
    default: 'ACTIVE_PRODUCTION',
  },
  lastEvaluatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'ai_model_metadata',
});

module.exports = mongoose.model('AIModelMetadata', AIModelMetadataSchema);
