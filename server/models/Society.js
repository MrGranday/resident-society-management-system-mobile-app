const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  address: { 
    type: String, 
    required: true, 
    trim: true 
  },
  managerEmail: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true 
  },
  managerName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  uniqueIdCode: { 
    type: String, 
    required: true, 
    trim: true, 
    unique: true 
  },
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  dateOfCreation: { 
    type: Date, 
    default: Date.now 
  },
  residents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  residentRequests: [{
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    phoneNumber: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true 
    },
    address: { 
      type: String, 
      required: true, 
      trim: true 
    },
    houseNumber: { 
      type: String, 
      required: true, 
      trim: true 
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
  }]
});

module.exports = mongoose.model('Society', societySchema);