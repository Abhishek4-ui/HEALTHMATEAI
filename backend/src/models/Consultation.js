const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  consultationCategory: {
    type: String,
    enum: ['AI_DOCTOR', 'REAL_DOCTOR'],
    default: 'REAL_DOCTOR',
    index: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
    sparse: true,
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
    default: null,
    index: true,
  },
  title: {
    type: String,
    default: 'Consultation Session',
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en',
  },
  patientContextConsented: {
    type: Boolean,
    default: false,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
    default: null,
  },
  aiMessages: [{
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    structuredResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  aiSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  patientApprovedSummary: {
    approved: { type: Boolean, default: false },
    approvedAt: { type: Date, default: null },
    content: { type: mongoose.Schema.Types.Mixed, default: null },
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
  isSaved: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
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
