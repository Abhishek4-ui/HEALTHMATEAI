const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultation.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const { saveSoapNotesSchema } = require('../validators/consultation.validator');

router.use(authenticateToken);

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
