const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');

// Public Directory & Discovery
router.get('/', hospitalController.searchHospitals);
router.get('/nearby', hospitalController.findNearby);
router.get('/:id', hospitalController.getById);

module.exports = router;
