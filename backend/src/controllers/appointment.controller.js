const crypto = require('crypto');
const appointmentService = require('../services/appointment.service');
const { successResponse, errorResponse } = require('../utils/response');
const { User } = require('../models');

class AppointmentController {
  async createAppointment(req, res, next) {
    try {
      let patientId = req.user?.id;
      if (!patientId) {
        const guestId = req.sessionId || 'guest_' + (req.ip || '127.0.0.1').replace(/[^a-zA-Z0-9]/g, '');
        const guestEmail = `${guestId}@guest.healthmate.ai`;
        let guestUser = await User.findOne({ email: guestEmail });
        if (!guestUser) {
          guestUser = await User.create({
            fullName: 'Guest Patient',
            email: guestEmail,
            passwordHash: crypto.randomBytes(32).toString('hex'),
            role: 'PATIENT',
            phone: '+919999999999',
            isEmailVerified: false,
            isPhoneVerified: false,
          });
        }
        patientId = guestUser._id;
      }
      const appointment = await appointmentService.createAppointment(patientId, req.body, req.ip);
      return successResponse(res, appointment, 'Appointment scheduled successfully.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'BOOKING_FAILED');
    }
  }

  async listAppointments(req, res, next) {
    try {
      let userId = req.user?.id;
      let role = req.user?.role || 'PATIENT';
      if (!userId) {
        const guestId = req.sessionId || 'guest_' + (req.ip || '127.0.0.1').replace(/[^a-zA-Z0-9]/g, '');
        const guestUser = await User.findOne({ email: `${guestId}@guest.healthmate.ai` });
        if (!guestUser) {
          return successResponse(res, { appointments: [], total: 0, page: 1, totalPages: 0 }, 'No appointments found.');
        }
        userId = guestUser._id;
      }
      const result = await appointmentService.listAppointments(userId, role, req.query);
      return successResponse(res, result, 'Appointments retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'RETRIEVAL_ERROR');
    }
  }

  async rescheduleAppointment(req, res, next) {
    try {
      const updated = await appointmentService.rescheduleAppointment(req.params.id, req.user?.id, req.body);
      return successResponse(res, updated, 'Appointment rescheduled.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'RESCHEDULE_FAILED');
    }
  }

  async cancelAppointment(req, res, next) {
    try {
      const cancelled = await appointmentService.cancelAppointment(req.params.id, req.user?.id, req.body.reason);
      return successResponse(res, cancelled, 'Appointment cancelled.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'CANCEL_FAILED');
    }
  }
}

module.exports = new AppointmentController();
