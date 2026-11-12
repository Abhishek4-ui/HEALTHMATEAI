const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const { updateProfileSchema, emergencyContactSchema, consentActionSchema } = require('../validators/patient.validator');

// Authenticated Patient Profile
router.get('/profile', authenticateToken, requireRoles(['PATIENT']), patientController.getProfile);
router.put('/profile', authenticateToken, requireRoles(['PATIENT']), validate(updateProfileSchema), patientController.updateProfile);

// Patient Appointments Alias
const appointmentController = require('../controllers/appointment.controller');
router.get('/appointments', authenticateToken, requireRoles(['PATIENT']), appointmentController.listAppointments);

// Emergency Contacts (Proxy Caregivers)
router.post('/emergency-contacts', authenticateToken, requireRoles(['PATIENT']), validate(emergencyContactSchema), patientController.addEmergencyContact);
router.delete('/emergency-contacts/:id', authenticateToken, requireRoles(['PATIENT']), patientController.deleteEmergencyContact);

// Ephemeral Redis Health Session (Accessible to both Guests and Authenticated Patients)
router.get('/session', optionalAuth, patientController.getSession);
router.post('/session', optionalAuth, patientController.updateSession);

// DPDP Act 2023: Right to be Forgotten (Immediate Ephemeral Purge)
router.delete('/forget-me', optionalAuth, patientController.forgetMe);
router.delete('/session/:sessionId', optionalAuth, patientController.forgetMe); // Client alias

const multer = require('multer');
const reportController = require('../controllers/report.controller');
const aiGateway = require('../services/aiGateway.service');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Ephemeral Diagnostic Report Upload & AI OCR Staging
router.post('/reports/ocr-extract', optionalAuth, upload.single('report'), reportController.uploadReport);

// AI Copilot, Symptom Checker, and Health Risk Assessment
router.post('/copilot/message', optionalAuth, async (req, res, next) => {
  try {
    const { query, language, history } = req.body;
    const result = await aiGateway.sendHealthQuery(query, language, history);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post('/symptom-check', optionalAuth, async (req, res, next) => {
  try {
    const text = req.body.symptom_text || req.body.symptoms || req.body.query || '';
    const result = await aiGateway.checkSymptoms(text);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post('/risk-assessment', optionalAuth, async (req, res, next) => {
  try {
    const result = await aiGateway.assessCardioRisk(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Phase 9: Medical Imaging AI Analysis (X-Ray, CT, MRI, Ultrasound, Pathology)
router.post('/imaging/analyze', optionalAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'Medical scan image file is required.' });
    }
    const modality = (req.body.modality || 'XRAY').toUpperCase();
    const patientConsent = req.body.patient_consent === undefined ? true : String(req.body.patient_consent) === 'true';

    const result = await aiGateway.analyzeMedicalImaging({
      fileBuffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      modality,
      patientConsent,
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
});

// Phase 9: ECG & Cardiac Waveform Intelligence
router.post('/cardiac/ecg-analyze', optionalAuth, upload.single('ecg'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'ECG file (PDF or Image) is required.' });
    }
    const patientAge = parseInt(req.body.patient_age, 10) || 50;
    const patientConsent = req.body.patient_consent === undefined ? true : String(req.body.patient_consent) === 'true';

    const result = await aiGateway.analyzeECG({
      fileBuffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      patientAge,
      patientConsent,
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
});

// Clinical Persistent Records (MongoDB Atlas Persistence)
// Medications & Reminders
router.get('/medications', optionalAuth, patientController.getMedications);
router.post('/medications', optionalAuth, patientController.addMedication);
router.put('/medications/:id/adherence', optionalAuth, patientController.logMedicationAdherence);
router.delete('/medications/:id', optionalAuth, patientController.deleteMedication);

// Vitals & Health Monitoring
router.get('/vitals', optionalAuth, patientController.getVitals);
router.post('/vitals', optionalAuth, patientController.logVital);

// Wellness, Sleep & Mental Health
router.get('/wellness', optionalAuth, patientController.getWellnessLogs);
router.post('/wellness', optionalAuth, patientController.logWellness);

// Family Healthcare Profiles
router.get('/family-members', optionalAuth, patientController.getFamilyMembers);
router.post('/family-members', optionalAuth, patientController.addFamilyMember);
router.delete('/family-members/:id', optionalAuth, patientController.deleteFamilyMember);

// Laboratory Diagnostic Orders
router.get('/lab-orders', optionalAuth, patientController.getLabOrders);
router.post('/lab-orders', optionalAuth, patientController.createLabOrder);

// Data Export
router.get('/data-export', authenticateToken, requireRoles(['PATIENT']), patientController.getConsents);

// Consent Management
router.post('/consents', authenticateToken, requireRoles(['PATIENT']), validate(consentActionSchema), patientController.recordConsent);
router.get('/consents', authenticateToken, requireRoles(['PATIENT']), patientController.getConsents);

module.exports = router;
