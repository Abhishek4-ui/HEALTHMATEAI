const { User, PatientProfile, DoctorProfile, RefreshToken, UserSession, AuditLog } = require('../models');
const { hashPassword, verifyPassword } = require('../security/argon2');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../security/jwt');
const otpService = require('./otp.service');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new Patient or Doctor
   */
  async register(data, ipAddress = '127.0.0.1') {
    const { email, password, fullName, phone, role } = data;

    if (role === 'ADMINISTRATION') {
      throw new Error('Administration accounts cannot be registered publicly. They must be provisioned by system architects.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('An account with this email address already exists.');
    }

    // 1. Hash password with Argon2id
    const passwordHash = await hashPassword(password);

    // 2. Create User record
    const user = await User.create({
      email: email.toLowerCase(),
      phone: phone || null,
      passwordHash,
      fullName,
      role,
      status: role === 'DOCTOR' ? 'PENDING_APPROVAL' : 'ACTIVE',
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    // 3. Create role-specific profile record
    if (role === 'PATIENT') {
      await PatientProfile.create({
        userId: user._id,
      });
    } else if (role === 'DOCTOR') {
      await DoctorProfile.create({
        userId: user._id,
        fullName,
        medicalRegistrationNumber: data.medicalRegistrationNumber,
        stateMedicalCouncil: data.stateMedicalCouncil,
        specialization: data.specialization,
        experienceYears: data.experienceYears,
        verificationStatus: 'DISCOVERED',
        consultationFee: 500,
        address: {
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
        },
      });
    }

    // 4. Audit Log
    await AuditLog.create({
      actorId: user._id,
      actorRole: role,
      action: 'REGISTER_ACCOUNT',
      ipAddress,
      statusCode: 201,
      metadata: { email: user.email, role },
    });

    // 5. Send verification OTP (to both email and phone when provided)
    const otpResult = await otpService.sendOTP(user.email, 'EMAIL', 'VERIFICATION');
    if (user.phone) {
      await otpService.sendOTP(user.phone, 'MOBILE', 'VERIFICATION').catch(() => {});
    }

    return {
      id: user._id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      otp: otpResult.rawOTP,
      message: 'Account registered. Verification code sent to email and phone.',
    };
  }

  /**
   * Authenticate user and issue tokens
   */
  async login({ email, password, role }, ipAddress = '127.0.0.1', userAgent = '') {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.role !== role) {
      throw new Error(`Account role mismatch. You cannot log into the ${role} portal with a ${user.role} account.`);
    }

    if (user.status === 'SUSPENDED') {
      throw new Error('This account has been suspended by administration.');
    }

    // Verify Argon2id password
    const isPasswordValid = await verifyPassword(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    // Issue short-lived access token and rotating refresh token
    const accessToken = generateAccessToken(user);
    const { token: rawRefreshToken, tokenHash, expiresAt } = generateRefreshToken();

    // Persist refresh token hash
    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    // Update user session metadata
    user.lastLoginAt = new Date();
    await user.save();

    // Audit Log
    await AuditLog.create({
      actorId: user._id,
      actorRole: user.role,
      action: 'LOGIN_SUCCESS',
      ipAddress,
      statusCode: 200,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status,
      },
    };
  }

  /**
   * Refresh Token Rotation
   */
  async refreshToken(rawRefreshToken, ipAddress = '127.0.0.1', userAgent = '') {
    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
      throw new Error('Invalid refresh token.');
    }

    if (storedToken.isRevoked) {
      // Possible token reuse attack detected! Revoke all tokens for this user family
      await RefreshToken.updateMany({ userId: storedToken.userId }, { isRevoked: true });
      logger.warn('Token reuse attempt detected. All user sessions invalidated.', { userId: storedToken.userId });
      throw new Error('Invalid or compromised session token. Please sign in again.');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new Error('Refresh token has expired. Please sign in again.');
    }

    const user = await User.findById(storedToken.userId);
    if (!user || user.status === 'SUSPENDED') {
      throw new Error('User account not found or suspended.');
    }

    // Rotate refresh token
    const { token: newRawRefreshToken, tokenHash: newTokenHash, expiresAt } = generateRefreshToken();

    storedToken.isRevoked = true;
    storedToken.replacedByTokenHash = newTokenHash;
    await storedToken.save();

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newTokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    const newAccessToken = generateAccessToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  /**
   * Log out from active session
   */
  async logout(rawRefreshToken, userId) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await RefreshToken.updateOne({ tokenHash }, { isRevoked: true });
    }

    if (userId) {
      await AuditLog.create({
        actorId: userId,
        actorRole: 'PATIENT',
        action: 'LOGOUT',
        statusCode: 200,
      });
    }

    return { success: true, message: 'Logged out successfully.' };
  }

  /**
   * Reset Password with OTP verification
   */
  async resetPassword({ email, otp, newPassword }) {
    await otpService.verifyOTP(email, 'EMAIL', otp, 'PASSWORD_RESET');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('User not found.');
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    // Revoke all existing sessions
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

    return { success: true, message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  /**
   * Secure Initial Administrator Provisioning
   * Idempotent check: Creates initial admin only if no administration user exists
   */
  async provisionInitialAdmin(adminEmail = 'admin@healthmate.ai', adminPassword = 'AdminPassword123!', adminName = 'System Administrator') {
    const existingAdmin = await User.findOne({
      $or: [{ role: 'ADMINISTRATION' }, { email: adminEmail.toLowerCase() }]
    });
    if (existingAdmin) {
      return { created: false, message: 'Administrator account already exists.' };
    }

    const passwordHash = await hashPassword(adminPassword);
    const admin = await User.create({
      email: adminEmail.toLowerCase(),
      fullName: adminName,
      passwordHash,
      role: 'ADMINISTRATION',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true,
      mfaEnabled: true,
    });

    logger.info('Initial platform administrator account provisioned securely.', { email: admin.email });
    return { created: true, email: admin.email };
  }
}

module.exports = new AuthService();
