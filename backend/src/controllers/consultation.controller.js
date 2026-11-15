const consultationService = require('../services/consultation.service');
const { successResponse, errorResponse } = require('../utils/response');

class ConsultationController {
  // AI Doctor Consultation
  async startAIDoctorSession(req, res, next) {
    try {
      const data = await consultationService.startAIDoctorSession(req.user.id, req.body);
      return successResponse(res, data, 'AI Doctor consultation initialized.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'AI_SESSION_INIT_FAILED');
    }
  }

  async sendAIDoctorMessage(req, res, next) {
    try {
      const data = await consultationService.sendAIDoctorMessage(req.params.id, req.user.id, req.body);
      return successResponse(res, data, 'AI Doctor response generated.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'AI_MESSAGE_FAILED');
    }
  }

  async endAIDoctorSession(req, res, next) {
    try {
      const data = await consultationService.endAIDoctorSession(req.params.id, req.user.id);
      return successResponse(res, data, 'AI Doctor consultation ended and summarized.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'AI_SESSION_END_FAILED');
    }
  }

  async deleteAIDoctorConsultation(req, res, next) {
    try {
      const data = await consultationService.deleteAIDoctorConsultation(req.params.id, req.user.id);
      return successResponse(res, data, 'Consultation removed.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'DELETE_FAILED');
    }
  }

  // Consultation History & Details
  async listPatientConsultations(req, res, next) {
    try {
      const { category, page, limit } = req.query;
      const data = await consultationService.listPatientConsultations(req.user.id, { category, page, limit });
      return successResponse(res, data, 'Consultations retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'CONSULTATION_LIST_FAILED');
    }
  }

  async getConsultationById(req, res, next) {
    try {
      const data = await consultationService.getConsultationById(req.params.id, req.user.id);
      return successResponse(res, data, 'Consultation details retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 404, 'NOT_FOUND');
    }
  }

  // AI-Assisted Pre-Consultation Summary for Real Doctor
  async generatePreConsultationSummary(req, res, next) {
    try {
      const data = await consultationService.generatePreConsultationSummary(req.params.appointmentId, req.user.id);
      return successResponse(res, data, 'Draft pre-consultation summary generated for patient review.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'SUMMARY_GENERATION_FAILED');
    }
  }

  async approvePreConsultationSummary(req, res, next) {
    try {
      const data = await consultationService.approvePreConsultationSummary(req.params.appointmentId, req.user.id, req.body.approvedSummary);
      return successResponse(res, data, 'Pre-consultation summary approved for sharing with doctor.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'APPROVAL_FAILED');
    }
  }

  // Real Doctor Consultation
  async getOrCreateConsultation(req, res, next) {
    try {
      const data = await consultationService.getOrCreateConsultation(req.params.appointmentId, req.user.id, req.user.role);
      return successResponse(res, data, 'Consultation session ready.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'SESSION_ERROR');
    }
  }

  async getVideoToken(req, res, next) {
    try {
      const data = await consultationService.generateVideoToken(req.params.appointmentId, req.user.id, req.user.role);
      return successResponse(res, data, 'Consultation video room token generated.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'TOKEN_GENERATION_FAILED');
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
