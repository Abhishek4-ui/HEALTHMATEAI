const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    enum: ['Parent', 'Spouse', 'Child', 'Sibling', 'Guardian', 'Friend', 'Other'],
    default: 'Other',
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'emergency_contacts',
});

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);
