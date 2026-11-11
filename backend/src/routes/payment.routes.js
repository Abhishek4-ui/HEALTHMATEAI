const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

// Create payment order (Patient only)
router.post('/order', authenticateToken, requireRoles(['PATIENT']), paymentController.createOrder);

// Verify payment signature after Razorpay checkout (Patient only)
router.post('/verify-signature', authenticateToken, requireRoles(['PATIENT']), paymentController.verifySignature);

// Webhook endpoint (Requires raw body for HMAC SHA256 signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
