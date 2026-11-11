const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true,
    index: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  diagnosis: [{
    code: String,
    description: { type: String, required: true },
  }],
  medications: [{
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true }, // E.g., "500mg"
    frequency: { type: String, required: true }, // E.g., "Twice daily after meals"
    durationDays: { type: Number, required: true },
    instructions: { type: String, default: '' },
  }],
  investigationsRecommended: [{
    type: String,
  }],
  dietaryAndLifestyleAdvice: {
    type: String,
    default: '',
  },
  followUpDate: {
    type: Date,
    default: null,
  },
  digitalSignature: {
    doctorNmcNumber: { type: String, required: true },
    signedTimestamp: { type: Date, default: Date.now },
    signatureHash: { type: String, required: true }, // SHA-256 verification hash
  },
}, {
  timestamps: true,
  collection: 'prescriptions',
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
