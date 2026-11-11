const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body, req.ip);
      return successResponse(res, result, 'Registration successful. Verification code dispatched.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'REGISTRATION_FAILED');
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body, req.ip, req.headers['user-agent']);
      return successResponse(res, result, 'Login successful.');
    } catch (err) {
      return errorResponse(res, err.message, 401, 'AUTHENTICATION_FAILED');
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken, req.ip, req.headers['user-agent']);
      return successResponse(res, result, 'Token refreshed successfully.');
    } catch (err) {
      return errorResponse(res, err.message, 401, 'REFRESH_TOKEN_EXPIRED');
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.body?.refreshToken;
      const userId = req.user?.id;
      const result = await authService.logout(refreshToken, userId);
      return successResponse(res, result, 'Logged out successfully.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'LOGOUT_ERROR');
    }
  }

  async sendOTP(req, res, next) {
    try {
      const { target, type, purpose, phone } = req.body;
      const result = await otpService.sendOTP(target, type, purpose);
      if (phone) {
        await otpService.sendOTP(phone, 'MOBILE', purpose || 'VERIFICATION', result.rawOTP).catch(() => {});
      }
      return successResponse(res, result, 'Verification code dispatched.');
    } catch (err) {
      return errorResponse(res, err.message, 429, 'OTP_DISPATCH_LIMIT');
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { target, type, otp, purpose, phone } = req.body;
      const communicationService = require('../services/communication.service');

      // 1. Direct Twilio Verify carrier check if phone is available
      const phoneCandidate = phone || (type === 'MOBILE' ? target : null);
      if (phoneCandidate) {
        const twCheck = await communicationService.checkTwilioVerify({ to: phoneCandidate, code: otp });
        if (twCheck && twCheck.success) {
          return successResponse(res, { verified: true }, 'Code verified successfully via SMS.');
        }
      }

      // 2. Standard internal store verification check
      let verified = false;
      try {
        verified = await otpService.verifyOTP(target, type, otp, purpose);
      } catch (primaryErr) {
        if (phone && phone !== target) {
          try {
            verified = await otpService.verifyOTP(phone, 'MOBILE', otp, purpose);
          } catch (phoneErr) {
            throw primaryErr;
          }
        } else {
          throw primaryErr;
        }
      }
      return successResponse(res, { verified }, 'Code verified successfully.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'OTP_VERIFICATION_FAILED');
    }
  }

  async forgotPassword(req, res, next) {
    try {
      await otpService.sendOTP(req.body.email, 'EMAIL', 'PASSWORD_RESET');
      return successResponse(res, { email: req.body.email }, 'Password reset code sent to your email.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'FORGOT_PASSWORD_ERROR');
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      return successResponse(res, result, 'Password reset successfully.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'RESET_PASSWORD_ERROR');
    }
  }

  async getMe(req, res, next) {
    try {
      return successResponse(res, { user: req.user }, 'User identity verified.');
    } catch (err) {
      return errorResponse(res, 'Session invalid.', 401, 'UNAUTHORIZED');
    }
  }
}

module.exports = new AuthController();
