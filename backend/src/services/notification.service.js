const { Notification } = require('../models');

class NotificationService {
  async getNotifications(userId, role, { type, unreadOnly = false }) {
    const filter = { recipientId: userId };
    if (type && type !== 'ALL') filter.type = type;
    if (unreadOnly) filter.isRead = false;

    return await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async clearAll(userId) {
    return await Notification.deleteMany({ recipientId: userId });
  }
}

module.exports = new NotificationService();
