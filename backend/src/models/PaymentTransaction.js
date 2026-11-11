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
    enum: ['CREATED', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'CREATED',
    index: true,
  },
  method: {
    type: String,
    default: 'UPI',
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
