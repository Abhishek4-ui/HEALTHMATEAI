const crypto = require('crypto');
const { PaymentTransaction, Appointment } = require('../models');
const { verifyHmacSignature } = require('../security/crypto');
const logger = require('../utils/logger');

class PaymentService {
  /**
   * Create a payment order for an appointment
   */
  async createPaymentOrder({ appointmentId, patientId, amount, currency = 'INR', idempotencyKey }) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found.');

    // Check for existing order with same idempotencyKey
    if (idempotencyKey) {
      const existing = await PaymentTransaction.findOne({ idempotencyKey });
      if (existing) return existing;
    }

    const orderId = 'order_' + crypto.randomBytes(12).toString('hex');

    const transaction = await PaymentTransaction.create({
      orderId,
      appointmentId,
      patientId,
      amount: amount || appointment.paymentAmount,
      currency,
      status: 'CREATED',
      idempotencyKey: idempotencyKey || null,
    });

    return {
      orderId: transaction.orderId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      // If RAZORPAY_KEY_ID configured, return key
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_pending_credentials',
    };
  }

  /**
   * Handle Razorpay webhook with strict cryptographic HMAC SHA256 verification
   */
  async handleWebhook(rawBody, signatureHeader) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const isValid = verifyHmacSignature(rawBody, signatureHeader, webhookSecret);
      if (!isValid) {
        throw new Error('Invalid Razorpay webhook HMAC signature.');
      }
    } else {
      logger.warn('RAZORPAY_WEBHOOK_SECRET not configured. Webhook rejected for safety.');
      throw new Error('Payment webhook provider secret not configured.');
    }

    const payload = JSON.parse(rawBody.toString());
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    if (event === 'payment.captured' && payment) {
      const orderId = payment.order_id;
      const paymentId = payment.id;

      const transaction = await PaymentTransaction.findOneAndUpdate(
        { orderId },
        { status: 'PAID', paymentId, method: payment.method },
        { new: true }
      );

      if (transaction) {
        await Appointment.findByIdAndUpdate(transaction.appointmentId, {
          paymentStatus: 'PAID',
          paymentReferenceId: paymentId,
        });
        logger.info('Appointment payment confirmed via verified Razorpay webhook.', { orderId, paymentId });
      }
    }

    return { received: true };
  }
}

module.exports = new PaymentService();
