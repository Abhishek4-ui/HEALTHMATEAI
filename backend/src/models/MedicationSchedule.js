const mongoose = require('mongoose');

const MedicationScheduleSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  medicineName: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
  },
  frequency: {
    type: String,
    default: 'Once Daily',
  },
  timeSlots: [{
    type: String,
  }],
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  instructions: {
    type: String,
    trim: true,
  },
  adherenceLogs: [{
    date: { type: Date, default: Date.now },
    taken: { type: Boolean, default: true },
    takenAt: { type: Date, default: Date.now },
  }],
  provenance: {
    source: {
      type: String,
      enum: ['Patient Entered', 'Prescription OCR', 'Doctor Prescribed', 'Verified External Source'],
      default: 'Patient Entered',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
  collection: 'patient_medications',
});

module.exports = mongoose.model('MedicationSchedule', MedicationScheduleSchema);
