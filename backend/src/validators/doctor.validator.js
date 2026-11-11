const Joi = require('joi');

const updateDoctorProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  specialization: Joi.string().min(2).max(100).optional(),
  experienceYears: Joi.number().min(0).max(70).optional(),
  consultationFee: Joi.number().min(0).max(50000).optional(),
  bio: Joi.string().max(1000).allow('', null).optional(),
  clinicAddress: Joi.string().max(300).allow('', null).optional(),
  address: Joi.object({
    street: Joi.string().allow('', null).optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pincode: Joi.string().optional(),
  }).optional(),
});

const availabilityRuleSchema = Joi.object({
  schedule: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().min(0).max(6).required(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      slotDurationMinutes: Joi.number().valid(15, 20, 30, 45, 60).default(20),
      isAvailable: Joi.boolean().default(true),
    })
  ).required(),
  consultationFee: Joi.number().min(0).optional(),
});

module.exports = {
  updateDoctorProfileSchema,
  availabilityRuleSchema,
};
