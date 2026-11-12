const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    required: true,
    enum: ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Dependent', 'Other'],
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer not to say'],
    default: 'Prefer not to say',
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  },
  knownAllergies: [{
    type: String,
    trim: true,
  }],
  chronicConditions: [{
    type: String,
    trim: true,
  }],
  emergencyContact: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'patient_family_members',
});

module.exports = mongoose.model('FamilyMember', FamilyMemberSchema);
