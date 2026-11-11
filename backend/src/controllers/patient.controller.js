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
}

module.exports = new PatientController();
