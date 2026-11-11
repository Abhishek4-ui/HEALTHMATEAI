const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMINISTRATION'],
    required: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'],
    default: 'ACTIVE',
    index: true,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'users',
});

UserSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', UserSchema);
