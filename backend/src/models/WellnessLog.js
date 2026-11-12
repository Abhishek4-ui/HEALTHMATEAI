const mongoose = require('mongoose');

const WellnessLogSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  logDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24,
  },
  sleepQuality: {
    type: String,
    enum: ['Deep & Restful', 'Normal', 'Interrupted', 'Poor', 'Unknown'],
    default: 'Normal',
  },
  moodScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 7,
  },
  stressLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Severe'],
    default: 'Low',
  },
  mindfulnessMinutes: {
    type: Number,
    default: 0,
  },
  waterIntakeMl: {
    type: Number,
    default: 0,
  },
  caloriesConsumed: {
    type: Number,
    default: 0,
  },
  activityMinutes: {
    type: Number,
    default: 0,
  },
  source: {
    type: String,
    enum: ['Patient Entered', 'Connected Device', 'Estimated Calculation'],
    default: 'Patient Entered',
  },
}, {
  timestamps: true,
  collection: 'patient_wellness_logs',
});

module.exports = mongoose.model('WellnessLog', WellnessLogSchema);
