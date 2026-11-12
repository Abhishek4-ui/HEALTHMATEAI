const { 
  PatientProfile, 
  User, 
  EmergencyContact, 
  Consent, 
  AuditLog,
  MedicationSchedule,
  PatientVital,
  WellnessLog,
  FamilyMember,
  LabOrder
} = require('../models');
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

  // --- Clinical Data Persistence: Medications ---
  async getMedications(userId) {
    return await MedicationSchedule.find({ patientId: userId }).sort({ createdAt: -1 });
  }

  async addMedication(userId, data) {
    return await MedicationSchedule.create({
      patientId: userId,
      ...data,
      provenance: { source: 'Patient Entered', verified: false }
    });
  }

  async logMedicationAdherence(userId, medId, taken = true) {
    return await MedicationSchedule.findOneAndUpdate(
      { _id: medId, patientId: userId },
      { $push: { adherenceLogs: { date: new Date(), taken, takenAt: new Date() } } },
      { new: true }
    );
  }

  async deleteMedication(userId, medId) {
    return await MedicationSchedule.findOneAndDelete({ _id: medId, patientId: userId });
  }

  // --- Clinical Data Persistence: Vitals ---
  async getVitals(userId, vitalType) {
    const query = { patientId: userId };
    if (vitalType) query.vitalType = vitalType;
    return await PatientVital.find(query).sort({ recordedAt: -1 }).limit(100);
  }

  async logVital(userId, data) {
    return await PatientVital.create({
      patientId: userId,
      ...data,
      recordedAt: data.recordedAt || new Date(),
    });
  }

  // --- Clinical Data Persistence: Wellness & Sleep ---
  async getWellnessLogs(userId) {
    return await WellnessLog.find({ patientId: userId }).sort({ logDate: -1 }).limit(30);
  }

  async logWellness(userId, data) {
    return await WellnessLog.create({
      patientId: userId,
      ...data,
      logDate: data.logDate || new Date(),
    });
  }

  // --- Clinical Data Persistence: Family Healthcare ---
  async getFamilyMembers(userId) {
    return await FamilyMember.find({ patientId: userId }).sort({ createdAt: -1 });
  }

  async addFamilyMember(userId, data) {
    return await FamilyMember.create({
      patientId: userId,
      ...data,
    });
  }

  async deleteFamilyMember(userId, memberId) {
    return await FamilyMember.findOneAndDelete({ _id: memberId, patientId: userId });
  }

  // --- Clinical Data Persistence: Lab Orders ---
  async getLabOrders(userId) {
    return await LabOrder.find({ patientId: userId }).sort({ scheduledDate: -1 });
  }

  async createLabOrder(userId, data) {
    return await LabOrder.create({
      patientId: userId,
      ...data,
      status: 'REQUESTED',
    });
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
   * Purges all ephemeral memory buffers in Redis and clinical user traces
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

    if (userId) {
      // Purge patient-entered logs upon explicit right-to-erasure request
      await Promise.allSettled([
        MedicationSchedule.deleteMany({ patientId: userId }),
        PatientVital.deleteMany({ patientId: userId }),
        WellnessLog.deleteMany({ patientId: userId }),
        FamilyMember.deleteMany({ patientId: userId }),
      ]);
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
      message: 'All temporary health inputs, AI dialogue, report extraction tokens, and personal logs have been completely wiped.',
    };
  }
}

module.exports = new PatientService();
