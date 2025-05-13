const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000,
  },
  image: {
    type: String,
    required: false, // Image is optional
  },
  dateTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200,
  },
  category: {
    type: String,
    required: true,
    enum: ['Social', 'Meeting', 'Sports', 'Workshop', 'Other'],
    default: 'Other',
  },
  role: {
    type: String,
    required: true,
    enum: ['Event Manager'],
    trim: true,
    default: 'Event Manager',
  },
  status: {
    type: String,
    required: true,
    enum: ['Open', 'Finished'],
    default: 'Open',
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', eventSchema);