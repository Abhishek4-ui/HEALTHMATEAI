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

    if (appointment.status === 'CONFIRMED' && appointment.paymentStatus === 'PAID') {
      throw new Error('This appointment has already been paid and confirmed.');
    }

    if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
      const existing = await PaymentTransaction.findOne({ idempotencyKey: idempotencyKey.trim() });
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

    // Verify if there is already an active PAID transaction for this appointment
    const existingPaid = await PaymentTransaction.findOne({
      appointmentId,
      status: { $in: ['PAID', 'VERIFIED'] },
    });
    if (existingPaid) {
      throw new Error('Payment has already been completed for this appointment.');
    }

    const payableAmount = typeof appointment.paymentAmount === 'number' && appointment.paymentAmount > 0
      ? appointment.paymentAmount
      : (typeof amount === 'number' && amount > 0 ? amount : 500);

    let orderId;

    if (razorpayClient) {
      try {
        const rzpOrder = await razorpayClient.orders.create({
          amount: Math.round(payableAmount * 100),
          currency,
          receipt: `rcpt_${String(appointmentId).slice(-12)}`,
          notes: {
            appointmentId: String(appointmentId),
            patientId: String(patientId || appointment.patientId),
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

    const txData = {
      orderId,
      appointmentId,
      patientId: patientId || appointment.patientId,
      amount: payableAmount,
      currency,
      status: 'CREATED',
      method: 'RAZORPAY',
    };

    if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
      txData.idempotencyKey = idempotencyKey.trim();
    }

    const transaction = await PaymentTransaction.create(txData);

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
      paymentMethod: 'MANUAL_UPI',
      paymentReferenceId: utrNumber.trim(),
      upiTransactionId: utrNumber.trim(),
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

    const appointmentService = require('./appointment.service');
    await appointmentService.confirmAppointmentPayment(transaction.appointmentId, {
      paymentMethod: 'MANUAL_UPI',
      paymentReferenceId: transaction.manualUpi.utrNumber || transaction.paymentReference,
      upiTransactionId: transaction.manualUpi.utrNumber,
      receiptUrl: transaction.manualUpi.receiptUrl,
    }).catch(async () => {
      await Appointment.findByIdAndUpdate(transaction.appointmentId, {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: 'MANUAL_UPI',
        paymentReferenceId: transaction.manualUpi.utrNumber || transaction.paymentReference,
      });
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
   * Strictly enforces:
   * 1. Server-stored expected order verification (not untrusted client order)
   * 2. Timing-safe cryptographic HMAC-SHA256 comparison
   * 3. Consultation fee amount matching
   * 4. Idempotent duplicate verification requests
   * 5. Appointment confirmation only after verification
   */
  async verifyPaymentSignature({ orderId, paymentId, signature, appointmentId, patientId }) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret not configured on server.');
    }

    if (!orderId || !paymentId || !signature) {
      throw new Error('orderId, paymentId, and signature are required for payment verification.');
    }

    const mongoose = require('mongoose');
    const isDbConnected = Boolean(mongoose.connection && mongoose.connection.readyState === 1);

    let transaction = null;
    let appointment = null;
    const targetOrderId = orderId;

    if (isDbConnected) {
      // 1. Retrieve the genuine server-stored transaction record
      transaction = await PaymentTransaction.findOne({ orderId });
      if (!transaction) {
        logger.error('Payment verification failed: Order ID not found on server.', { orderId, paymentId });
        throw new Error('No payment transaction record found for the provided order ID.');
      }

      if (transaction) {
        // Verify appointment match if provided
        const targetAppointmentId = appointmentId || transaction.appointmentId;
        if (appointmentId && transaction.appointmentId.toString() !== appointmentId.toString()) {
          logger.error('Payment verification failed: Order does not match appointment.', { orderId, appointmentId });
          throw new Error('Payment transaction does not match the target appointment.');
        }

        // Verify patient match if provided
        if (patientId && transaction.patientId.toString() !== patientId.toString()) {
          logger.error('Payment verification failed: Transaction belongs to another patient.', { orderId, patientId });
          throw new Error('Unauthorized: payment transaction belongs to another patient.');
        }

        // 2. Fetch target appointment to verify stored consultation fee
        appointment = await Appointment.findById(targetAppointmentId);
        if (appointment && typeof appointment.paymentAmount === 'number' && transaction.amount !== appointment.paymentAmount) {
          logger.error('Payment amount mismatch between transaction and appointment', {
            txAmount: transaction.amount,
            aptAmount: appointment.paymentAmount,
          });
          throw new Error(`Payment amount mismatch: expected ₹${appointment.paymentAmount}, transaction was ₹${transaction.amount}.`);
        }
      }
    }

    const verifiedOrderId = transaction ? transaction.orderId : targetOrderId;

    // 3. Official HMAC-SHA256 signature verification using server-stored order ID
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${verifiedOrderId}|${paymentId}`)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf8');
    const expBuffer = Buffer.from(expectedSignature, 'utf8');

    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      logger.error('Payment signature verification mismatch', {
        orderId: verifiedOrderId,
        paymentId,
      });
      throw new Error('Invalid Razorpay payment signature. Tampering detected.');
    }

    // 4. Idempotency Check: If already marked PAID, return success without duplicate writes
    if (transaction && transaction.status === 'PAID') {
      logger.info('Duplicate verification request handled idempotently.', {
        orderId: transaction.orderId,
        paymentId,
      });
      return {
        verified: true,
        orderId: transaction.orderId,
        paymentId,
        status: 'PAID',
        idempotent: true,
      };
    }

    // 5. Update transaction state if DB connected
    if (isDbConnected) {
      if (transaction) {
        transaction.status = 'PAID';
        transaction.paymentId = paymentId;
        transaction.method = 'RAZORPAY';
        await transaction.save();
      }

      const targetAppointmentId = appointmentId || (transaction ? transaction.appointmentId : null);
      if (targetAppointmentId) {
        const appointmentService = require('./appointment.service');
        await appointmentService.confirmAppointmentPayment(targetAppointmentId, {
          paymentMethod: 'RAZORPAY',
          paymentReferenceId: paymentId,
        }).catch(async () => {
          await Appointment.findByIdAndUpdate(targetAppointmentId, {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paymentMethod: 'RAZORPAY',
            paymentReferenceId: paymentId,
          });
        });
      }
    }

    logger.info('Appointment payment confirmed via verified Razorpay test signature.', {
      orderId: verifiedOrderId,
      paymentId,
    });

    return {
      verified: true,
      orderId: verifiedOrderId,
      paymentId,
      status: 'PAID',
    };
  }

  /**
   * Safely record client-side checkout failure or cancellation
   * Ensures already PAID appointments are never overwritten as FAILED
   */
  async recordClientPaymentFailure({ orderId, appointmentId, reason, errorCode }) {
    if (!orderId && !appointmentId) {
      throw new Error('orderId or appointmentId is required to record failure.');
    }

    const query = orderId ? { orderId } : { appointmentId };
    const transaction = await PaymentTransaction.findOne(query);

    // Protection rule: Never overwrite legitimate successful payments as FAILED
    if (transaction && ['PAID', 'VERIFIED'].includes(transaction.status)) {
      logger.warn('Ignoring payment failure request for already PAID transaction.', { orderId, status: transaction.status });
      return { recorded: false, reason: 'Transaction already paid and confirmed.' };
    }

    if (transaction) {
      transaction.status = 'FAILED';
      await transaction.save();
    }

    const targetAppointmentId = appointmentId || (transaction ? transaction.appointmentId : null);
    if (targetAppointmentId) {
      const apt = await Appointment.findById(targetAppointmentId);
      if (apt && apt.paymentStatus !== 'PAID') {
        apt.status = 'PAYMENT_FAILED';
        apt.paymentStatus = 'FAILED';
        await apt.save();
      }
    }

    logger.info('Payment failure recorded cleanly', { orderId, targetAppointmentId, reason, errorCode });
    return {
      recorded: true,
      status: 'FAILED',
      message: reason || 'Payment cancelled or rejected by gateway.',
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
        const appointmentService = require('./appointment.service');
        await appointmentService.confirmAppointmentPayment(transaction.appointmentId, {
          paymentMethod: 'RAZORPAY',
          paymentReferenceId: paymentId,
        }).catch(async () => {
          await Appointment.findByIdAndUpdate(transaction.appointmentId, {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            paymentMethod: 'RAZORPAY',
            paymentReferenceId: paymentId,
          });
        });
        logger.info('Appointment payment confirmed via verified Razorpay webhook.', { orderId, paymentId });
      }
    } else if (event === 'payment.failed' && payment) {
      const orderId = payment.order_id;
      const existing = await PaymentTransaction.findOne({ orderId });

      // Protection: Never overwrite already PAID transaction
      if (existing && existing.status === 'PAID') {
        logger.warn('Ignoring payment.failed webhook for already PAID transaction.', { orderId });
        return { received: true, ignored: true };
      }

      const transaction = await PaymentTransaction.findOneAndUpdate(
        { orderId, status: { $ne: 'PAID' } },
        { status: 'FAILED', paymentId: payment.id },
        { new: true }
      );
      if (transaction) {
        await Appointment.findByIdAndUpdate(transaction.appointmentId, {
          paymentStatus: 'FAILED',
          status: 'PAYMENT_FAILED',
        });
        logger.info('Appointment payment marked failed via verified Razorpay webhook.', { orderId });
      }
    }

    return { received: true };
  }
}

module.exports = new PaymentService();
