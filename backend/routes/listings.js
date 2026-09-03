const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const { game, type, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    let filter = { status: 'active' };
    if (game) filter.game = game;
    if (type) filter.type = type;

    const listings = await Listing.find(filter)
      .populate('seller', 'username email avatar')
      .populate('category')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Listing.countDocuments(filter);

    res.json({
      success: true,
      listings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: listings.length,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('seller', 'username email avatar bio')
      .populate('category');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create listing
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, game, type, price, specifications } = req.body;

    if (!title || !description || !game || !type || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const listing = new Listing({
      title,
      description,
      category,
      game,
      type,
      price,
      specifications,
      seller: req.user.id
    });

    await listing.save();
    await listing.populate('seller', 'username email avatar');
    await listing.populate('category');

    // Add listing to user's listings
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { listings: listing._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update listing
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    const { title, description, price, status, specifications } = req.body;
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price) listing.price = price;
    if (status) listing.status = status;
    if (specifications) listing.specifications = specifications;

    await listing.save();

    res.json({
      success: true,
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update listing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete listing
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    await Listing.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { listings: req.params.id } }
    );

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete listing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
