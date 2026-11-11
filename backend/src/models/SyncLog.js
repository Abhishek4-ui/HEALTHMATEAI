const mongoose = require('mongoose');

const SyncLogSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sourceName: {
    type: String,
    required: true,
    index: true,
  },
  triggerType: {
    type: String,
    enum: ['SCHEDULED_CRON', 'ADMIN_MANUAL', 'STARTUP_INGESTION'],
    default: 'SCHEDULED_CRON',
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED'],
    default: 'IN_PROGRESS',
    index: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  durationMs: {
    type: Number,
    default: 0,
  },
  recordsProcessed: {
    type: Number,
    default: 0,
  },
  recordsInserted: {
    type: Number,
    default: 0,
  },
  recordsUpdated: {
    type: Number,
    default: 0,
  },
  duplicatesDetectedCount: {
    type: Number,
    default: 0,
  },
  duplicatesSummary: [{
    entityType: String,
    identifier: String,
    matchReason: String,
    existingId: String,
  }],
  quarantinedCount: {
    type: Number,
    default: 0,
  },
  quarantinedRecords: [{
    entityType: String,
    sourceIdentifier: String,
    reason: String,
    failedFields: [String],
    rawData: mongoose.Schema.Types.Mixed,
    quarantinedAt: { type: Date, default: Date.now },
  }],
  retryAttempts: {
    type: Number,
    default: 0,
  },
  errorDetails: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'sync_logs',
});

module.exports = mongoose.model('SyncLog', SyncLogSchema);
