const express = require('express');
const router = express.Router();
const multer = require('multer');
const reportController = require('../controllers/report.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Upload report (Accessible to Guest or Patient)
router.post('/upload', optionalAuth, upload.single('report'), reportController.uploadReport);
router.get('/:token/signed-url', optionalAuth, reportController.getSignedUrl);
router.delete('/:token', optionalAuth, reportController.deleteReport);

module.exports = router;
