const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  cancelAppointmentSchema,
} = require('../validators/appointment.validator');

// All appointment operations require authentication
router.use(authenticateToken);

// Create Appointment (Patients only)
router.post('/', requireRoles(['PATIENT']), validate(createAppointmentSchema), appointmentController.createAppointment);
router.post('/book', requireRoles(['PATIENT']), validate(createAppointmentSchema), appointmentController.createAppointment);

// List Appointments (Patient, Doctor, Administration)
router.get('/', requireRoles(['PATIENT', 'DOCTOR', 'ADMINISTRATION']), appointmentController.listAppointments);

// Reschedule
router.put('/:id/reschedule', validate(rescheduleAppointmentSchema), appointmentController.rescheduleAppointment);

// Cancel
router.put('/:id/cancel', validate(cancelAppointmentSchema), appointmentController.cancelAppointment);

module.exports = router;
