const mongoose = require('mongoose');

const PatientVitalSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  vitalType: {
    type: String,
    required: true,
    enum: ['BLOOD_PRESSURE', 'HEART_RATE', 'BLOOD_GLUCOSE', 'SPO2', 'TEMPERATURE', 'WEIGHT', 'BMI'],
    index: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true, // e.g., 72 or { systolic: 120, diastolic: 80 }
  },
  unit: {
    type: String,
    required: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  source: {
    type: String,
    enum: ['Patient Entered', 'Connected Device', 'Uploaded Document', 'Clinical Visit'],
    default: 'Patient Entered',
  },
  status: {
    type: String,
    enum: ['NORMAL', 'ELEVATED', 'CRITICAL', 'LOW'],
    default: 'NORMAL',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'patient_vitals',
});

module.exports = mongoose.model('PatientVital', PatientVitalSchema);
