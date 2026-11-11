const monitoringService = require('../services/monitoring.service');
const auditService = require('../services/audit.service');
const syncService = require('../services/sync.service');
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

  async getSyncStatus(req, res, next) {
    try {
      const status = await syncService.getSyncStatus();
      return successResponse(res, status, 'Synchronization status retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'SYNC_STATUS_ERROR');
    }
  }

  async triggerSync(req, res, next) {
    try {
      const result = await syncService.executeSyncJob(req.body.triggerType || 'ADMIN_MANUAL');
      await auditService.recordEvent({
        actorId: req.user.id,
        actorRole: 'ADMINISTRATION',
        action: 'TRIGGER_DATA_SYNC',
        targetResource: { resourceType: 'SYNC_JOB', resourceId: result.jobId },
        ipAddress: req.ip,
        statusCode: 200,
      });
      return successResponse(res, result, 'Healthcare data synchronization complete.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'SYNC_TRIGGER_ERROR');
    }
  }

  async toggleAutoSync(req, res, next) {
    try {
      const { active } = req.body;
      const result = syncService.setAutoSync(active);
      await auditService.recordEvent({
        actorId: req.user.id,
        actorRole: 'ADMINISTRATION',
        action: active ? 'ENABLE_AUTO_SYNC' : 'DISABLE_AUTO_SYNC',
        targetResource: { resourceType: 'SYSTEM_SETTINGS', resourceId: 'auto_sync' },
        ipAddress: req.ip,
        statusCode: 200,
      });
      return successResponse(res, result, `Automatic synchronization ${active ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'SYNC_TOGGLE_ERROR');
    }
  }

  async getQuarantinedRecords(req, res, next) {
    try {
      const records = await syncService.getQuarantinedRecords(parseInt(req.query.limit, 10) || 50);
      return successResponse(res, records, 'Quarantined sync records retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'QUARANTINE_FETCH_ERROR');
    }
  }

  async listFacilities(req, res, next) {
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        return successResponse(res, {
          facilities: [],
          total: 0,
          page: 1,
          totalPages: 0,
        }, 'Healthcare facilities retrieved.');
      }

      const { statusTier, facilityType, search, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (statusTier && statusTier !== 'ALL') filter.statusTier = statusTier;
      if (facilityType && facilityType !== 'ALL') filter.facilityType = facilityType;
      if (search) {
        filter.$or = [
          { name: new RegExp(search, 'i') },
          { 'address.city': new RegExp(search, 'i') },
          { 'address.state': new RegExp(search, 'i') },
          { departments: new RegExp(search, 'i') },
        ];
      }

      const total = await Hospital.countDocuments(filter);
      const facilities = await Hospital.find(filter)
        .sort({ statusTier: 1, lastSynchronizedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit, 10));

      return successResponse(res, {
        facilities,
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / limit),
      }, 'Healthcare facilities retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'FACILITY_FETCH_ERROR');
    }
  }
}

module.exports = new AdminController();
