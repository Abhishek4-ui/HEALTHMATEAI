const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

// Public / Patient configuration discovery
router.get('/config', (req, res) => paymentController.getConfig(req, res));

// Razorpay Test Mode Workflow (Patient & Guest)
router.post('/order', optionalAuth, paymentController.createOrder);
router.post('/verify-signature', optionalAuth, paymentController.verifySignature);

// Manual UPI Payment Workflow (Patient & Guest)
router.post('/upi/initiate', optionalAuth, (req, res, next) => paymentController.initiateUpi(req, res, next));
router.post('/upi/submit-utr', optionalAuth, (req, res, next) => paymentController.submitUpiUtr(req, res, next));
router.get('/my-transactions', optionalAuth, (req, res, next) => paymentController.getMyTransactions(req, res, next));
router.post('/refund-request', optionalAuth, (req, res, next) => paymentController.requestRefund(req, res, next));

// Admin Manual Payment Reconciliation & Refund Management (Administration only)
router.get('/admin/pending', authenticateToken, requireRoles(['ADMINISTRATION']), (req, res, next) => paymentController.adminGetPending(req, res, next));
router.post('/admin/verify', authenticateToken, requireRoles(['ADMINISTRATION']), (req, res, next) => paymentController.adminVerify(req, res, next));
router.post('/admin/reject', authenticateToken, requireRoles(['ADMINISTRATION']), (req, res, next) => paymentController.adminReject(req, res, next));
router.post('/admin/refund-process', authenticateToken, requireRoles(['ADMINISTRATION']), (req, res, next) => paymentController.adminRefundProcess(req, res, next));

// Razorpay Webhook endpoint (Requires raw body for HMAC SHA256 signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
