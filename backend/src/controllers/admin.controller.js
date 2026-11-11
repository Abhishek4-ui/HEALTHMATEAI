const monitoringService = require('../services/monitoring.service');
const auditService = require('../services/audit.service');
const { DoctorVerification, DoctorProfile, User, Hospital } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

class AdminController {
  async getOverview(req, res, next) {
    try {
      const overview = await monitoringService.getOverview();
      return successResponse(res, overview, 'Administration metrics retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'OVERVIEW_ERROR');
    }
  }

  async listDoctorVerifications(req, res, next) {
    try {
      const queue = await DoctorVerification.find({ status: 'PENDING_ADMIN_REVIEW' })
        .populate('doctorId')
        .populate('userId', 'fullName email phone');
      return successResponse(res, queue, 'Doctor verification queue retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'QUEUE_ERROR');
    }
  }

  async reviewDoctorVerification(req, res, next) {
    try {
      const { id } = req.params;
      const { decision, notes } = req.body; // 'APPROVED' or 'REJECTED'

      const verification = await DoctorVerification.findById(id);
      if (!verification) {
        return errorResponse(res, 'Verification request not found.', 404, 'NOT_FOUND');
      }

      verification.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
      verification.reviewedByAdminId = req.user.id;
      verification.reviewedAt = new Date();
      verification.adminNotes = notes || '';
      await verification.save();

      // Update doctor profile tier
      await DoctorProfile.findByIdAndUpdate(verification.doctorId, {
        verificationStatus: decision === 'APPROVED' ? 'CREDENTIAL_VERIFIED' : 'DISCOVERED',
        verifiedByAdminId: req.user.id,
        verifiedAt: new Date(),
      });

      // Update user status
      await User.findByIdAndUpdate(verification.userId, {
        status: decision === 'APPROVED' ? 'ACTIVE' : 'SUSPENDED',
      });

      await auditService.recordEvent({
        actorId: req.user.id,
        actorRole: 'ADMINISTRATION',
        action: decision === 'APPROVED' ? 'APPROVE_DOCTOR' : 'REJECT_DOCTOR',
        targetResource: { resourceType: 'DOCTOR_VERIFICATION', resourceId: id },
        ipAddress: req.ip,
        statusCode: 200,
      });

      return successResponse(res, verification, `Doctor registration ${decision.toLowerCase()}.`);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'VERIFICATION_REVIEW_ERROR');
    }
  }

  async listPatients(req, res, next) {
    try {
      const patients = await User.find({ role: 'PATIENT' })
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .limit(50);
      return successResponse(res, patients, 'Patient accounts retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'PATIENT_LIST_ERROR');
    }
  }

  async listDoctors(req, res, next) {
    try {
      const doctors = await DoctorProfile.find()
        .populate('userId', 'email phone isEmailVerified status')
        .sort({ createdAt: -1 });
      return successResponse(res, doctors, 'Doctor profiles retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'DOCTOR_LIST_ERROR');
    }
  }

  async getIntegrations(req, res, next) {
    try {
      const integrations = await monitoringService.getIntegrationStatuses();
      return successResponse(res, integrations, 'External integration health retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'INTEGRATION_STATUS_ERROR');
    }
  }

  async getAIModels(req, res, next) {
    try {
      const models = await monitoringService.getAIModels();
      return successResponse(res, models, 'AI model metadata retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'AI_MODELS_ERROR');
    }
  }

  async getDatasets(req, res, next) {
    try {
      const datasets = await monitoringService.getDatasets();
      return successResponse(res, datasets, 'Research datasets retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'DATASETS_ERROR');
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const result = await auditService.queryLogs(req.query);
      return successResponse(res, result, 'Audit logs retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'AUDIT_LOG_ERROR');
    }
  }
}

module.exports = new AdminController();
