const AuditLog = require('../models/AuditLog');

/**
 * Log an admin action for audit trail
 * @param {string} adminId - Admin user ID
 * @param {string} action - Action type
 * @param {object} options - Log options (targetUser, targetListing, details, etc.)
 */
const logAdminAction = async (adminId, action, options = {}) => {
  try {
    const logEntry = new AuditLog({
      admin: adminId,
      action,
      targetUser: options.targetUser,
      targetListing: options.targetListing,
      details: options.details || {},
      previousValue: options.previousValue,
      newValue: options.newValue,
      reason: options.reason,
      status: options.status || 'success'
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit log failure shouldn't block operations
  }
};

/**
 * Get audit logs with filters
 */
const getAuditLogs = async (filters = {}) => {
  try {
    const {
      action,
      targetUser,
      admin,
      page = 1,
      limit = 50,
      startDate,
      endDate
    } = filters;

    const query = {};
    if (action) query.action = action;
    if (targetUser) query.targetUser = targetUser;
    if (admin) query.admin = admin;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const logs = await AuditLog.find(query)
      .populate('admin', 'username email')
      .populate('targetUser', 'username email')
      .populate('targetListing', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: logs.length,
        total
      }
    };
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    throw error;
  }
};

module.exports = { logAdminAction, getAuditLogs };
