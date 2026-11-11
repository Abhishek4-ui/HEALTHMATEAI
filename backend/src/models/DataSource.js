const mongoose = require('mongoose');

const DataSourceSchema = new mongoose.Schema({
  sourceName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  sourceType: {
    type: String,
    enum: ['API', 'DIRECTORY', 'OPEN_DATASET', 'REGULATORY_REGISTRY'],
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['HEALTHY', 'STANDBY', 'DEGRADED', 'DOWN'],
    default: 'STANDBY',
  },
  recordCount: {
    type: Number,
    default: 0,
  },
  lastSyncTimestamp: {
    type: Date,
    default: Date.now,
  },
  syncFrequency: {
    type: String,
    default: 'DAILY',
  },
  errorLog: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'data_sources',
});

module.exports = mongoose.model('DataSource', DataSourceSchema);
