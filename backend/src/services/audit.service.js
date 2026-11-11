const { AuditLog } = require('../models');

class AuditService {
  /**
   * Log an immutable regulatory audit entry
   */
  async recordEvent({ actorId, actorRole, action, targetResource, ipAddress, statusCode = 200, metadata = {} }) {
    return await AuditLog.create({
      actorId: actorId || null,
      actorRole: actorRole || 'GUEST',
      action,
      targetResource: targetResource || {},
      ipAddress: ipAddress || '127.0.0.1',
      statusCode,
      metadata,
    });
  }

  /**
   * Query audit logs with pagination and role filters (Administration only)
   */
  async queryLogs({ actorRole, action, page = 1, limit = 20 }) {
    const filter = {};
    if (actorRole && actorRole !== 'ALL') filter.actorRole = actorRole;
    if (action) filter.action = action;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('actorId', 'fullName email role')
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    return {
      logs,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = new AuditService();
