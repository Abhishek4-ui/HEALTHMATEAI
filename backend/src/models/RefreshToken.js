const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true,
  },
  replacedByTokenHash: {
    type: String,
    default: null,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  userAgent: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  collection: 'refresh_tokens',
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
