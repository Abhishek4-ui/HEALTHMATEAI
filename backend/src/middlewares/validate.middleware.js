const { errorResponse } = require('../utils/response');

/**
 * Higher-order middleware function to validate incoming request payloads with Joi schemas
 * @param {import('joi').ObjectSchema} schema 
 * @param {'body'|'query'|'params'} source 
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map(d => d.message).join(', ');
      return errorResponse(res, errorMessage, 400, 'VALIDATION_ERROR', error.details);
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;
