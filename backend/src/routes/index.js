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

// Forwarding for Imaging and Cardiac routes
router.use('/imaging', patientRoutes);
router.use('/cardiac', patientRoutes);

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

// Indian States & Union Territories Master Directory Endpoints
router.get('/discovery/states', (req, res) => {
  const { INDIAN_STATES_AND_UTS, STATES_COUNT, UTS_COUNT, TOTAL_STATES_AND_UTS_COUNT } = require('../constants/indianStatesAndDistricts');
  res.status(200).json({
    success: true,
    data: {
      total: TOTAL_STATES_AND_UTS_COUNT,
      statesCount: STATES_COUNT,
      utsCount: UTS_COUNT,
      states: INDIAN_STATES_AND_UTS.map(s => ({ name: s.name, type: s.type, districtCount: s.districts.length }))
    }
  });
});

router.get('/discovery/districts', (req, res) => {
  const { INDIAN_STATES_AND_UTS } = require('../constants/indianStatesAndDistricts');
  const stateQuery = req.query.state;
  if (!stateQuery) {
    return res.status(400).json({ success: false, error: 'BAD_REQUEST', message: 'state query parameter is required' });
  }
  const match = INDIAN_STATES_AND_UTS.find(s => s.name.toLowerCase() === stateQuery.trim().toLowerCase());
  if (!match) {
    return res.status(404).json({ success: false, error: 'NOT_FOUND', message: `State or Union Territory '${stateQuery}' not found in master directory.` });
  }
  res.status(200).json({
    success: true,
    data: {
      state: match.name,
      type: match.type,
      districts: match.districts
    }
  });
});

module.exports = router;
