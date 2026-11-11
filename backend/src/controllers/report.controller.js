const reportService = require('../services/report.service');
const { successResponse, errorResponse } = require('../utils/response');

class ReportController {
  async uploadReport(req, res, next) {
    try {
      const file = req.file;
      const userId = req.user?.id;
      const result = await reportService.processUpload(file, userId);
      return successResponse(res, result, 'Report staged securely for AI extraction.', 201);
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
}

module.exports = new ReportController();
