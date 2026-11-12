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
   * Return configured payment capabilities (Razorpay Test Mode + Manual UPI)
   */
  getPaymentConfig() {
    const merchantUpiId = process.env.MERCHANT_UPI_ID || process.env.UPI_ID || null;
    const merchantName = process.env.MERCHANT_NAME || 'HealthMate Healthcare Network';

    return {
      razorpay: {
        active: true,
        mode: 'TEST',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_Tyml08EyeVHKJY',
      },
      manualUpi: {
        configured: Boolean(merchantUpiId),
        merchantUpiId,
        merchantName,
        policyNotice: 'Manual UPI requires patient UTR submission and authorized administrator reconciliation against bank records before confirmation.',
      },
    };
  }

  /**
   * Create a Razorpay payment order for an appointment
   */
  async createPaymentOrder({ appointmentId, patientId, amount, currency = 'INR', idempotencyKey }) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found.');

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
          amount: Math.round(payableAmount * 100),
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
        logger.error('Razorpay gateway order creation rejected:', { error: rzpErr.message });
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Payment Gateway Error: ${rzpErr.message}`);
        }
        orderId = 'order_test_' + crypto.randomBytes(8).toString('hex');
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Payment gateway credentials are not configured in production.');
      }
      orderId = 'order_test_' + crypto.randomBytes(8).toString('hex');
    }

    const transaction = await PaymentTransaction.create({
      orderId,
      appointmentId,
      patientId,
      amount: payableAmount,
      currency,
      status: 'CREATED',
      method: 'RAZORPAY',
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
   * Initiate a Manual UPI payment transaction
   */
  async initiateManualUpi({ appointmentId, patientId, paymentType = 'APPOINTMENT', amount }) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found.');

    const payableAmount = amount || appointment.paymentAmount || 500;
    const paymentRef = `UPI-HM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const orderId = `upi_ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const merchantUpiId = process.env.MERCHANT_UPI_ID || process.env.UPI_ID || null;
    const merchantName = process.env.MERCHANT_NAME || 'HealthMate Healthcare Network';

    let upiDeepLink = null;
    let qrPayload = null;

    if (merchantUpiId) {
      upiDeepLink = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${payableAmount}&tr=${paymentRef}&cu=INR&tn=${encodeURIComponent('HealthMate Payment ' + paymentRef)}`;
      qrPayload = upiDeepLink;
    }

    const transaction = await PaymentTransaction.create({
      orderId,
      paymentReference: paymentRef,
      appointmentId,
      patientId,
      paymentType,
      amount: payableAmount,
      currency: 'INR',
      status: 'PENDING',
      method: 'MANUAL_UPI',
      manualUpi: {
        merchantUpiId,
        merchantName,
        submittedAt: null,
      },
    });

    return {
      success: true,
      transactionId: transaction._id,
      paymentReference: paymentRef,
      orderId,
      amount: payableAmount,
      currency: 'INR',
      status: transaction.status,
      merchantConfigured: Boolean(merchantUpiId),
      merchantUpiId,
      merchantName,
      upiDeepLink,
      qrPayload,
      instructions: merchantUpiId
        ? 'Scan the genuine merchant QR code using any UPI app (GPay, PhonePe, Paytm, BHIM). After payment, enter your 12-digit bank UTR reference number.'
        : 'Merchant UPI ID is awaiting administrative configuration. Razorpay Test Mode remains available.',
    };
  }

  /**
   * Submit 12-digit UTR reference number and optional receipt screenshot
   */
  async submitUpiUtr({ transactionId, patientId, utrNumber, receiptUrl }) {
    if (!utrNumber || !/^[A-Za-z0-9]{8,22}$/.test(utrNumber.trim())) {
      throw new Error('Valid bank UTR / transaction reference number (8-22 alphanumeric characters) is required.');
    }

    const transaction = await PaymentTransaction.findOne({
      _id: transactionId,
      patientId,
    });

    if (!transaction) throw new Error('Transaction record not found.');
    if (['VERIFIED', 'PAID'].includes(transaction.status)) {
      throw new Error('This transaction has already been verified.');
    }

    // Check for duplicate UTR usage across transactions
    const duplicateUtr = await PaymentTransaction.findOne({
      'manualUpi.utrNumber': utrNumber.trim(),
      _id: { $ne: transactionId },
      status: { $in: ['PENDING_VERIFICATION', 'VERIFIED'] },
    });
    if (duplicateUtr) {
      throw new Error('This UTR number has already been submitted for another payment transaction.');
    }

    transaction.status = 'PENDING_VERIFICATION';
    transaction.manualUpi.utrNumber = utrNumber.trim();
    transaction.manualUpi.receiptUrl = receiptUrl || transaction.manualUpi.receiptUrl || null;
    transaction.manualUpi.submittedAt = new Date();
    await transaction.save();

    await Appointment.findByIdAndUpdate(transaction.appointmentId, {
      paymentStatus: 'PENDING_VERIFICATION',
      paymentReferenceId: utrNumber.trim(),
    });

    logger.info('Manual UPI UTR submitted for admin reconciliation', {
      transactionId: transaction._id,
      utrNumber: utrNumber.trim(),
      patientId,
    });

    return {
      success: true,
      transactionId: transaction._id,
      paymentReference: transaction.paymentReference,
      utrNumber: transaction.manualUpi.utrNumber,
      status: 'PENDING_VERIFICATION',
      message: 'UTR submitted successfully. Payment is under administrative verification against merchant bank statement.',
    };
  }

  /**
   * Admin reconciles and verifies genuine UPI payment
   */
  async adminVerifyUpiPayment({ transactionId, adminUserId, notes }) {
    const transaction = await PaymentTransaction.findById(transactionId);
    if (!transaction) throw new Error('Transaction record not found.');

    if (transaction.status === 'VERIFIED') {
      return { success: true, alreadyVerified: true, transaction };
    }

    transaction.status = 'VERIFIED';
    transaction.manualUpi.verifiedAt = new Date();
    transaction.manualUpi.verifiedBy = adminUserId;
    await transaction.save();

    await Appointment.findByIdAndUpdate(transaction.appointmentId, {
      paymentStatus: 'PAID',
      paymentReferenceId: transaction.manualUpi.utrNumber || transaction.paymentReference,
    });

    logger.info('Administrator confirmed manual UPI payment reconciliation', {
      transactionId,
      adminUserId,
      utr: transaction.manualUpi.utrNumber,
    });

    return {
      success: true,
      status: 'VERIFIED',
      verifiedAt: transaction.manualUpi.verifiedAt,
      transaction,
    };
  }

  /**
   * Admin rejects invalid / fraudulent UTR
   */
  async adminRejectUpiPayment({ transactionId, adminUserId, reason }) {
    if (!reason || !reason.trim()) {
      throw new Error('A legitimate reason for rejection is required (e.g., UTR not found on merchant bank statement).');
    }

    const transaction = await PaymentTransaction.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found.');

    transaction.status = 'REJECTED';
    transaction.manualUpi.rejectionReason = reason.trim();
    transaction.manualUpi.verifiedAt = new Date();
    transaction.manualUpi.verifiedBy = adminUserId;
    await transaction.save();

    await Appointment.findByIdAndUpdate(transaction.appointmentId, {
      paymentStatus: 'FAILED',
    });

    logger.warn('Administrator rejected manual UPI transaction', {
      transactionId,
      reason,
      adminUserId,
    });

    return {
      success: true,
      status: 'REJECTED',
      rejectionReason: transaction.manualUpi.rejectionReason,
      transaction,
    };
  }

  /**
   * Patient requests refund
   */
  async requestRefund({ transactionId, patientId, reason }) {
    if (!reason || !reason.trim()) {
      throw new Error('Please specify the reason for the refund request.');
    }

    const transaction = await PaymentTransaction.findOne({ _id: transactionId, patientId });
    if (!transaction) throw new Error('Transaction not found.');

    if (!['PAID', 'VERIFIED'].includes(transaction.status)) {
      throw new Error(`Refund cannot be requested for payment with status ${transaction.status}.`);
    }

    transaction.status = 'REFUND_REQUESTED';
    transaction.manualUpi.refundReason = reason.trim();
    transaction.manualUpi.refundRequestedAt = new Date();
    await transaction.save();

    return {
      success: true,
      status: 'REFUND_REQUESTED',
      message: 'Refund request submitted for administrative review.',
    };
  }

  /**
   * Admin approves and marks refund processed
   */
  async adminProcessRefund({ transactionId, adminUserId, refundNotes }) {
    const transaction = await PaymentTransaction.findById(transactionId);
    if (!transaction) throw new Error('Transaction not found.');

    transaction.status = 'REFUNDED';
    transaction.manualUpi.refundProcessedAt = new Date();
    await transaction.save();

    await Appointment.findByIdAndUpdate(transaction.appointmentId, {
      paymentStatus: 'REFUNDED',
    });

    logger.info('Administrator finalized refund for transaction', { transactionId, adminUserId });

    return {
      success: true,
      status: 'REFUNDED',
      refundProcessedAt: transaction.manualUpi.refundProcessedAt,
      transaction,
    };
  }

  /**
   * Get patient transaction history
   */
  async getPatientTransactions(patientId) {
    return PaymentTransaction.find({ patientId })
      .populate('appointmentId', 'scheduledDate scheduledTime consultationType status doctorId')
      .sort({ createdAt: -1 });
  }

  /**
   * Get all pending transactions for admin reconciliation
   */
  async getPendingReconciliations() {
    return PaymentTransaction.find({
      status: { $in: ['PENDING_VERIFICATION', 'REFUND_REQUESTED'] },
    })
      .populate('patientId', 'fullName email phone')
      .populate('appointmentId', 'scheduledDate scheduledTime consultationType doctorId')
      .sort({ 'manualUpi.submittedAt': -1, createdAt: -1 });
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
        { status: 'PAID', paymentId, method: 'RAZORPAY' },
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

      const existing = await PaymentTransaction.findOne({ orderId });
      if (existing && existing.status === 'PAID') {
        logger.info('Duplicate payment.captured webhook processed idempotently.', { orderId, paymentId });
        return { received: true, idempotent: true };
      }

      const transaction = await PaymentTransaction.findOneAndUpdate(
        { orderId },
        { status: 'PAID', paymentId, method: 'RAZORPAY' },
        { new: true }
      );

      if (transaction) {
        await Appointment.findByIdAndUpdate(transaction.appointmentId, {
          paymentStatus: 'PAID',
          paymentReferenceId: paymentId,
        });
        logger.info('Appointment payment confirmed via verified Razorpay webhook.', { orderId, paymentId });
      }
    } else if (event === 'payment.failed' && payment) {
      const orderId = payment.order_id;
      const transaction = await PaymentTransaction.findOneAndUpdate(
        { orderId },
        { status: 'FAILED', paymentId: payment.id },
        { new: true }
      );
      if (transaction) {
        await Appointment.findByIdAndUpdate(transaction.appointmentId, {
          paymentStatus: 'FAILED',
        });
        logger.info('Appointment payment marked failed via verified Razorpay webhook.', { orderId });
      }
    }

    return { received: true };
  }
}

module.exports = new PaymentService();
