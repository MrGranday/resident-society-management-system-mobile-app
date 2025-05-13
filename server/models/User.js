

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['manager', 'resident', 'staff'],
    default: 'resident',
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
  },
  houseNumber: {
    type: String,
    trim: true,
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verificationToken: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);