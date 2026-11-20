const mongoose = require('mongoose');

const MedicalDocumentSchema = new mongoose.Schema({
  uploadToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileSizeBytes: {
    type: Number,
    required: true,
  },
  storageType: {
    type: String,
    enum: ['AWS_S3', 'MONGODB_VAULT', 'LOCAL'],
    default: 'MONGODB_VAULT',
  },
  s3Key: {
    type: String,
    default: null,
  },
  fileData: {
    type: Buffer,
    default: null,
  },
  biomarkers: [{
    type: mongoose.Schema.Types.Mixed,
  }],
  clinicalSummary: {
    type: String,
    default: '',
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('MedicalDocument', MedicalDocumentSchema);
