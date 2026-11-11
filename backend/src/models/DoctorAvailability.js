const mongoose = require('mongoose');

const DoctorAvailabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true,
    index: true,
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    required: true,
    min: 0,
    max: 6,
  },
  startTime: {
    type: String, // "09:00"
    required: true,
  },
  endTime: {
    type: String, // "13:00"
    required: true,
  },
  slotDurationMinutes: {
    type: Number,
    default: 20,
    min: 10,
    max: 60,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  breakStartTime: {
    type: String,
    default: null,
  },
  breakEndTime: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'doctor_availabilities',
});

// A doctor should only have one availability rule per day of week
DoctorAvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('DoctorAvailability', DoctorAvailabilitySchema);
