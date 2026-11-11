const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
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

    this.s3Bucket = process.env.AWS_S3_BUCKET_NAME;
    this.s3Region = process.env.AWS_REGION || 'ap-southeast-2';
    this.s3Client = null;

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && this.s3Bucket) {
      this.s3Client = new S3Client({
        region: this.s3Region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  isS3Enabled() {
    return Boolean(this.s3Client && this.s3Bucket);
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
    const safeExtension = path.extname(file.originalname) || '.pdf';
    const s3Key = `ephemeral-reports/${uploadToken}${safeExtension}`;
    let storageType = 'LOCAL';
    let destinationPath = null;

    // 1. If AWS S3 is active, upload object to private bucket with ephemeral tag
    if (this.isS3Enabled()) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.s3Bucket,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
              uploadToken,
              uploadedBy: userId ? String(userId) : 'GUEST',
              expiresAt: new Date(Date.now() + 1800 * 1000).toISOString(),
            },
          })
        );
        storageType = 'AWS_S3';
        logger.info('Staged report file securely in AWS S3 bucket', { uploadToken, s3Key, bucket: this.s3Bucket });
      } catch (s3Err) {
        logger.warn('S3 upload fallback to local storage:', { error: s3Err.message });
      }
    }

    // 2. Local fallback if S3 was not used or failed
    if (storageType === 'LOCAL') {
      const safeFileName = `${uploadToken}_${path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      destinationPath = path.join(this.uploadDir, safeFileName);
      fs.writeFileSync(destinationPath, file.buffer);
    }

    // 3. Stage metadata in Redis with 30-min TTL
    const stageMetadata = {
      uploadToken,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      uploadedBy: userId || 'GUEST',
      uploadedAt: new Date().toISOString(),
      storageType,
      s3Key: storageType === 'AWS_S3' ? s3Key : null,
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
      storageType,
      expiresInMinutes: 30,
      status: 'STAGED_FOR_OCR',
    };
  }

  /**
   * Generate short-lived presigned download URL (15 minutes) for authorized viewing
   */
  async getSecureSignedUrl(uploadToken, userId) {
    let metadata = null;
    if (redisSessionService.isAvailable()) {
      metadata = await redisSessionService.getReportExtraction(uploadToken);
    }

    if (!metadata) {
      throw new Error('Report has expired or is not found.');
    }

    // Access authorization check
    if (metadata.uploadedBy !== 'GUEST' && userId && metadata.uploadedBy !== String(userId)) {
      throw new Error('Unauthorized access to confidential diagnostic report.');
    }

    if (metadata.storageType === 'AWS_S3' && metadata.s3Key && this.isS3Enabled()) {
      const command = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: metadata.s3Key,
      });
      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 }); // 15 mins
      return {
        uploadToken,
        signedUrl,
        expiresInSeconds: 900,
        storageType: 'AWS_S3',
      };
    }

    return {
      uploadToken,
      localPath: metadata.filePath,
      storageType: 'LOCAL',
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

    if (metadata) {
      if (metadata.storageType === 'AWS_S3' && metadata.s3Key && this.isS3Enabled()) {
        try {
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: this.s3Bucket,
              Key: metadata.s3Key,
            })
          );
          logger.info('Deleted ephemeral report file from AWS S3 bucket.', { uploadToken, s3Key: metadata.s3Key });
        } catch (e) {
          logger.warn('Failed to delete S3 file on purge:', { error: e.message });
        }
      }

      if (metadata.filePath && fs.existsSync(metadata.filePath)) {
        fs.unlinkSync(metadata.filePath);
        logger.info('Deleted ephemeral report file from local disk.', { uploadToken });
      }
    }

    return { success: true, message: 'Report removed.' };
  }
}

module.exports = new ReportService();
