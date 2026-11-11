const mongoose = require('mongoose');

const PatientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other'],
    default: 'Prefer not to say',
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  },
  address: {
    street: String,
    city: { type: String, index: true },
    state: { type: String, index: true },
    pincode: { type: String, index: true },
  },
  knownAllergies: [{
    type: String,
    trim: true,
  }],
  chronicConditions: [{
    type: String,
    trim: true,
  }],
  defaultEphemeralTTLMinutes: {
    type: Number,
    default: 60,
  },
  allowDoctorClinicalShare: {
    type: Boolean,
    default: true,
  },
  telemedicineRecordingConsent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'patient_profiles',
});

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);
