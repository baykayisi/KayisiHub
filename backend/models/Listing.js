const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  game: {
    type: String,
    enum: ['Mobile Legends', 'PUBG', 'Free Fire'],
    required: true
  },
  type: {
    type: String,
    enum: ['Account', 'Item'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'removed'],
    default: 'active'
  },
  images: [String],
  specifications: {
    level: String,
    heroes: [String],
    skinCount: Number,
    region: String,
    additionalInfo: String
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);
