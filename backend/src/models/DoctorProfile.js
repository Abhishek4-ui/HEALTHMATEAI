const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  sourceType: {
    type: String,
    enum: ['NATIONAL_MEDICAL_COMMISSION', 'STATE_MEDICAL_COUNCIL', 'GOOGLE_PLACES', 'MANUAL_REGISTRATION'],
    default: 'MANUAL_REGISTRATION',
    index: true,
  },
  googlePlaceId: {
    type: String,
    sparse: true,
    index: true,
  },
  directionsUrl: {
    type: String,
    default: null,
  },
  isClaimed: {
    type: Boolean,
    default: false,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  medicalRegistrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  stateMedicalCouncil: {
    type: String,
    required: true,
    trim: true,
  },
  qualifications: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    passingYear: { type: Number, required: true },
  }],
  specialization: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  experienceYears: {
    type: Number,
    required: true,
    min: 0,
  },
  verificationDocuments: [{
    docType: {
      type: String,
      enum: ['DEGREE', 'REGISTRATION_CERTIFICATE', 'GOVT_ID', 'OTHER'],
      required: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  }],
  verificationStatus: {
    type: String,
    enum: ['DISCOVERED', 'SOURCE_VERIFIED', 'CREDENTIAL_VERIFIED', 'APPOINTMENT_ENABLED'],
    default: 'DISCOVERED',
    index: true,
  },
  verifiedByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  consultationFee: {
    type: Number,
    required: true,
    default: 500,
    min: 0,
  },
  hospitalAffiliation: {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
    facilityName: { type: String, default: 'Independent Clinic' },
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [77.5946, 12.9716], // Default Bengaluru coordinates
    },
  },
  address: {
    street: String,
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    pincode: { type: String, required: true, index: true },
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  bio: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
  collection: 'doctor_profiles',
});

DoctorProfileSchema.index({ location: '2dsphere' });
DoctorProfileSchema.index({ specialization: 1, 'address.city': 1, verificationStatus: 1 });

module.exports = mongoose.model('DoctorProfile', DoctorProfileSchema);
