const Joi = require('joi');

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional(),
  dateOfBirth: Joi.date().iso().optional(),
  gender: Joi.string().valid('Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other').optional(),
  bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown').optional(),
  address: Joi.object({
    street: Joi.string().allow('', null).optional(),
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    pincode: Joi.string().allow('', null).optional(),
  }).optional(),
  knownAllergies: Joi.array().items(Joi.string()).optional(),
  chronicConditions: Joi.array().items(Joi.string()).optional(),
  defaultEphemeralTTLMinutes: Joi.number().valid(30, 60, 120, 240).optional(),
  allowDoctorClinicalShare: Joi.boolean().optional(),
  telemedicineRecordingConsent: Joi.boolean().optional(),
});

const emergencyContactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  relationship: Joi.string().valid('Parent', 'Spouse', 'Child', 'Sibling', 'Guardian', 'Friend', 'Other').required(),
  phoneNumber: Joi.string().pattern(/^[+0-9\s-]{10,15}$/).required(),
  isPrimary: Joi.boolean().default(false),
});

const consentActionSchema = Joi.object({
  consentType: Joi.string().valid('TEMPORARY_AI_ANALYSIS', 'PERSISTENT_HEALTH_VAULT', 'DOCTOR_CLINICAL_SHARE', 'TELEMEDICINE_RECORDING').required(),
  status: Joi.string().valid('GRANTED', 'REVOKED').required(),
  purposeDescription: Joi.string().required(),
});

const logVitalsSchema = Joi.object({
  heartRate: Joi.number().min(30).max(250).optional(),
  systolicBP: Joi.number().min(60).max(260).optional(),
  diastolicBP: Joi.number().min(40).max(160).optional(),
  bloodGlucose: Joi.number().min(20).max(600).optional(),
  spo2: Joi.number().min(50).max(100).optional(),
  temperatureF: Joi.number().min(90).max(110).optional(),
  weightKg: Joi.number().min(1).max(300).optional(),
  notes: Joi.string().max(500).allow('', null).optional(),
});

module.exports = {
  updateProfileSchema,
  emergencyContactSchema,
  consentActionSchema,
  logVitalsSchema,
};
