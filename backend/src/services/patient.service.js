const { PatientProfile, User, EmergencyContact, Consent, AuditLog } = require('../models');
const redisSessionService = require('./redisSession.service');

class PatientService {
  /**
   * Get patient profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) throw new Error('Patient not found.');

    let profile = await PatientProfile.findOne({ userId });
    if (!profile) {
      profile = await PatientProfile.create({ userId });
    }

    const emergencyContacts = await EmergencyContact.find({ patientId: userId });

    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      profile,
      emergencyContacts,
    };
  }

  /**
   * Update patient profile
   */
  async updateProfile(userId, updateData) {
    if (updateData.fullName) {
      await User.findByIdAndUpdate(userId, { fullName: updateData.fullName });
    }

    const profile = await PatientProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return profile;
  }

  /**
   * Add emergency contact
   */
  async addEmergencyContact(userId, contactData) {
    const count = await EmergencyContact.countDocuments({ patientId: userId });
    if (count >= 5) {
      throw new Error('Maximum limit of 5 emergency contacts reached.');
    }

    return await EmergencyContact.create({
      patientId: userId,
      ...contactData,
    });
  }

  /**
   * Remove emergency contact
   */
  async deleteEmergencyContact(userId, contactId) {
    return await EmergencyContact.findOneAndDelete({ _id: contactId, patientId: userId });
  }

  /**
   * Record statutory consent under DPDP Act 2023
   */
  async recordConsent(userId, { consentType, status, purposeDescription }, ipAddress = '127.0.0.1') {
    const consent = await Consent.create({
      patientId: userId,
      consentType,
      status,
      purposeDescription,
      ipAddress,
      grantedAt: status === 'GRANTED' ? new Date() : null,
      revokedAt: status === 'REVOKED' ? new Date() : null,
    });

    await AuditLog.create({
      actorId: userId,
      actorRole: 'PATIENT',
      action: status === 'GRANTED' ? 'GRANT_CONSENT' : 'REVOKE_CONSENT',
      targetResource: { resourceType: 'CONSENT', resourceId: consent._id.toString() },
      ipAddress,
      statusCode: 200,
      metadata: { consentType, status },
    });

    return consent;
  }

  /**
   * List active patient consents
   */
  async getConsents(userId) {
    return await Consent.find({ patientId: userId }).sort({ createdAt: -1 });
  }

  /**
   * Execute DPDP "Forget Me" operation
   * Purges all ephemeral memory buffers in Redis
   */
  async executeForgetMe(userId, sessionId, ipAddress = '127.0.0.1') {
    let purged = false;
    if (sessionId) {
      purged = await redisSessionService.purgeSession(sessionId);
      try {
        const reportService = require('./report.service');
        await reportService.deleteReport(sessionId);
      } catch (err) {
        // Continue if no file with that token exists
      }
    }

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      await AuditLog.create({
        actorId: userId || null,
        actorRole: userId ? 'PATIENT' : 'GUEST',
        action: 'PURGE_EPHEMERAL_SESSION',
        targetResource: { resourceType: 'REDIS_SESSION', resourceId: sessionId },
        ipAddress,
        statusCode: 200,
      });
    }

    return {
      success: true,
      purged,
      message: 'All temporary health inputs, AI dialogue, and report extraction tokens have been completely wiped.',
    };
  }
}

module.exports = new PatientService();
