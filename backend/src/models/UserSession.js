const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMINISTRATION'],
    required: true,
  },
  sessionTokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  userAgent: {
    type: String,
    default: '',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'user_sessions',
});

module.exports = mongoose.model('UserSession', UserSessionSchema);
