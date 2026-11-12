const mongoose = require('mongoose');

const LabOrderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  testName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Hematology', 'Biochemistry', 'Lipid Profile', 'Thyroid', 'Endocrinology', 'Urine Analysis', 'Radiology', 'Pathology', 'Other'],
    default: 'Hematology',
  },
  diagnosticCenter: {
    type: String,
    required: true,
    trim: true,
  },
  scheduledDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['REQUESTED', 'CONFIRMED', 'SAMPLE_COLLECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
    default: 'REQUESTED',
    index: true,
  },
  fastingRequired: {
    type: Boolean,
    default: false,
  },
  instructions: {
    type: String,
    trim: true,
  },
  reportFileKey: {
    type: String,
  },
  priceEstimate: {
    type: Number,
    default: 0,
  },
  provenance: {
    source: {
      type: String,
      default: 'Verified Diagnostic Center',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
  collection: 'patient_lab_orders',
});

module.exports = mongoose.model('LabOrder', LabOrderSchema);
