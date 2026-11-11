const prescriptionService = require('../services/prescription.service');
const { successResponse, errorResponse } = require('../utils/response');

class PrescriptionController {
  async createPrescription(req, res, next) {
    try {
      const prescription = await prescriptionService.createPrescription(req.user.id, req.body);
      return successResponse(res, prescription, 'Prescription digitally signed and issued.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'PRESCRIPTION_FAILED');
    }
  }

  async listPrescriptions(req, res, next) {
    try {
      const prescriptions = await prescriptionService.listPrescriptions(req.user.id, req.user.role);
      return successResponse(res, prescriptions, 'Prescriptions retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'RETRIEVAL_ERROR');
    }
  }

  async verifySignature(req, res, next) {
    try {
      const verification = await prescriptionService.verifySignature(req.params.id);
      return successResponse(res, verification, 'Digital signature verified.');
    } catch (err) {
      return errorResponse(res, err.message, 404, 'VERIFICATION_ERROR');
    }
  }
}

module.exports = new PrescriptionController();
