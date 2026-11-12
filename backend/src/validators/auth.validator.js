const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'A valid email address is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  fullName: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Full name is required',
  }),
  phone: Joi.string().pattern(/^[+0-9\s-]{10,15}$/).optional(),
  role: Joi.string().valid('PATIENT', 'DOCTOR').required().messages({
    'any.only': 'Role must be either PATIENT or DOCTOR. Administration accounts cannot be registered publicly.',
  }),
  // Optional doctor credentials during doctor registration
  medicalRegistrationNumber: Joi.when('role', {
    is: 'DOCTOR',
    then: Joi.string().required().messages({
      'any.required': 'Medical registration number is required for doctor registration',
    }),
    otherwise: Joi.optional(),
  }),
  stateMedicalCouncil: Joi.when('role', {
    is: 'DOCTOR',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  specialization: Joi.when('role', {
    is: 'DOCTOR',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  experienceYears: Joi.when('role', {
    is: 'DOCTOR',
    then: Joi.number().min(0).max(70).required(),
    otherwise: Joi.optional(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('PATIENT', 'DOCTOR', 'ADMINISTRATION').required(),
});

const sendOTPSchema = Joi.object({
  target: Joi.string().required(), // email or phone
  type: Joi.string().valid('EMAIL', 'MOBILE').required(),
  purpose: Joi.string().valid('VERIFICATION', 'LOGIN', 'PASSWORD_RESET').default('VERIFICATION'),
  phone: Joi.string().optional(),
});

const verifyOTPSchema = Joi.object({
  target: Joi.string().required(),
  type: Joi.string().valid('EMAIL', 'MOBILE').required(),
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be exactly 6 digits',
  }),
  purpose: Joi.string().valid('VERIFICATION', 'LOGIN', 'PASSWORD_RESET').default('VERIFICATION'),
  phone: Joi.string().optional(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
};
