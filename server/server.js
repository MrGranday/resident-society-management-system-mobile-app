




require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const societyRoutes = require('./routes/societies');
const issueRoutes = require('./routes/issueRoutes');
const eventRoutes = require('./routes/events');
const announcementRoutes = require('./routes/announcements');
const housingRoutes = require('./routes/housingRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
  pingTimeout: 10000,
  pingInterval: 10000,
});

// Ensure Uploads directory exists
const uploadDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created Uploads directory');
}

// Increase payload limit to 10MB
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Serve static files
app.use('/Uploads', express.static(uploadDir));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per windowMs
});
app.use(limiter);

// Log MongoDB URI for debugging
console.log('MongoDB URI:', process.env.MONGODB_URI);

// Validate environment variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/staff', staffRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', announcementRoutes);
app.use('/api/societies/:societyId/housing', housingRoutes);
app.use('/api/chat', chatRoutes(io)); // Pass io to chatRoutes

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'Client IP:', socket.handshake.address);

  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`User ${userId} joined room`);
      socket.emit('joinConfirmed', userId);
    } else {
      console.error('Invalid userId for join:', userId);
    }
  });

  socket.on('sendMessage', async ({ chatId, senderId, content }, callback) => {
    console.log('Received sendMessage:', { chatId, senderId, content, socketId: socket.id });
    try {
      if (!chatId || !senderId || !content) {
        console.error('Invalid sendMessage payload:', { chatId, senderId, content });
        if (callback) callback({ error: 'Invalid message payload' });
        return socket.emit('error', { message: 'Invalid message payload' });
      }
      const Message = mongoose.model('Message');
      const Chat = mongoose.model('Chat');
      const message = new Message({
        chatId: new mongoose.Types.ObjectId(chatId),
        sender: new mongoose.Types.ObjectId(senderId),
        content,
        status: 'sent',
      });
      await message.save();
      console.log('Message saved:', {
        _id: message._id.toString(),
        chatId: message.chatId.toString(),
        sender: message.sender.toString(),
        content: message.content,
        timestamp: message.timestamp,
        status: message.status,
      });
      const chat = await Chat.findById(chatId).populate('participants', '_id');
      if (!chat) {
        console.error('Chat not found for chatId:', chatId);
        if (callback) callback({ error: 'Chat not found' });
        return socket.emit('error', { message: 'Chat not found' });
      }
      console.log('Chat found:', {
        chatId,
        participants: chat.participants.map(p => p._id.toString()),
      });
      chat.participants.forEach((user) => {
        const userId = user._id.toString();
        console.log(`Emitting newMessage to user: ${userId}`);
        io.to(userId).emit('newMessage', {
          chatId: chatId.toString(),
          senderId: senderId.toString(),
          content,
          timestamp: message.timestamp,
          status: 'sent',
          messageId: message._id.toString(),
        });
      });
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: { content, timestamp: message.timestamp },
      });
      console.log('Updated chat lastMessage for chatId:', chatId);
      if (callback) callback({ success: 'Message sent' });
      setTimeout(async () => {
        await Message.findByIdAndUpdate(message._id, { status: 'delivered' });
        console.log(`Emitting messageDelivered for message: ${message._id}`);
        chat.participants.forEach((user) => {
          const userId = user._id.toString();
          io.to(userId).emit('messageDelivered', {
            chatId: chatId.toString(),
            messageId: message._id.toString(),
          });
        });
      }, 500);
    } catch (error) {
      console.error('Message error:', error.message, error.stack);
      if (callback) callback({ error: 'Server error: ' + error.message });
      socket.emit('error', { message: 'Failed to send message: ' + error.message });
    }
  });

  socket.on('chatRequest', ({ from, to, requestId }) => {
    console.log('Received chatRequest:', { from, to, requestId });
    io.to(to.toString()).emit('chatRequest', { from, requestId });
  });

  socket.on('requestAccepted', ({ chatId }) => {
    console.log('Received requestAccepted:', { chatId });
    io.to(chatId.toString()).emit('requestAccepted', { chatId });
  });

  socket.on('groupCreated', ({ chatId, groupName, participants }) => {
    console.log('Received groupCreated:', { chatId, groupName, participants });
    participants.forEach((userId) => {
      io.to(userId.toString()).emit('groupCreated', { chatId, groupName });
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Debug route to confirm Socket.IO is listening
app.get('/api/socket/debug', (req, res) => {
  console.log('Socket.IO debug: Active sockets:', Object.keys(io.sockets.sockets).length);
  res.json({ status: 'Socket.IO active', activeSockets: Object.keys(io.sockets.sockets).length });
});

// Default route for testing
app.get('/api/test', (req, res) => res.send('Server is running'));

// Catch-all for unmatched routes
app.use((req, res) => {
  console.log(`No route found for: ${req.method} ${req.url}`);
  res.status(404).send('Route not found');
});

// Graceful shutdown
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});