const Joi = require('joi');

const createAppointmentSchema = Joi.object({
  doctorId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Doctor ID is required',
  }),
  scheduledDate: Joi.date().iso().min(new Date(Date.now() - 24 * 60 * 60 * 1000)).required().messages({
    'date.min': 'Appointment date cannot be in the past',
    'any.required': 'Scheduled date is required',
  }),
  timeSlot: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Time slot must be formatted as HH:mm (e.g. 10:30)',
  }),
  consultationType: Joi.string().valid('VIDEO', 'AUDIO', 'IN_PERSON').default('VIDEO'),
  chiefComplaint: Joi.string().min(5).max(1000).required().messages({
    'string.min': 'Please provide a brief description of symptoms (at least 5 characters)',
  }),
});

const rescheduleAppointmentSchema = Joi.object({
  newDate: Joi.date().iso().greater('now').required(),
  newTimeSlot: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
});

const cancelAppointmentSchema = Joi.object({
  reason: Joi.string().min(3).max(300).required(),
});

module.exports = {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  cancelAppointmentSchema,
};
