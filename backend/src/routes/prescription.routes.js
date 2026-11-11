const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const { createPrescriptionSchema } = require('../validators/prescription.validator');

// Issue Prescription (Doctor only)
router.post('/', authenticateToken, requireRoles(['DOCTOR']), validate(createPrescriptionSchema), prescriptionController.createPrescription);

// List Prescriptions (Patient or Doctor)
router.get('/', authenticateToken, prescriptionController.listPrescriptions);

// Verify Digital Signature (Public clinical integrity check)
router.get('/:id/verify', prescriptionController.verifySignature);

module.exports = router;
