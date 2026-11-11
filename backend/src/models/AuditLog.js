const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null if guest
  },
  actorRole: {
    type: String,
    enum: ['GUEST', 'PATIENT', 'DOCTOR', 'ADMINISTRATION', 'SYSTEM_CRON'],
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  targetResource: {
    resourceType: { type: String, default: null },
    resourceId: { type: String, default: null },
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  statusCode: {
    type: Number,
    default: 200,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Immutable: no edits permitted
  collection: 'audit_logs',
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
