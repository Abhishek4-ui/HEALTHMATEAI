const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true,
    index: true,
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null,
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true,
  },
  timeSlot: {
    type: String, // E.g., "10:30"
    required: true,
  },
  durationMinutes: {
    type: Number,
    default: 20,
  },
  consultationType: {
    type: String,
    enum: ['VIDEO', 'AUDIO', 'IN_PERSON'],
    default: 'VIDEO',
  },
  chiefComplaint: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: [
      'DRAFT',
      'PENDING_PAYMENT',
      'REQUESTED',
      'CONFIRMED',
      'PAYMENT_FAILED',
      'CANCELLED',
      'RESCHEDULED',
      'COMPLETED',
      'NO_SHOW',
      'REFUND_PENDING',
      'REFUNDED',
    ],
    default: 'PENDING_PAYMENT',
    index: true,
  },
  cancellationReason: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED', 'PENDING_VERIFICATION', 'REFUND_PENDING'],
    default: 'PENDING',
    index: true,
  },
  paymentMethod: {
    type: String,
    enum: ['RAZORPAY', 'MANUAL_UPI', 'CASH_AT_CLINIC', 'NOT_SELECTED'],
    default: 'NOT_SELECTED',
  },
  paymentAmount: {
    type: Number,
    default: 500,
  },
  paymentReferenceId: {
    type: String,
    default: null,
  },
  upiTransactionId: {
    type: String,
    default: null,
  },
  paymentReceiptUrl: {
    type: String,
    default: null,
  },
  teleconsultationRoomId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'appointments',
});

// Ensure a doctor is not double-booked for the exact same slot unless cancelled
AppointmentSchema.index(
  { doctorId: 1, scheduledDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['REQUESTED', 'CONFIRMED', 'PENDING_PAYMENT'] } } }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
