const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const soldListings = await Listing.countDocuments({ status: 'sold' });

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentListings = await Listing.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('seller', 'username email')
      .populate('category');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        activeListings,
        soldListings
      },
      recentUsers,
      recentListings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Get all users
router.get('/users/list', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: users.length,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Update user status
router.put('/users/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// Remove listing
router.delete('/listings/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Remove from user's listings
    await User.findByIdAndUpdate(
      listing.seller,
      { $pull: { listings: req.params.id } }
    );

    res.json({
      success: true,
      message: 'Listing removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove listing',
      error: error.message
    });
  }
});

module.exports = router;
