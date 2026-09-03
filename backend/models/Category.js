const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Mobile Legends', 'PUBG', 'Free Fire']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  icon: String,
  color: String,
  listingsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);
