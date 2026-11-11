const crypto = require('crypto');
const Razorpay = require('razorpay');
const { PaymentTransaction, Appointment } = require('../models');
const { verifyHmacSignature } = require('../security/crypto');
const logger = require('../utils/logger');

let razorpayClient = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    logger.info('Razorpay client initialized with credentials.');
  } catch (err) {
    logger.error('Failed to initialize Razorpay client:', err.message);
  }
}

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
      if (existing) {
        return {
          orderId: existing.orderId,
          amount: existing.amount,
          currency: existing.currency,
          status: existing.status,
          keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_Tyml08EyeVHKJY',
        };
      }
    }

    const payableAmount = amount || appointment.paymentAmount || 500;
    let orderId;

    if (razorpayClient) {
      try {
        const rzpOrder = await razorpayClient.orders.create({
          amount: Math.round(payableAmount * 100), // in paise
          currency,
          receipt: `rcpt_${String(appointmentId).slice(-12)}`,
          notes: {
            appointmentId: String(appointmentId),
            patientId: String(patientId),
          },
        });
        orderId = rzpOrder.id;
        logger.info('Live Razorpay test order created successfully', { orderId, amount: payableAmount });
      } catch (rzpErr) {
        logger.warn('Razorpay API order creation failed, falling back to simulated order:', rzpErr.message);
        orderId = 'order_' + crypto.randomBytes(12).toString('hex');
      }
    } else {
      orderId = 'order_' + crypto.randomBytes(12).toString('hex');
    }

    const transaction = await PaymentTransaction.create({
      orderId,
      appointmentId,
      patientId,
      amount: payableAmount,
      currency,
      status: 'CREATED',
      idempotencyKey: idempotencyKey || null,
    });

    return {
      orderId: transaction.orderId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_Tyml08EyeVHKJY',
    };
  }

  /**
   * Verify Razorpay payment signature returned from client checkout modal
   */
  async verifyPaymentSignature({ orderId, paymentId, signature, appointmentId }) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret not configured on server.');
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      logger.error('Payment signature mismatch', { orderId, paymentId });
      throw new Error('Invalid Razorpay payment signature. Tampering detected.');
    }

    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const transaction = await PaymentTransaction.findOneAndUpdate(
        { orderId },
        { status: 'PAID', paymentId, method: 'razorpay' },
        { new: true }
      );

      const targetAppointmentId = appointmentId || (transaction ? transaction.appointmentId : null);
      if (targetAppointmentId) {
        await Appointment.findByIdAndUpdate(targetAppointmentId, {
          paymentStatus: 'PAID',
          paymentReferenceId: paymentId,
        });
        logger.info('Appointment payment confirmed via verified client signature.', { orderId, paymentId, targetAppointmentId });
      }
    }

    return {
      verified: true,
      orderId,
      paymentId,
      status: 'PAID',
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
