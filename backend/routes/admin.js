const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { logAdminAction, getAuditLogs } = require('../utils/auditLog');
const { isValidObjectId, validatePagination, getSafeErrorMessage } = require('../utils/validation');

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * GET /api/admin/stats - Dashboard statistics (admin only)
 */
router.get('/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const soldListings = await Listing.countDocuments({ status: 'sold' });
    const removedListings = await Listing.countDocuments({ status: 'removed' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    // Recent activities (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersLastWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newListingsLastWeek = await Listing.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const recentUsers = await User.find()
      .select('username email status role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentListings = await Listing.find()
      .select('title game price status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('seller', 'username email')
      .populate('category', 'name');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        activeListings,
        soldListings,
        removedListings,
        adminCount,
        suspendedUsers,
        newUsersLastWeek,
        newListingsLastWeek
      },
      recent: {
        users: recentUsers,
        listings: recentListings
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: getSafeErrorMessage(error, isDevelopment)
    });
  }
});

/**
 * GET /api/admin/users - List all users with pagination (admin only)
 */
router.get('/users/list', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role } = req.query;

    // Validate pagination - rejects if limit > max
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const maxLimit = 100;

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > maxLimit) {
      return res.status(400).json({
        success: false,
        message: `Limit must be between 1 and ${maxLimit}`
      });
    }

    const skip = (pageNum - 1) * limitNum;
    const filter = {};

    // Validate status filter
    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      filter.status = status;
    }

    // Validate role filter
    if (role && ['user', 'admin'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('username email status role createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: users.length,
        total
      }
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      message: getSafeErrorMessage(error, isDevelopment)
    });
  }
});

/**
 * PUT /api/admin/users/:id/status - Update user status (admin only)
 * Protected: Cannot disable last active admin, prevents role escalation
 */
router.put('/users/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: active, inactive, suspended'
      });
    }

    // Prevent self-suspension/deactivation
    if (id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot change your own account status'
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent disabling the last active admin
    if (targetUser.role === 'admin' && status !== 'active') {
      const activeAdminCount = await User.countDocuments({
        role: 'admin',
        status: 'active',
        _id: { $ne: id }
      });

      if (activeAdminCount === 0) {
        // Log failed attempt
        await logAdminAction(req.user.id, 'user_status_changed', {
          targetUser: id,
          previousValue: targetUser.status,
          newValue: status,
          reason,
          status: 'failed',
          details: { reason: 'Last active admin protection' }
        });

        return res.status(403).json({
          success: false,
          message: 'Cannot disable the last active admin account'
        });
      }
    }

    const previousStatus = targetUser.status;
    targetUser.status = status;
    await targetUser.save();

    // Log successful action
    await logAdminAction(req.user.id, 'user_status_changed', {
      targetUser: id,
      previousValue: previousStatus,
      newValue: status,
      reason
    });

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: targetUser._id,
        username: targetUser.username,
        email: targetUser.email,
        status: targetUser.status,
        role: targetUser.role
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: getSafeErrorMessage(error, isDevelopment)
    });
  }
});

/**
 * GET /api/admin/users/:id - Get user details (admin only)
 */
router.get('/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(id)
      .select('-password')
      .populate('listings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const listingCount = await Listing.countDocuments({ seller: id });
    const activeListingCount = await Listing.countDocuments({ seller: id, status: 'active' });

    res.json({
      success: true,
      user,
      stats: {
        totalListings: listingCount,
        activeListings: activeListingCount
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: getSafeErrorMessage(error, isDevelopment)
    });
  }
});

/**
 * DELETE /api/admin/listings/:id - Remove listing with soft-delete (admin only)
 * Preserves listing data for audit trail
 */
router.delete('/listings/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID format'
      });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const previousStatus = listing.status;
    listing.status = 'removed';
    await listing.save();

    // Log admin action
    await logAdminAction(req.user.id, 'listing_removed', {
      targetListing: id,
      targetUser: listing.seller,
      previousValue: previousStatus,
      newValue: 'removed',
      reason: reason || 'Admin moderation',
      details: {
        title: listing.title,
        game: listing.game
      }
    });

    res.json({
      success: true,
      message: 'Listing removed successfully',
      listing: {
        id: listing._id,
        title: listing.title,
        status: listing.status
      }
    });
  } catch (error) {
    console.error('Remove listing error:', error);
    res.status(500).json({
      success: false,
      message: getSafeErrorMessage(error, isDevelopment)
    });
  }
});

/**
 * GET /api/admin/listings - List all listings with filters (admin only)
 */
router.get('/listings', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, game } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const maxLimit = 100;

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > maxLimit) {
      return res.status(400).json({
        success: false,
        message: `Limit must be between 1 and ${maxLimit}`
      });
    }

    const skip = (pageNum - 1) * limitNum;
    const filter = {};

    if (status && ['active', 'sold', 'removed'].includes(status)) {
      filter.status = status;
    }

    if (game && ['Mobile Legends', 'PUBG', 'Free Fire'].includes(game)) {
      filter.game = game;
    }

    const listings = await Listing.find(filter)
      .select('title game price status createdAt views')
      .populate('seller', 'username email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Listing.countDocuments(filter);

    res.json({
      success: true,
      listings,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: listings.length,
        total
      }
    });
  } catch (error) {
    console.error('List listings error:', error);
    res.status(500).json({
      success: false,
      message: getSafeErrorMessage(error, isDevelopment)
    });
  }
});

/**
 * GET /api/admin/audit-logs - Get audit logs (admin only)
 */
router.get('/audit-logs', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, action, targetUser } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const maxLimit = 100;

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page number'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > maxLimit) {
      return res.status(400).json({
        success: false,
        message: `Limit must be between 1 and ${maxLimit}`
      });
    }

    const filters = {
      page: pageNum,
      limit: limitNum
    };

    if (action) filters.action = action;
    if (targetUser && isValidObjectId(targetUser)) filters.targetUser = targetUser;

    const { logs, pagination } = await getAuditLogs(filters);

    res.json({
      success: true,
      logs,
      pagination
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: getSafeErrorMessage(error, isDevelopment)
    });
  }
});

module.exports = router;
