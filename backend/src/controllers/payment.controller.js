const paymentService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/response');

class PaymentController {
  async createOrder(req, res, next) {
    try {
      const { appointmentId, amount, currency, idempotencyKey } = req.body;
      const order = await paymentService.createPaymentOrder({
        appointmentId,
        patientId: req.user.id,
        amount,
        currency,
        idempotencyKey,
      });
      return successResponse(res, order, 'Payment order initialized.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'PAYMENT_ORDER_ERROR');
    }
  }

  async handleWebhook(req, res, next) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = req.body; // Buffer or raw string from raw middleware
      const result = await paymentService.handleWebhook(rawBody, signature);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new PaymentController();
