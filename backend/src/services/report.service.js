const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const redisSessionService = require('./redisSession.service');
const logger = require('../utils/logger');

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

class ReportService {
  constructor() {
    this.uploadDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate and stage an uploaded medical report securely
   */
  async processUpload(file, userId) {
    if (!file) throw new Error('No report file provided.');

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error('Unsupported file format. Only PDF, JPG, and PNG documents are permitted.');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('File exceeds maximum allowable size of 10MB.');
    }

    const uploadToken = 'rep_' + crypto.randomBytes(16).toString('hex');
    const safeFileName = `${uploadToken}_${path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const destinationPath = path.join(this.uploadDir, safeFileName);

    // Write file to secure private storage
    fs.writeFileSync(destinationPath, file.buffer);

    // Stage temporary extraction record in Redis with 30-min TTL
    const stageMetadata = {
      uploadToken,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      uploadedBy: userId || 'GUEST',
      uploadedAt: new Date().toISOString(),
      filePath: destinationPath,
      processingStatus: 'STAGED_FOR_OCR',
    };

    if (redisSessionService.isAvailable()) {
      await redisSessionService.setReportExtraction(uploadToken, stageMetadata);
    }

    return {
      uploadToken,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSizeKb: Math.round(file.size / 1024),
      expiresInMinutes: 30,
      status: 'STAGED_FOR_OCR',
    };
  }

  /**
   * Delete uploaded temporary report file securely
   */
  async deleteReport(uploadToken) {
    let metadata = null;
    if (redisSessionService.isAvailable()) {
      metadata = await redisSessionService.getReportExtraction(uploadToken);
    }

    if (metadata && metadata.filePath && fs.existsSync(metadata.filePath)) {
      fs.unlinkSync(metadata.filePath);
      logger.info('Deleted ephemeral report file from disk.', { uploadToken });
    }

    return { success: true, message: 'Report removed.' };
  }
}

module.exports = new ReportService();
