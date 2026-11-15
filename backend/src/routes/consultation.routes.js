const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultation.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const { saveSoapNotesSchema } = require('../validators/consultation.validator');

router.use(authenticateToken);

// ==========================================
// 1. AI Doctor Consultation Routes (Patient)
// ==========================================
router.post('/ai/start', requireRoles(['PATIENT']), consultationController.startAIDoctorSession);
router.post('/ai/:id/message', requireRoles(['PATIENT']), consultationController.sendAIDoctorMessage);
router.post('/ai/:id/end', requireRoles(['PATIENT']), consultationController.endAIDoctorSession);
router.delete('/ai/:id', requireRoles(['PATIENT']), consultationController.deleteAIDoctorConsultation);

// ==========================================
// 2. Consultation Histories & Details
// ==========================================
router.get('/history', requireRoles(['PATIENT']), consultationController.listPatientConsultations);
router.get('/detail/:id', requireRoles(['PATIENT']), consultationController.getConsultationById);

// ==========================================
// 3. AI Pre-Consultation Summary for Doctor
// ==========================================
router.get('/pre-summary/:appointmentId', requireRoles(['PATIENT']), consultationController.generatePreConsultationSummary);
router.post('/pre-summary/:appointmentId/approve', requireRoles(['PATIENT']), consultationController.approvePreConsultationSummary);

// ==========================================
// 4. Real Doctor Video & Session Routes
// ==========================================
// Start or load consultation session
router.post('/appointment/:appointmentId', consultationController.getOrCreateConsultation);

// Get real-time WebRTC / Twilio Video Room Access Token
router.get('/:appointmentId/token', consultationController.getVideoToken);
router.post('/:appointmentId/token', consultationController.getVideoToken);

// Update SOAP Notes (Doctor only)
router.put('/:id/notes', requireRoles(['DOCTOR']), validate(saveSoapNotesSchema), consultationController.updateSoapNotes);

// Mark Complete (Doctor only)
router.put('/:id/complete', requireRoles(['DOCTOR']), consultationController.completeConsultation);

module.exports = router;
