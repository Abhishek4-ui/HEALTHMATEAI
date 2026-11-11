const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true,
    index: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true,
    index: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
    default: null,
  },
  soapNotes: {
    subjective: { type: String, default: '' },
    objective: { type: String, default: '' },
    assessment: { type: String, default: '' },
    plan: { type: String, default: '' },
  },
  clinicalSummary: {
    type: String,
    default: '',
  },
  recordingConsent: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED', 'ABORTED'],
    default: 'IN_PROGRESS',
    index: true,
  },
}, {
  timestamps: true,
  collection: 'consultations',
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
