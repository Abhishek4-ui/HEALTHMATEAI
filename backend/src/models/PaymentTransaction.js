const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  paymentId: {
    type: String,
    sparse: true,
    index: true,
  },
  paymentReference: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  paymentType: {
    type: String,
    enum: ['APPOINTMENT', 'CONSULTATION', 'LAB_BOOKING', 'PHARMACY_ORDER'],
    default: 'APPOINTMENT',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: [
      'CREATED',
      'PAID',
      'FAILED',
      'PENDING',
      'PENDING_VERIFICATION',
      'VERIFIED',
      'REJECTED',
      'REFUND_REQUESTED',
      'REFUNDED',
    ],
    default: 'PENDING',
    index: true,
  },
  method: {
    type: String,
    enum: ['RAZORPAY', 'MANUAL_UPI', 'UPI'],
    default: 'MANUAL_UPI',
  },
  manualUpi: {
    merchantUpiId: { type: String, default: null },
    merchantName: { type: String, default: null },
    utrNumber: { type: String, default: null, index: true },
    receiptUrl: { type: String, default: null },
    submittedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: null },
    refundReason: { type: String, default: null },
    refundRequestedAt: { type: Date, default: null },
    refundProcessedAt: { type: Date, default: null },
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  rawWebhookSignatureHash: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'payment_transactions',
});

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
