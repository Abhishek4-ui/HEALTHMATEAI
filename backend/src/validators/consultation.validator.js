const Joi = require('joi');

const saveSoapNotesSchema = Joi.object({
  subjective: Joi.string().allow('', null).optional(),
  objective: Joi.string().allow('', null).optional(),
  assessment: Joi.string().allow('', null).optional(),
  plan: Joi.string().allow('', null).optional(),
  clinicalSummary: Joi.string().allow('', null).optional(),
});

module.exports = {
  saveSoapNotesSchema,
};
