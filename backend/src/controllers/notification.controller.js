const notificationService = require('../services/notification.service');
const { successResponse, errorResponse } = require('../utils/response');

class NotificationController {
  async listNotifications(req, res, next) {
    try {
      const notifications = await notificationService.getNotifications(req.user.id, req.user.role, req.query);
      return successResponse(res, notifications, 'Notifications retrieved.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'RETRIEVAL_ERROR');
    }
  }

  async markRead(req, res, next) {
    try {
      const updated = await notificationService.markAsRead(req.params.id, req.user.id);
      return successResponse(res, updated, 'Notification marked as read.');
    } catch (err) {
      return errorResponse(res, err.message, 400, 'UPDATE_FAILED');
    }
  }

  async markAllRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      return successResponse(res, null, 'All notifications marked as read.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'UPDATE_FAILED');
    }
  }

  async clearAll(req, res, next) {
    try {
      await notificationService.clearAll(req.user.id);
      return successResponse(res, null, 'Notification tray cleared.');
    } catch (err) {
      return errorResponse(res, err.message, 500, 'CLEAR_FAILED');
    }
  }
}

module.exports = new NotificationController();
