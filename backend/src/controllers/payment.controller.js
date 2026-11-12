const paymentService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/response');

class PaymentController {
  getConfig(req, res) {
    try {
      const config = paymentService.getPaymentConfig();
      return successResponse(res, config, 'Payment configuration retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'PAYMENT_CONFIG_ERROR');
    }
  }

  async createOrder(req, res, next) {
    try {
      const { appointmentId, amount, currency, idempotencyKey } = req.body;
      const { Appointment } = require('../models');
      const appointment = await Appointment.findById(appointmentId);
      const patientId = req.user?.id || (appointment ? appointment.patientId : null);
      const order = await paymentService.createPaymentOrder({
        appointmentId,
        patientId,
        amount,
        currency,
        idempotencyKey,
      });
      return successResponse(res, order, 'Payment order initialized.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'PAYMENT_ORDER_ERROR');
    }
  }

  async verifySignature(req, res, next) {
    try {
      const { orderId, paymentId, signature, appointmentId } = req.body;
      if (!orderId || !paymentId || !signature) {
        return errorResponse(res, 'orderId, paymentId, and signature are required.', 400, 'VALIDATION_ERROR');
      }
      const result = await paymentService.verifyPaymentSignature({
        orderId,
        paymentId,
        signature,
        appointmentId,
      });
      return successResponse(res, result, 'Payment signature verified successfully.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'SIGNATURE_VERIFICATION_FAILED');
    }
  }

  async initiateUpi(req, res, next) {
    try {
      const { appointmentId, paymentType, amount } = req.body;
      if (!appointmentId) {
        return errorResponse(res, 'appointmentId is required to initiate payment.', 400, 'VALIDATION_ERROR');
      }
      const { Appointment } = require('../models');
      const appointment = await Appointment.findById(appointmentId);
      const patientId = req.user?.id || (appointment ? appointment.patientId : null);
      const result = await paymentService.initiateManualUpi({
        appointmentId,
        patientId,
        paymentType,
        amount,
      });
      return successResponse(res, result, 'Manual UPI payment reference initialized.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'UPI_INITIATION_ERROR');
    }
  }

  async submitUpiUtr(req, res, next) {
    try {
      const { transactionId, utrNumber, receiptUrl } = req.body;
      if (!transactionId || !utrNumber) {
        return errorResponse(res, 'transactionId and utrNumber are required.', 400, 'VALIDATION_ERROR');
      }
      const { PaymentTransaction } = require('../models');
      const transaction = await PaymentTransaction.findById(transactionId);
      const patientId = req.user?.id || (transaction ? transaction.patientId : null);
      const result = await paymentService.submitUpiUtr({
        transactionId,
        patientId,
        utrNumber,
        receiptUrl,
      });
      return successResponse(res, result, 'UTR submitted. Awaiting administrative reconciliation.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'UTR_SUBMISSION_ERROR');
    }
  }

  async getMyTransactions(req, res, next) {
    try {
      const transactions = await paymentService.getPatientTransactions(req.user.id);
      return successResponse(res, transactions, 'Payment history retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'HISTORY_FETCH_ERROR');
    }
  }

  async requestRefund(req, res, next) {
    try {
      const { transactionId, reason } = req.body;
      if (!transactionId || !reason) {
        return errorResponse(res, 'transactionId and reason are required.', 400, 'VALIDATION_ERROR');
      }
      const result = await paymentService.requestRefund({
        transactionId,
        patientId: req.user.id,
        reason,
      });
      return successResponse(res, result, 'Refund request submitted.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'REFUND_REQUEST_ERROR');
    }
  }

  async adminGetPending(req, res, next) {
    try {
      const pending = await paymentService.getPendingReconciliations();
      return successResponse(res, pending, 'Pending reconciliations retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'RECONCILIATION_FETCH_ERROR');
    }
  }

  async adminVerify(req, res, next) {
    try {
      const { transactionId, notes } = req.body;
      if (!transactionId) {
        return errorResponse(res, 'transactionId is required.', 400, 'VALIDATION_ERROR');
      }
      const result = await paymentService.adminVerifyUpiPayment({
        transactionId,
        adminUserId: req.user.id,
        notes,
      });
      return successResponse(res, result, 'Payment verified successfully.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'VERIFICATION_ERROR');
    }
  }

  async adminReject(req, res, next) {
    try {
      const { transactionId, reason } = req.body;
      if (!transactionId || !reason) {
        return errorResponse(res, 'transactionId and reason are required.', 400, 'VALIDATION_ERROR');
      }
      const result = await paymentService.adminRejectUpiPayment({
        transactionId,
        adminUserId: req.user.id,
        reason,
      });
      return successResponse(res, result, 'Payment transaction rejected.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'REJECTION_ERROR');
    }
  }

  async adminRefundProcess(req, res, next) {
    try {
      const { transactionId, refundNotes } = req.body;
      if (!transactionId) {
        return errorResponse(res, 'transactionId is required.', 400, 'VALIDATION_ERROR');
      }
      const result = await paymentService.adminProcessRefund({
        transactionId,
        adminUserId: req.user.id,
        refundNotes,
      });
      return successResponse(res, result, 'Refund processed successfully.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'REFUND_PROCESS_ERROR');
    }
  }

  async handleWebhook(req, res, next) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = req.body;
      const result = await paymentService.handleWebhook(rawBody, signature);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new PaymentController();
