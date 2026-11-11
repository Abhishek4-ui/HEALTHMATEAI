const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const { updateDoctorProfileSchema, availabilityRuleSchema } = require('../validators/doctor.validator');

// Public Doctor Discovery
router.get('/discovery', doctorController.listDoctors);
router.get('/discovery/nearby', doctorController.findNearby);
router.get('/:id/availability', doctorController.getAvailability);

// Authenticated Doctor Workspace
router.get('/profile', authenticateToken, requireRoles(['DOCTOR']), doctorController.getProfile);
router.put('/profile', authenticateToken, requireRoles(['DOCTOR']), validate(updateDoctorProfileSchema), doctorController.updateProfile);

// Verification Submission
router.post('/verification', authenticateToken, requireRoles(['DOCTOR']), doctorController.submitVerification);
router.get('/verification-status', authenticateToken, requireRoles(['DOCTOR']), doctorController.getProfile);

// Availability & Schedule Configuration
router.put('/availability', authenticateToken, requireRoles(['DOCTOR']), validate(availabilityRuleSchema), doctorController.updateAvailability);
router.post('/availability', authenticateToken, requireRoles(['DOCTOR']), doctorController.updateAvailability);
router.get('/schedule', authenticateToken, requireRoles(['DOCTOR']), doctorController.getProfile);

// Finance & Ledger
router.get('/finance/ledger', authenticateToken, requireRoles(['DOCTOR']), (req, res) => {
  res.status(200).json({
    success: true,
    data: { gross: 0, platformFee: 0, netPayout: 0, transactions: [] },
  });
});

module.exports = router;
