const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  cancelAppointmentSchema,
} = require('../validators/appointment.validator');

// Create Appointment (Patients & Guests with session)
router.post('/', optionalAuth, validate(createAppointmentSchema), appointmentController.createAppointment);
router.post('/book', optionalAuth, validate(createAppointmentSchema), appointmentController.createAppointment);

// List Appointments (Patient, Guest Session, Doctor, Administration)
router.get('/', optionalAuth, appointmentController.listAppointments);

// Reschedule & Cancel (Requires Token)
router.put('/:id/reschedule', authenticateToken, validate(rescheduleAppointmentSchema), appointmentController.rescheduleAppointment);
router.put('/:id/cancel', authenticateToken, validate(cancelAppointmentSchema), appointmentController.cancelAppointment);

module.exports = router;
