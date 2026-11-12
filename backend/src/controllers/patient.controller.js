const patientService = require('../services/patient.service');
const redisSessionService = require('../services/redisSession.service');
const { successResponse, errorResponse } = require('../utils/response');

class PatientController {
  async getProfile(req, res, next) {
    try {
      const data = await patientService.getProfile(req.user.id);
      return successResponse(res, data, 'Patient profile retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 404, 'PATIENT_NOT_FOUND');
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updated = await patientService.updateProfile(req.user.id, req.body);
      return successResponse(res, updated, 'Profile updated successfully.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'UPDATE_FAILED');
    }
  }

  async addEmergencyContact(req, res, next) {
    try {
      const contact = await patientService.addEmergencyContact(req.user.id, req.body);
      return successResponse(res, contact, 'Emergency contact saved.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'CONTACT_CREATION_FAILED');
    }
  }

  async deleteEmergencyContact(req, res, next) {
    try {
      await patientService.deleteEmergencyContact(req.user.id, req.params.id);
      return successResponse(res, null, 'Emergency contact removed.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'DELETE_FAILED');
    }
  }

  async getSession(req, res, next) {
    try {
      const sessionId = req.headers['x-session-id'] || req.sessionId;
      if (!sessionId) {
        return successResponse(res, null, 'No active ephemeral session header.');
      }
      const session = await redisSessionService.getSession(sessionId);
      return successResponse(res, session, 'Active session context retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'SESSION_RETRIEVAL_ERROR');
    }
  }

  async updateSession(req, res, next) {
    try {
      const sessionId = req.headers['x-session-id'] || req.sessionId;
      if (!sessionId) {
        return errorResponse(res, 'Missing X-Session-ID header.', 400, 'SESSION_ID_REQUIRED');
      }
      const result = await redisSessionService.setSession(sessionId, req.body);
      return successResponse(res, result, 'Ephemeral session updated.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'SESSION_UPDATE_ERROR');
    }
  }

  async forgetMe(req, res, next) {
    try {
      const sessionId = req.headers['x-session-id'] || req.sessionId;
      const userId = req.user?.id;
      const result = await patientService.executeForgetMe(userId, sessionId, req.ip);
      return successResponse(res, result, 'All temporary health data permanently purged.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'PURGE_FAILED');
    }
  }

  async recordConsent(req, res, next) {
    try {
      const consent = await patientService.recordConsent(req.user.id, req.body, req.ip);
      return successResponse(res, consent, 'Consent preferences updated.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'CONSENT_FAILED');
    }
  }

  async getConsents(req, res, next) {
    try {
      const consents = await patientService.getConsents(req.user.id);
      return successResponse(res, consents, 'Patient consents retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'RETRIEVAL_ERROR');
    }
  }

  // --- Medications ---
  async getMedications(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return successResponse(res, [], 'No active session.');
      const data = await patientService.getMedications(userId);
      return successResponse(res, data, 'Medications retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'MED_RETRIEVAL_ERROR');
    }
  }

  async addMedication(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return errorResponse(res, 'Authentication required to save medications.', 401, 'UNAUTHORIZED');
      const med = await patientService.addMedication(userId, req.body);
      return successResponse(res, med, 'Medication schedule saved.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'MED_CREATION_FAILED');
    }
  }

  async logMedicationAdherence(req, res, next) {
    try {
      const userId = req.user?.id;
      const { taken } = req.body;
      const updated = await patientService.logMedicationAdherence(userId, req.params.id, taken);
      return successResponse(res, updated, 'Adherence status logged.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'LOG_FAILED');
    }
  }

  async deleteMedication(req, res, next) {
    try {
      const userId = req.user?.id;
      await patientService.deleteMedication(userId, req.params.id);
      return successResponse(res, null, 'Medication removed.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'DELETE_FAILED');
    }
  }

  // --- Vitals ---
  async getVitals(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return successResponse(res, [], 'No active session.');
      const data = await patientService.getVitals(userId, req.query.type);
      return successResponse(res, data, 'Vitals retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'VITALS_ERROR');
    }
  }

  async logVital(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return errorResponse(res, 'Authentication required to record vitals.', 401, 'UNAUTHORIZED');
      const vital = await patientService.logVital(userId, req.body);
      return successResponse(res, vital, 'Vital recorded successfully.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'LOG_VITAL_FAILED');
    }
  }

  // --- Wellness & Sleep ---
  async getWellnessLogs(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return successResponse(res, [], 'No active session.');
      const data = await patientService.getWellnessLogs(userId);
      return successResponse(res, data, 'Wellness logs retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'WELLNESS_ERROR');
    }
  }

  async logWellness(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return errorResponse(res, 'Authentication required to log wellness.', 401, 'UNAUTHORIZED');
      const log = await patientService.logWellness(userId, req.body);
      return successResponse(res, log, 'Wellness entry saved.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'LOG_WELLNESS_FAILED');
    }
  }

  // --- Family Members ---
  async getFamilyMembers(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return successResponse(res, [], 'No active session.');
      const data = await patientService.getFamilyMembers(userId);
      return successResponse(res, data, 'Family profiles retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'FAMILY_ERROR');
    }
  }

  async addFamilyMember(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return errorResponse(res, 'Authentication required to add family member.', 401, 'UNAUTHORIZED');
      const member = await patientService.addFamilyMember(userId, req.body);
      return successResponse(res, member, 'Family member added.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'ADD_FAMILY_FAILED');
    }
  }

  async deleteFamilyMember(req, res, next) {
    try {
      const userId = req.user?.id;
      await patientService.deleteFamilyMember(userId, req.params.id);
      return successResponse(res, null, 'Family member removed.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'DELETE_FAMILY_FAILED');
    }
  }

  // --- Lab Orders ---
  async getLabOrders(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return successResponse(res, [], 'No active session.');
      const data = await patientService.getLabOrders(userId);
      return successResponse(res, data, 'Lab test bookings retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'LAB_ERROR');
    }
  }

  async createLabOrder(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) return errorResponse(res, 'Authentication required to schedule lab tests.', 401, 'UNAUTHORIZED');
      const order = await patientService.createLabOrder(userId, req.body);
      return successResponse(res, order, 'Diagnostic test scheduled.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'LAB_ORDER_FAILED');
    }
  }
}

module.exports = new PatientController();
