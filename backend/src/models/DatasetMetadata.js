const mongoose = require('mongoose');

const DatasetMetadataSchema = new mongoose.Schema({
  datasetId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  datasetName: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  license: {
    type: String,
    required: true,
  },
  sampleSize: {
    type: String,
    required: true,
  },
  features: {
    type: String,
    required: true,
  },
  checksumSha256: {
    type: String,
    default: null,
  },
  verificationStatus: {
    type: String,
    enum: ['VERIFIED_HASH_VALID', 'PENDING_VERIFICATION', 'DEPRECATED'],
    default: 'VERIFIED_HASH_VALID',
  },
}, {
  timestamps: true,
  collection: 'dataset_metadata',
});

module.exports = mongoose.model('DatasetMetadata', DatasetMetadataSchema);
