const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  houseNumber: { 
    type: String, 
    required: true 
  },
  society: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Society', 
    required: true 
  },
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Resident', residentSchema);