const consultationService = require('../services/consultation.service');
const { successResponse, errorResponse } = require('../utils/response');

class ConsultationController {
  async getOrCreateConsultation(req, res, next) {
    try {
      const data = await consultationService.getOrCreateConsultation(req.params.appointmentId, req.user.id, req.user.role);
      return successResponse(res, data, 'Consultation session ready.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'SESSION_ERROR');
    }
  }

  async updateSoapNotes(req, res, next) {
    try {
      const updated = await consultationService.updateSoapNotes(req.params.id, req.user.id, req.body);
      return successResponse(res, updated, 'SOAP clinical notes recorded.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'NOTES_UPDATE_FAILED');
    }
  }

  async completeConsultation(req, res, next) {
    try {
      const completed = await consultationService.completeConsultation(req.params.id, req.user.id);
      return successResponse(res, completed, 'Consultation marked completed.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'COMPLETION_FAILED');
    }
  }
}

module.exports = new ConsultationController();
