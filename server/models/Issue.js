

// // const mongoose = require('mongoose');

// // const issueSchema = new mongoose.Schema({
// //   title: { type: String, required: true, trim: true },
// //   description: { type: String, required: true, trim: true },
// //   reporter: { type: String, required: true, trim: true },
// //   role: {
// //     type: String,
// //     required: true,
// //     enum: ['Cleaner', 'Gardener', 'Event Manager', 'Security', 'Maintenance'],
// //     trim: true,
// //   },
// //   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
// //   society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
// //   status: { type: String, default: 'Open', enum: ['Open', 'Under Review', 'Resolved'] },
// //   image: { type: String }, // Optional base64 image
// //   createdAt: { type: Date, default: Date.now },
// // });

// // // Validate image size (max 5MB)
// // issueSchema.pre('save', function(next) {
// //   if (this.image) {
// //     const imgSize = Buffer.byteLength(this.image, 'base64') / (1024 * 1024); // Convert to MB
// //     if (imgSize > 5) {
// //       return next(new Error('Image size must not exceed 5MB'));
// //     }
// //   }
// //   next();
// // });

// // module.exports = mongoose.model('Issue', issueSchema);

// const mongoose = require('mongoose');

// const issueSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true },
//   description: { type: String, required: true, trim: true },
//   reporter: { type: String, required: true, trim: true },
//   role: {
//     type: String,
//     required: true,
//     enum: ['Cleaner', 'Gardener', 'Event Manager', 'Security', 'Maintenance'],
//     trim: true,
//   },
//   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
//   society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
//   status: { type: String, default: 'Open', enum: ['Open', 'Under Review', 'Resolved'] },
//   image: { type: String }, // Optional base64 image
//   createdAt: { type: Date, default: Date.now },
//   resolvedAt: { type: Date }, // New field for resolution timestamp
// });

// // Validate image size (max 5MB)
// issueSchema.pre('save', function(next) {
//   if (this.image) {
//     const imgSize = Buffer.byteLength(this.image, 'base64') / (1024 * 1024); // Convert to MB
//     if (imgSize > 5) {
//       return next(new Error('Image size must not exceed 5MB'));
//     }
//   }
//   next();
// });

// module.exports = mongoose.model('Issue', issueSchema);

// const mongoose = require('mongoose');

// const issueSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true },
//   description: { type: String, required: true, trim: true },
//   reporter: { type: String, required: true, trim: true },
//   role: {
//     type: String,
//     required: true,
//     enum: ['Cleaner', 'Gardener', 'Event Manager', 'Security', 'Maintenance'],
//     trim: true,
//   },
//   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
//   society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
//   status: { type: String, default: 'Open', enum: ['Open', 'Under Review', 'Resolved'] },
//   issueType: { type: String, default: 'General', enum: ['General', 'Personal'], required: true },
//   image: { type: String }, // Optional base64 image
//   createdAt: { type: Date, default: Date.now },
//   resolvedAt: { type: Date }, // New field for resolution timestamp
// });

// // Validate image size (max 5MB)
// issueSchema.pre('save', function(next) {
//   if (this.image) {
//     const imgSize = Buffer.byteLength(this.image, 'base64') / (1024 * 1024); // Convert to MB
//     if (imgSize > 5) {
//       return next(new Error('Image size must not exceed 5MB'));
//     }
//   }
//   next();
// });

// module.exports = mongoose.model('Issue', issueSchema);




// const mongoose = require('mongoose');

// const issueSchema = new mongoose.Schema({
//   title: { type: String, required: true, trim: true },
//   description: { type: String, required: true, trim: true },
//   reporter: { type: String, required: true, trim: true },
//   reporterUser: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   role: {
//     type: String,
//     required: true,
//     enum: ['Cleaner', 'Gardener', 'Event Manager', 'Security', 'Maintenance'],
//     trim: true
//   },
//   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
//   society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
//   status: { type: String, default: 'Open', enum: ['Open', 'Under Review', 'Resolved'] },
//   issueType: { type: String, default: 'General', enum: ['General', 'Personal'], required: true },
//   image: { type: String },
//   createdAt: { type: Date, default: Date.now },
//   resolvedAt: { type: Date }
// });

// // Validate image size (max 5MB)
// issueSchema.pre('save', function(next) {
//   if (this.image) {
//     const imgSize = Buffer.byteLength(this.image, 'base64') / (1024 * 1024); // Convert to MB
//     if (imgSize > 5) {
//       return next(new Error('Image size must not exceed 5MB'));
//     }
//   }
//   next();
// });

// module.exports = mongoose.model('Issue', issueSchema);


const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  reporter: { type: String, required: true, trim: true },
  reporterUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Cleaner', 'Gardener', 'Event Manager', 'Security', 'Maintenance'],
    trim: true
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  status: { type: String, default: 'Open', enum: ['Open', 'Under Review', 'Resolved'] },
  issueType: { type: String, default: 'General', enum: ['General', 'Personal'], required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

// Validate image size (max 5MB)
issueSchema.pre('save', function(next) {
  if (this.image) {
    const imgSize = Buffer.byteLength(this.image, 'base64') / (1024 * 1024); // Convert to MB
    if (imgSize > 5) {
      return next(new Error('Image size must not exceed 5MB'));
    }
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);