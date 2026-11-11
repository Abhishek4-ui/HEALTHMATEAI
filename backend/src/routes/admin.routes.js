const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

// All Administration routes strictly require ADMINISTRATION role
router.use(authenticateToken, requireRoles(['ADMINISTRATION']));

// Overview Metrics
router.get('/overview', adminController.getOverview);
router.get('/metrics/overview', adminController.getOverview);

// Doctor Accreditation Review Queue
router.get('/doctor-verifications', adminController.listDoctorVerifications);
router.get('/doctors/pending-review', adminController.listDoctorVerifications);
router.post('/doctor-verifications/:id/decision', adminController.reviewDoctorVerification);
router.post('/doctors/:id/verify', adminController.reviewDoctorVerification);

// Account Governance
router.get('/patients', adminController.listPatients);
router.get('/doctors', adminController.listDoctors);

// System Telemetry & Integrations
router.get('/integrations', adminController.getIntegrations);

// Data Synchronization & Health Registries (Phase 7)
router.get('/sync/status', adminController.getSyncStatus);
router.get('/discovery/sync-status', adminController.getSyncStatus);
router.post('/sync/trigger', adminController.triggerSync);
router.post('/discovery/trigger-sync', adminController.triggerSync);
router.put('/sync/toggle', adminController.toggleAutoSync);
router.get('/sync/quarantine', adminController.getQuarantinedRecords);
router.get('/facilities', adminController.listFacilities);

router.get('/ai-models', adminController.getAIModels);
router.get('/mlops/models', adminController.getAIModels);
router.get('/mlops/telemetry', adminController.getMLOpsTelemetry);
router.get('/mlops/drift', adminController.getMLOpsDrift);
router.post('/clinical/rag-query', adminController.queryRAGGuidelines);
router.get('/datasets', adminController.getDatasets);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/compliance/audit-logs', adminController.getAuditLogs);

module.exports = router;
