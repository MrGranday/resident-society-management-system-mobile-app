const mongoose = require('mongoose');

// Chat Request Schema (for one-on-one chat requests)
const chatRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  requestMessage: { type: String }, // New field for request message
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Chat Schema (for both group and one-on-one chats)
const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  isGroup: { type: Boolean, default: false },
  // Group-specific fields
  groupName: { type: String },
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  groupDescription: { type: String },
  groupCreatedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Message Schema (works for both group and one-on-one)
const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  }, // New field for message status
});

// Models
const ChatRequest = mongoose.model('ChatRequest', chatRequestSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = {
  ChatRequest,
  Chat,
  Message,
};