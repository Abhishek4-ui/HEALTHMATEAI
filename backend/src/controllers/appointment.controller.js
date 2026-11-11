const appointmentService = require('../services/appointment.service');
const { successResponse, errorResponse } = require('../utils/response');

class AppointmentController {
  async createAppointment(req, res, next) {
    try {
      const appointment = await appointmentService.createAppointment(req.user.id, req.body, req.ip);
      return successResponse(res, appointment, 'Appointment scheduled successfully.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'BOOKING_FAILED');
    }
  }

  async listAppointments(req, res, next) {
    try {
      const result = await appointmentService.listAppointments(req.user.id, req.user.role, req.query);
      return successResponse(res, result, 'Appointments retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'RETRIEVAL_ERROR');
    }
  }

  async rescheduleAppointment(req, res, next) {
    try {
      const updated = await appointmentService.rescheduleAppointment(req.params.id, req.user.id, req.body);
      return successResponse(res, updated, 'Appointment rescheduled.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'RESCHEDULE_FAILED');
    }
  }

  async cancelAppointment(req, res, next) {
    try {
      const cancelled = await appointmentService.cancelAppointment(req.params.id, req.user.id, req.body.reason);
      return successResponse(res, cancelled, 'Appointment cancelled.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'CANCEL_FAILED');
    }
  }
}

module.exports = new AppointmentController();
