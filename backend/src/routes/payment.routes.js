const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

// Create payment order (Patient only)
router.post('/order', authenticateToken, requireRoles(['PATIENT']), paymentController.createOrder);

// Webhook endpoint (Requires raw body for HMAC SHA256 signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
