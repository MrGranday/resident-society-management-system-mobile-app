const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{1,11}$/, 'Phone number must be 1-11 digits'],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['Cleaner', 'Gardener', 'Event Manager', 'Security', 'Maintenance'],
  },
  startDate: {
    type: Date,
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

module.exports = mongoose.model('Staff', staffSchema);

// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const staffSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   phoneNumber: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, required: true },
//   startDate: { type: Date, required: true },
//   society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
// });

// staffSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// module.exports = mongoose.model('Staff', staffSchema);