const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  sourceIdentifier: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  sourceType: {
    type: String,
    enum: ['GOOGLE_PLACES', 'ABDM_HFR', 'OFFICIAL_REGISTRY', 'OPEN_GOVERNMENT_DATA_INDIA', 'MANUAL_ENTRY'],
    default: 'MANUAL_ENTRY',
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
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  facilityType: {
    type: String,
    enum: ['HOSPITAL', 'CLINIC', 'DIAGNOSTIC_LAB', 'PHARMACY'],
    default: 'HOSPITAL',
    index: true,
  },
  statusTier: {
    type: String,
    enum: ['DISCOVERED', 'SOURCE_VERIFIED', 'CREDENTIAL_VERIFIED', 'APPOINTMENT_ENABLED'],
    default: 'SOURCE_VERIFIED',
    index: true,
  },
  departments: [{
    type: String,
    trim: true,
  }],
  contact: {
    phone: String,
    website: String,
    emergencyHotline: String,
  },
  address: {
    formattedAddress: String,
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    pincode: { type: String, index: true },
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
      default: [77.5946, 12.9716],
    },
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5,
  },
  lastSynchronizedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'hospitals',
});

HospitalSchema.index({ location: '2dsphere' });
HospitalSchema.index({ name: 'text', 'address.city': 1 });

module.exports = mongoose.model('Hospital', HospitalSchema);
