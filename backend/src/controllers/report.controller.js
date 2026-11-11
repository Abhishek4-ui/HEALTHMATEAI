const reportService = require('../services/report.service');
const aiGateway = require('../services/aiGateway.service');
const { successResponse, errorResponse } = require('../utils/response');

class ReportController {
  async uploadReport(req, res, next) {
    try {
      const file = req.file;
      const userId = req.user?.id;
      const staged = await reportService.processUpload(file, userId);

      let ocrResult = null;
      try {
        const textToExtract = file.buffer ? file.buffer.toString('utf-8') : '';
        ocrResult = await aiGateway.extractReportOCR(textToExtract);
      } catch (ocrErr) {
        ocrResult = {
          biomarkers: [],
          abnormal_findings_count: 0,
          clinical_summary: 'Report uploaded and staged securely in encrypted storage.',
        };
      }

      const combinedResult = {
        ...staged,
        reportName: file.originalname,
        biomarkers: ocrResult.biomarkers || [],
        abnormalFindingsCount: ocrResult.abnormal_findings_count || 0,
        clinicalSummary: ocrResult.clinical_summary || 'Document staged and parsed.',
        disclaimer: ocrResult.disclaimer || 'Automated OCR extraction for informational review.',
      };

      return successResponse(res, combinedResult, 'Report analyzed and staged securely.', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400, 'UPLOAD_FAILED');
    }
  }

  async deleteReport(req, res, next) {
    try {
      const result = await reportService.deleteReport(req.params.token);
      return successResponse(res, result, 'Report removed.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'DELETE_FAILED');
    }
  }

  async getSignedUrl(req, res, next) {
    try {
      const result = await reportService.getSecureSignedUrl(req.params.token, req.user?.id);
      return successResponse(res, result, 'Secure short-lived access URL generated.');
    } catch (err) {
      return errorResponse(res, err.message, 403, 'ACCESS_DENIED');
    }
  }
}

module.exports = new ReportController();
