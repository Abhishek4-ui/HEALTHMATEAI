const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const { updateProfileSchema, emergencyContactSchema, consentActionSchema } = require('../validators/patient.validator');

// Authenticated Patient Profile
router.get('/profile', authenticateToken, requireRoles(['PATIENT']), patientController.getProfile);
router.put('/profile', authenticateToken, requireRoles(['PATIENT']), validate(updateProfileSchema), patientController.updateProfile);

// Emergency Contacts (Proxy Caregivers)
router.post('/emergency-contacts', authenticateToken, requireRoles(['PATIENT']), validate(emergencyContactSchema), patientController.addEmergencyContact);
router.delete('/emergency-contacts/:id', authenticateToken, requireRoles(['PATIENT']), patientController.deleteEmergencyContact);

// Ephemeral Redis Health Session (Accessible to both Guests and Authenticated Patients)
router.get('/session', optionalAuth, patientController.getSession);
router.post('/session', optionalAuth, patientController.updateSession);

// DPDP Act 2023: Right to be Forgotten (Immediate Ephemeral Purge)
router.delete('/forget-me', optionalAuth, patientController.forgetMe);
router.delete('/session/:sessionId', optionalAuth, patientController.forgetMe); // Client alias

// Data Export
router.get('/data-export', authenticateToken, requireRoles(['PATIENT']), patientController.getConsents);

// Consent Management
router.post('/consents', authenticateToken, requireRoles(['PATIENT']), validate(consentActionSchema), patientController.recordConsent);
router.get('/consents', authenticateToken, requireRoles(['PATIENT']), patientController.getConsents);

module.exports = router;
