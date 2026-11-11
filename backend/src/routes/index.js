const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');
const adminRoutes = require('./admin.routes');
const hospitalRoutes = require('./hospital.routes');
const appointmentRoutes = require('./appointment.routes');
const consultationRoutes = require('./consultation.routes');
const prescriptionRoutes = require('./prescription.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');
const paymentRoutes = require('./payment.routes');
const healthRoutes = require('./health.routes');

// Mount versioned API routes
router.use('/auth', authRoutes);
router.use('/patient', patientRoutes);
router.use('/doctor', doctorRoutes);
router.use('/admin', adminRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/consultations', consultationRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);
router.use('/health', healthRoutes);

// Discovery alias router for frontend discoveryService
router.get('/discovery/doctors', (req, res, next) => {
  const doctorController = require('../controllers/doctor.controller');
  doctorController.listDoctors(req, res, next);
});
router.get('/discovery/hospitals', (req, res, next) => {
  const hospitalController = require('../controllers/hospital.controller');
  hospitalController.searchHospitals(req, res, next);
});
router.get('/discovery/nearby', (req, res, next) => {
  if (req.query.type === 'doctor') {
    const doctorController = require('../controllers/doctor.controller');
    return doctorController.findNearby(req, res, next);
  }
  const hospitalController = require('../controllers/hospital.controller');
  hospitalController.findNearby(req, res, next);
});

module.exports = router;
