const mongoose = require('mongoose');

const DoctorVerificationSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicalRegistrationNumber: {
    type: String,
    required: true,
  },
  stateMedicalCouncil: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING_ADMIN_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'PENDING_ADMIN_REVIEW',
    index: true,
  },
  submittedDocuments: [{
    name: String,
    type: String,
    url: String,
    submittedAt: { type: Date, default: Date.now },
  }],
  reviewedByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'doctor_verifications',
});

module.exports = mongoose.model('DoctorVerification', DoctorVerificationSchema);
