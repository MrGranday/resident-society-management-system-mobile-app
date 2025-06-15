// housingModel.js
const mongoose = require('mongoose');

const housingSchema = new mongoose.Schema({
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  houseNumber: {
    type: String,
    required: true,
    trim: true,
    match: /^\d+[A-Za-z]?$/
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Housing', housingSchema);
