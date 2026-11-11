const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  registerSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} = require('../validators/auth.validator');

// Registration & Authentication
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);

// OTP Verification Pipeline
router.post('/otp/send', authLimiter, validate(sendOTPSchema), authController.sendOTP);
router.post('/otp/verify', authLimiter, validate(verifyOTPSchema), authController.verifyOTP);
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), authController.verifyOTP); // Client alias

// Password Recovery
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Identity Verification
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
