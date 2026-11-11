const Joi = require('joi');

const createPrescriptionSchema = Joi.object({
  appointmentId: Joi.string().hex().length(24).required(),
  diagnosis: Joi.array().items(
    Joi.object({
      code: Joi.string().allow('', null).optional(),
      description: Joi.string().required(),
    })
  ).min(1).required(),
  medications: Joi.array().items(
    Joi.object({
      medicineName: Joi.string().required(),
      dosage: Joi.string().required(),
      frequency: Joi.string().required(),
      durationDays: Joi.number().min(1).max(365).required(),
      instructions: Joi.string().allow('', null).optional(),
    })
  ).min(1).required(),
  investigationsRecommended: Joi.array().items(Joi.string()).optional(),
  dietaryAndLifestyleAdvice: Joi.string().allow('', null).optional(),
  followUpDate: Joi.date().iso().allow(null).optional(),
});

module.exports = {
  createPrescriptionSchema,
};
