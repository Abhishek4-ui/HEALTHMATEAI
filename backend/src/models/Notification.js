const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  recipientRole: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMINISTRATION'],
    required: true,
  },
  type: {
    type: String,
    enum: ['APPOINTMENTS', 'REPORTS', 'SECURITY', 'SYSTEM', 'CLINICAL'],
    default: 'SYSTEM',
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'notifications',
});

module.exports = mongoose.model('Notification', NotificationSchema);
