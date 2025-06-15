

// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const User = require('../models/User');
// const Staff = require('../models/Staff');
// const { Chat, ChatRequest, Message } = require('../models/Chat');

// module.exports = (io) => {
//   // Search users by phoneNumber or name within the same society
//   router.get('/search', async (req, res) => {
//     try {
//       const { query, societyId, userType } = req.query;
//       console.log('Search request:', { query, societyId, userType });

//       if (!societyId || !query) {
//         console.log('Missing societyId or query:', { societyId, query });
//         return res.status(400).json({ error: 'Society ID and query are required' });
//       }

//       let users;
//       const searchConditions = {
//         society: societyId,
//         $or: [
//           { phoneNumber: { $regex: query, $options: 'i' } },
//           { name: { $regex: query, $options: 'i' } },
//         ],
//       };

//       if (userType === 'resident') {
//         searchConditions.role = 'resident';
//       } else if (userType === 'staff') {
//         searchConditions.role = 'staff';
//       } else {
//         console.log('Invalid userType:', userType);
//         return res.status(400).json({ error: 'Invalid userType' });
//       }

//       users = await User.find(searchConditions).select('name phoneNumber _id role');
//       console.log('Search results:', users.length, users.map(u => ({ _id: u._id, name: u.name })));
//       res.json(users);
//     } catch (error) {
//       console.error('Search error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Get manager for a society
//   router.get('/manager', async (req, res) => {
//     try {
//       const { societyId } = req.query;
//       console.log('Manager request:', { societyId });

//       if (!mongoose.Types.ObjectId.isValid(societyId)) {
//         console.log('Invalid societyId:', societyId);
//         return res.status(400).json({ error: 'Invalid society ID' });
//       }

//       const manager = await User.findOne({ society: societyId, role: 'manager' }).select('name _id role');
//       if (!manager) {
//         console.log('Manager not found for society:', societyId);
//         return res.status(404).json({ error: 'Manager not found' });
//       }

//       console.log('Manager found:', { _id: manager._id, name: manager.name });
//       res.json(manager);
//     } catch (error) {
//       console.error('Manager fetch error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Get user's chats
//   router.get('/user/:userId', async (req, res) => {
//     try {
//       let userId = req.params.userId;
//       console.log('Fetching chats for user:', userId);

//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//         console.log('Invalid userId:', userId);
//         return res.status(400).json({ error: 'Invalid user ID' });
//       }

//       // Check if userId is a Staff _id
//       const staff = await Staff.findById(userId).select('userField');
//       if (staff && staff.userField) {
//         userId = staff.userField.toString();
//         console.log('Resolved staffId:', req.params.userId, 'to userId:', userId);
//       }

//       const chats = await Chat.find({ participants: userId })
//         .populate('participants', 'name role')
//         .select('participants isGroup groupName createdAt');
//       console.log('Chats found:', chats.length, chats.map(c => ({ _id: c._id, participants: c.participants.map(p => p._id) })));
//       res.json(chats);
//     } catch (error) {
//       console.error('Fetch chats error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // New endpoint to fetch User _id from Staff _id
//   router.get('/staff/:staffId/user', async (req, res) => {
//     try {
//       const { staffId } = req.params;
//       console.log('Fetching user for staff:', staffId);

//       if (!mongoose.Types.ObjectId.isValid(staffId)) {
//         console.log('Invalid staffId:', staffId);
//         return res.status(400).json({ error: 'Invalid staff ID' });
//       }

//       const staff = await Staff.findById(staffId).select('userField');
//       if (!staff || !staff.userField) {
//         console.log('Staff or userField not found:', staffId);
//         return res.status(404).json({ error: 'Staff or linked user not found' });
//       }

//       console.log('User _id found:', staff.userField.toString());
//       res.json({ userId: staff.userField.toString() });
//     } catch (error) {
//       console.error('Error fetching user from staff:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Get pending chat requests for a user (both incoming and outgoing)
//   router.get('/requests/:userId', async (req, res) => {
//     try {
//       let userId = req.params.userId;
//       console.log('Fetching requests for user:', userId);

//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//         console.log('Invalid userId:', userId);
//         return res.status(400).json({ error: 'Invalid user ID' });
//       }

//       // Check if userId is a Staff _id
//       const staff = await Staff.findById(userId).select('userField');
//       if (staff && staff.userField) {
//         userId = staff.userField.toString();
//         console.log('Resolved staffId:', req.params.userId, 'to userId:', userId);
//       }

//       // Fetch raw requests
//       const rawRequests = await ChatRequest.find({
//         $or: [{ to: userId, status: 'pending' }, { from: userId, status: 'pending' }],
//       });
//       console.log('Raw requests:', rawRequests.length, JSON.stringify(rawRequests, null, 2));

//       // Check if from users exist
//       const fromIds = rawRequests.map(req => req.from);
//       const fromUsers = await User.find({ _id: { $in: fromIds } }).select('name role');
//       console.log('From users:', fromUsers.length, JSON.stringify(fromUsers, null, 2));

//       // Fetch populated requests
//       const requests = await ChatRequest.find({
//         $or: [{ to: userId, status: 'pending' }, { from: userId, status: 'pending' }],
//       })
//         .populate({
//           path: 'from',
//           select: 'name role',
//           model: 'User',
//         })
//         .populate({
//           path: 'to',
//           select: 'name role',
//           model: 'User',
//         })
//         .select('from to requestMessage createdAt status')
//         .lean();

//       // Transform requests to handle null from/to fields
//       const transformedRequests = requests.map(req => ({
//         ...req,
//         from: req.from || { _id: req.from, name: 'Unknown User', role: 'unknown' },
//         to: req.to || { _id: req.to, name: 'Unknown User', role: 'unknown' },
//       }));

//       console.log('Populated requests:', transformedRequests.length, JSON.stringify(transformedRequests, null, 2));
//       res.json(transformedRequests);
//     } catch (error) {
//       console.error('Fetch chat requests error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Get pending chat requests for a staff user
//   router.get('/staff/requests/:staffId', async (req, res) => {
//     try {
//       const { staffId } = req.params;
//       console.log('Fetching requests for staff:', staffId);

//       // Validate staffId
//       if (!mongoose.Types.ObjectId.isValid(staffId)) {
//         console.log('Invalid staffId:', staffId);
//         return res.status(400).json({ error: 'Invalid staff ID' });
//       }

//       // Find staff document
//       const staff = await Staff.findById(staffId).select('userField fullName phoneNumber');
//       console.log('Staff found:', staff ? JSON.stringify(staff, null, 2) : 'null');
//       if (!staff) {
//         console.log('Staff document not found:', staffId);
//         return res.status(404).json({ error: 'Staff not found' });
//       }

//       // Log staff details
//       console.log('staff.toObject():', staff.toObject ? staff.toObject() : staff);
//       console.log('staff.userField value:', staff.userField, 'type:', typeof staff.userField);

//       // Access user field
//       const rawStaff = staff.toObject();
//       const userField = staff.userField || rawStaff.userField;
//       console.log('userField value:', userField, 'type:', typeof userField);

//       // Validate userField
//       if (!userField || !mongoose.Types.ObjectId.isValid(userField.toString())) {
//         console.log('Invalid or missing staff user field:', staffId, 'userField:', userField);
//         return res.status(404).json({ error: 'Linked user not found' });
//       }

//       const userId = userField.toString();
//       console.log('Resolved staffId:', staffId, 'to userId:', userId);

//       // Verify user exists
//       const user = await User.findById(userId).select('name role');
//       console.log('User found:', user ? JSON.stringify(user, null, 2) : 'null');
//       if (!user) {
//         console.log('Linked user not found:', userId);
//         return res.status(404).json({ error: 'Linked user not found' });
//       }

//       // Fetch raw requests
//       const rawRequests = await ChatRequest.find({
//         $or: [{ to: userId, status: 'pending' }, { from: userId, status: 'pending' }],
//       });
//       console.log('Raw requests:', rawRequests.length, JSON.stringify(rawRequests, null, 2));

//       // Check from users
//       const fromIds = rawRequests.map(req => req.from);
//       console.log('fromIds:', fromIds);
//       const fromUsers = await User.find({ _id: { $in: fromIds } }).select('name role');
//       console.log('From users:', fromUsers.length, JSON.stringify(fromUsers, null, 2));

//       // Fetch populated requests
//       const requests = await ChatRequest.find({
//         $or: [{ to: userId, status: 'pending' }, { from: userId, status: 'pending' }],
//       })
//         .populate({
//           path: 'from',
//           select: 'name role',
//           model: 'User',
//         })
//         .populate({
//           path: 'to',
//           select: 'name role',
//           model: 'User',
//         })
//         .select('from to requestMessage createdAt status')
//         .lean();

//       // Transform requests to handle null from/to fields
//       const transformedRequests = requests.map(req => ({
//         ...req,
//         from: req.from || { _id: req.from, name: 'Unknown User', role: 'unknown' },
//         to: req.to || { _id: req.to, name: 'Unknown User', role: 'unknown' },
//       }));

//       console.log('Populated requests:', transformedRequests.length, JSON.stringify(transformedRequests, null, 2));
//       res.json(transformedRequests);
//     } catch (error) {
//       console.error('Fetch staff chat requests error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Get messages for a chat
//   router.get('/messages/:chatId', async (req, res) => {
//     try {
//       const { chatId } = req.params;
//       console.log(`Fetching messages for chatId: ${chatId}`);

//       if (!mongoose.Types.ObjectId.isValid(chatId)) {
//         console.log('Invalid chatId:', chatId);
//         return res.status(400).json({ error: 'Invalid chat ID' });
//       }

//       const messages = await Message.find({ chatId })
//         .populate('sender', 'name role')
//         .select('sender content timestamp status _id');
//       console.log(`Messages found: ${messages.length}`, messages.map(m => ({
//         messageId: m._id.toString(),
//         content: m.content,
//         senderId: m.sender._id.toString(),
//         timestamp: m.timestamp,
//         status: m.status,
//       })));
//       res.json(messages);
//     } catch (error) {
//       console.error('Fetch messages error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Send chat request
//   router.post('/request', async (req, res) => {
//     try {
//       let { from, to, requestMessage } = req.body;
//       console.log('Sending chat request:', { from, to, requestMessage });

//       // Validate input
//       if (!from || !to) {
//         console.log('Missing from or to:', { from, to });
//         return res.status(400).json({ error: 'From and to user IDs are required' });
//       }

//       // Resolve Staff ID to User ID
//       if (mongoose.Types.ObjectId.isValid(from)) {
//         const staff = await Staff.findById(from).select('userField');
//         if (staff && staff.userField) {
//           from = staff.userField.toString();
//           console.log('Resolved staffId:', req.body.from, 'to userId:', from);
//         }
//       }

//       // Resolve Staff ID to User ID for 'to' field
//       if (mongoose.Types.ObjectId.isValid(to)) {
//         const staff = await Staff.findById(to).select('userField');
//         if (staff && staff.userField) {
//           to = staff.userField.toString();
//           console.log('Resolved staffId:', req.body.to, 'to userId:', to);
//         }
//       }

//       // Validate from and to
//       if (!mongoose.Types.ObjectId.isValid(from) || !mongoose.Types.ObjectId.isValid(to)) {
//         console.log('Invalid user IDs:', { from, to });
//         return res.status(400).json({ error: 'Invalid user IDs' });
//       }

//       // Verify from and to users exist
//       const fromUser = await User.findById(from).select('name role');
//       const toUser = await User.findById(to).select('name role');
//       if (!fromUser || !toUser) {
//         console.log('Users not found:', { fromUser: !!fromUser, toUser: !!toUser });
//         return res.status(400).json({ error: 'One or both users not found' });
//       }

//       if (from === to) {
//         console.log('Self-request attempted:', from);
//         return res.status(400).json({ error: 'Cannot send request to yourself' });
//       }

//       // Check existing requests
//       const existingRequest = await ChatRequest.findOne({
//         $or: [
//           { from, to, status: { $in: ['pending', 'accepted'] } },
//           { from: to, to: from, status: { $in: ['pending', 'accepted'] } },
//         ],
//       });
//       if (existingRequest) {
//         console.log('Existing request found:', existingRequest._id);
//         return res.status(400).json({ error: 'A chat request is already pending or accepted' });
//       }

//       // Check existing chat
//       const existingChat = await Chat.findOne({
//         participants: { $all: [from, to], $size: 2 },
//         isGroup: false,
//       });
//       if (existingChat) {
//         console.log('Existing chat found:', existingChat._id);
//         return res.status(400).json({ error: 'A chat already exists with this user' });
//       }

//       const chatRequest = new ChatRequest({ from, to, requestMessage, status: 'pending' });
//       await chatRequest.save();
//       console.log('Chat request created:', chatRequest._id);

//       // Emit socket event to recipient's room
//       io.to(to.toString()).emit('chatRequest', {
//         from: fromUser,
//         to: toUser,
//         requestId: chatRequest._id,
//         requestMessage,
//         status: 'pending',
//         createdAt: chatRequest.createdAt,
//       });

//       res.json({ requestId: chatRequest._id });
//     } catch (error) {
//       console.error('Request error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Accept chat request
//   router.post('/request/accept', async (req, res) => {
//     try {
//       const { requestId } = req.body;
//       console.log('Accepting chat request:', requestId);

//       if (!mongoose.Types.ObjectId.isValid(requestId)) {
//         console.log('Invalid requestId:', requestId);
//         return res.status(400).json({ error: 'Invalid request ID' });
//       }

//       const chatRequest = await ChatRequest.findById(requestId).populate('from to', 'name role');
//       if (!chatRequest) {
//         console.log('Chat request not found:', requestId);
//         return res.status(404).json({ error: 'Chat request not found' });
//       }

//       if (chatRequest.status !== 'pending') {
//         console.log('Chat request not pending:', chatRequest.status);
//         return res.status(400).json({ error: 'Chat request is not pending' });
//       }

//       const chat = new Chat({
//         participants: [chatRequest.from._id, chatRequest.to._id],
//         isGroup: false,
//       });
//       await chat.save();
//       console.log('Chat created:', chat._id);

//       if (chatRequest.requestMessage) {
//         const message = new Message({
//           chatId: chat._id,
//           sender: chatRequest.from._id,
//           content: chatRequest.requestMessage,
//           status: 'delivered',
//           timestamp: new Date(),
//         });
//         await message.save();
//         console.log('Initial message saved:', message._id);

//         // Emit newMessage event to both participants
//         io.to(chatRequest.from._id.toString()).emit('newMessage', {
//           chatId: chat._id.toString(),
//           senderId: chatRequest.from._id.toString(),
//           content: chatRequest.requestMessage,
//           timestamp: message.timestamp,
//           status: 'delivered',
//           messageId: message._id.toString(),
//         });
//         io.to(chatRequest.to._id.toString()).emit('newMessage', {
//           chatId: chat._id.toString(),
//           senderId: chatRequest.from._id.toString(),
//           content: chatRequest.requestMessage,
//           timestamp: message.timestamp,
//           status: 'delivered',
//           messageId: message._id.toString(),
//         });
//       }

//       chatRequest.status = 'accepted';
//       await chatRequest.save();
//       console.log('Chat request accepted:', requestId);

//       // Emit requestAccepted event to both participants
//       io.to(chatRequest.from._id.toString()).emit('requestAccepted', { chatId: chat._id });
//       io.to(chatRequest.to._id.toString()).emit('requestAccepted', { chatId: chat._id });

//       res.json({ chatId: chat._id });
//     } catch (error) {
//       console.error('Accept request error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Reject chat request
//   router.post('/request/reject', async (req, res) => {
//     try {
//       const { requestId } = req.body;
//       console.log('Rejecting chat request:', requestId);

//       if (!mongoose.Types.ObjectId.isValid(requestId)) {
//         console.log('Invalid requestId:', requestId);
//         return res.status(400).json({ error: 'Invalid request ID' });
//       }

//       const chatRequest = await ChatRequest.findById(requestId);
//       if (!chatRequest) {
//         console.log('Chat request not found:', requestId);
//         return res.status(404).json({ error: 'Chat request not found' });
//       }

//       chatRequest.status = 'rejected';
//       await chatRequest.save();
//       console.log('Chat request rejected:', requestId);

//       res.json({ message: 'Chat request rejected' });
//     } catch (error) {
//       console.error('Reject request error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Create group chat
//   router.post('/group/create', async (req, res) => {
//     try {
//       const { groupName, adminId, participants } = req.body;
//       console.log('Creating group chat:', { groupName, adminId, participants });

//       if (!groupName || !adminId || !participants || !Array.isArray(participants)) {
//         console.log('Invalid group creation payload:', { groupName, adminId, participants });
//         return res.status(400).json({ error: 'Invalid group creation payload' });
//       }

//       if (!mongoose.Types.ObjectId.isValid(adminId) || participants.some(p => !mongoose.Types.ObjectId.isValid(p))) {
//         console.log('Invalid adminId or participant IDs:', { adminId, participants });
//         return res.status(400).json({ error: 'Invalid admin or participant IDs' });
//       }

//       const chat = new Chat({
//         isGroup: true,
//         groupName,
//         participants: [adminId, ...participants],
//         admin: adminId,
//       });
//       await chat.save();
//       console.log('Group chat created:', chat._id);

//       // Emit groupCreated event to all participants
//       [adminId, ...participants].forEach(userId => {
//         io.to(userId.toString()).emit('groupCreated', {
//           chatId: chat._id,
//           groupName,
//           participants: [adminId, ...participants],
//         });
//       });

//       res.json({ chatId: chat._id });
//     } catch (error) {
//       console.error('Group creation error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   // Delete chat
//   router.delete('/:chatId', async (req, res) => {
//     try {
//       const { chatId } = req.params;
//       console.log(`Deleting chat: ${chatId}`);

//       if (!mongoose.Types.ObjectId.isValid(chatId)) {
//         console.log('Invalid chatId:', chatId);
//         return res.status(400).json({ error: 'Invalid chat ID' });
//       }

//       const chat = await Chat.findByIdAndDelete(chatId);
//       if (!chat) {
//         console.log('Chat not found:', chatId);
//         return res.status(404).json({ error: 'Chat not found' });
//       }

//       await Message.deleteMany({ chatId });
//       console.log('Chat and messages deleted:', chatId);

//       // Notify participants of chat deletion
//       chat.participants.forEach(userId => {
//         io.to(userId.toString()).emit('chatDeleted', { chatId });
//       });

//       res.json({ message: 'Chat deleted successfully' });
//     } catch (error) {
//       console.error('Delete chat error:', error.message, error.stack);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

//   return router;
// };


const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Staff = require('../models/Staff');
const { Chat, ChatRequest, Message } = require('../models/Chat');

// Utility function to ensure Staff has a valid userField
const ensureStaffUserField = async (staffId) => {
  try {
    const staff = await Staff.findById(staffId).select('fullName phoneNumber userField society');
    if (!staff) {
      console.log(`Staff not found: ${staffId}`);
      throw new Error('Staff not found');
    }

    if (!staff.userField) {
      console.log(`Staff ${staff.fullName} (${staffId}) missing userField`);

      // Check if a User document exists with the same phoneNumber
      let user = await User.findOne({ phoneNumber: staff.phoneNumber });
      if (!user) {
        // Create a new User document
        user = new User({
          name: staff.fullName,
          phoneNumber: staff.phoneNumber,
          role: 'staff',
          society: staff.society,
          password: 'defaultPassword', // Placeholder: In production, generate a secure password or prompt user to set one
          createdAt: new Date(),
        });
        await user.save();
        console.log(`Created new user for staff ${staffId}: ${user._id}`);
      }

      // Update Staff document with userField
      await Staff.updateOne(
        { _id: staffId },
        { $set: { userField: user._id } }
      );
      console.log(`Linked staff ${staffId} to user ${user._id}`);
      return user._id;
    }

    // Verify existing userField is valid
    const user = await User.findById(staff.userField);
    if (!user) {
      console.log(`Invalid userField ${staff.userField} for staff ${staffId}`);
      throw new Error('Linked user not found');
    }
    return staff.userField;
  } catch (error) {
    console.error('Error ensuring staff userField:', error.message);
    throw error;
  }
};

module.exports = (io) => {
  // Search users by phoneNumber or name within the same society
  router.get('/search', async (req, res) => {
    try {
      const { query, societyId, userType } = req.query;
      console.log('Search request:', { query, societyId, userType });

      if (!societyId || !query) {
        console.log('Missing societyId or query:', { societyId, query });
        return res.status(400).json({ error: 'Society ID and query are required' });
      }

      let users;
      const searchConditions = {
        society: societyId,
        $or: [
          { phoneNumber: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
        ],
      };

      if (userType === 'resident') {
        searchConditions.role = 'resident';
      } else if (userType === 'staff') {
        searchConditions.role = 'staff';
      } else {
        console.log('Invalid userType:', userType);
        return res.status(400).json({ error: 'Invalid userType' });
      }

      users = await User.find(searchConditions).select('name phoneNumber _id role');
      console.log('Search results:', users.length, users.map(u => ({ _id: u._id, name: u.name })));
      res.json(users);
    } catch (error) {
      console.error('Search error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get manager for a society
  router.get('/manager', async (req, res) => {
    try {
      const { societyId } = req.query;
      console.log('Manager request:', { societyId });

      if (!mongoose.Types.ObjectId.isValid(societyId)) {
        console.log('Invalid societyId:', societyId);
        return res.status(400).json({ error: 'Invalid society ID' });
      }

      const manager = await User.findOne({ society: societyId, role: 'manager' }).select('name _id role');
      if (!manager) {
        console.log('Manager not found for society:', societyId);
        return res.status(404).json({ error: 'Manager not found' });
      }

      console.log('Manager found:', { _id: manager._id, name: manager.name });
      res.json(manager);
    } catch (error) {
      console.error('Manager fetch error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get user's chats
  router.get('/user/:userId', async (req, res) => {
    try {
      let userId = req.params.userId;
      console.log('Fetching chats for user:', userId);

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log('Invalid userId:', userId);
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Check if userId is a Staff _id
      const staff = await Staff.findById(userId).select('userField');
      if (staff && staff.userField) {
        userId = staff.userField.toString();
        console.log('Resolved staffId:', req.params.userId, 'to userId:', userId);
      }

      const chats = await Chat.find({ participants: userId })
        .populate('participants', 'name role')
        .select('participants isGroup groupName createdAt');
      console.log('Chats found:', chats.length, chats.map(c => ({ _id: c._id, participants: c.participants.map(p => p._id) })));
      res.json(chats);
    } catch (error) {
      console.error('Fetch chats error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // New endpoint to fetch User _id from Staff _id
  router.get('/staff/:staffId/user', async (req, res) => {
    try {
      const { staffId } = req.params;
      console.log('Fetching user for staff:', staffId);

      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        console.log('Invalid staffId:', staffId);
        return res.status(400).json({ error: 'Invalid staff ID' });
      }

      const userId = await ensureStaffUserField(staffId);
      console.log('User _id found:', userId.toString());
      res.json({ userId: userId.toString() });
    } catch (error) {
      console.error('Error fetching user from staff:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get pending chat requests for a user (both incoming and outgoing)
  router.get('/requests/:userId', async (req, res) => {
    try {
      let userId = req.params.userId;
      console.log('Fetching requests for user:', userId);

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log('Invalid userId:', userId);
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Check if userId is a Staff _id
      const staff = await Staff.findById(userId).select('userField');
      if (staff && staff.userField) {
        userId = staff.userField.toString();
        console.log('Resolved staffId:', req.params.userId, 'to userId:', userId);
      }

      const rawRequests = await ChatRequest.find({
        $or: [{ to: userId, status: 'pending' }, { from: userId, status: 'pending' }],
      });
      console.log('Raw requests:', rawRequests.length, JSON.stringify(rawRequests, null, 2));

      const fromIds = rawRequests.map(req => req.from);
      console.log('fromIds:', fromIds);
      const fromUsers = await User.find({ _id: { $in: fromIds } }).select('name role');
      console.log('From users:', fromUsers.length, JSON.stringify(fromUsers, null, 2));

      const requests = await ChatRequest.find({
        $or: [{ to: userId, status: 'pending' }, { from: userId, status: 'pending' }],
      })
        .populate({
          path: 'from',
          select: 'name role',
          model: 'User',
        })
        .populate({
          path: 'to',
          select: 'name role',
          model: 'User',
        })
        .select('from to requestMessage createdAt status')
        .lean();

      const transformedRequests = requests.map(req => ({
        ...req,
        from: req.from || { _id: req.from, name: 'Unknown User', role: 'unknown' },
        to: req.to || { _id: req.to, name: 'Unknown User', role: 'unknown' },
      }));

      console.log('Populated requests:', transformedRequests.length, JSON.stringify(transformedRequests, null, 2));
      res.json(transformedRequests);
    } catch (error) {
      console.error('Fetch chat requests error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get pending chat requests for a staff user
  router.get('/staff/requests/:staffId', async (req, res) => {
    try {
      const { staffId } = req.params;
      console.log('Fetching requests for staff:', staffId);

      // Validate staffId
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        console.log('Invalid staffId:', staffId);
        return res.status(400).json({ error: 'Invalid staff ID' });
      }

      // Ensure staff has a valid userField
      const userId = await ensureStaffUserField(staffId);
      console.log('Resolved staffId:', staffId, 'to userId:', userId);

      // Fetch staff document to log details
      const staff = await Staff.findById(staffId).select('userField fullName phoneNumber');
      console.log('Staff found:', staff ? JSON.stringify(staff, null, 2) : 'null');
      if (!staff) {
        console.log('Staff document not found:', staffId);
        return res.status(404).json({ error: 'Staff not found' });
      }

      // Verify user exists
      const user = await User.findById(userId).select('name role');
      console.log('User found:', user ? JSON.stringify(user, null, 2) : 'null');
      if (!user) {
        console.log('Linked user not found:', userId);
        return res.status(404).json({ error: 'Linked user not found' });
      }

      // Fetch raw requests
      const rawRequests = await ChatRequest.find({
        $or: [{ to: userId, status: 'pending' }, { from: userId, status: 'pending' }],
      });
      console.log('Raw requests:', rawRequests.length, JSON.stringify(rawRequests, null, 2));

      // Fetch populated requests
      const requests = await ChatRequest.find({
        $or: [{ to: userId, status: 'pending' }, { from: userId, status: 'pending' }],
      })
        .populate({
          path: 'from',
          select: 'name role',
          model: 'User',
        })
        .populate({
          path: 'to',
          select: 'name role',
          model: 'User',
        })
        .select('from to requestMessage createdAt status')
        .lean();

      const transformedRequests = requests.map(req => ({
        ...req,
        from: req.from || { _id: req.from, name: 'Unknown User', role: 'unknown' },
        to: req.to || { _id: req.to, name: 'Unknown User', role: 'unknown' },
      }));

      console.log('Populated requests:', transformedRequests.length, JSON.stringify(transformedRequests, null, 2));
      res.json(transformedRequests);
    } catch (error) {
      console.error('Fetch staff chat requests error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get messages for a chat
  router.get('/messages/:chatId', async (req, res) => {
    try {
      const { chatId } = req.params;
      console.log(`Fetching messages for chatId: ${chatId}`);

      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        console.log('Invalid chatId:', chatId);
        return res.status(400).json({ error: 'Invalid chat ID' });
      }

      const messages = await Message.find({ chatId })
        .populate('sender', 'name role')
        .select('sender content timestamp status _id');
      console.log(`Messages found: ${messages.length}`, messages.map(m => ({
        messageId: m._id.toString(),
        content: m.content,
        senderId: m.sender._id.toString(),
        timestamp: m.timestamp,
        status: m.status,
      })));
      res.json(messages);
    } catch (error) {
      console.error('Fetch messages error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Send chat request
  router.post('/request', async (req, res) => {
    try {
      let { from, to, requestMessage } = req.body;
      console.log('Sending chat request:', { from, to, requestMessage });

      // Validate input
      if (!from || !to) {
        console.log('Missing from or to:', { from, to });
        return res.status(400).json({ error: 'From and to user IDs are required' });
      }

      // Resolve Staff ID to User ID for 'from'
      if (mongoose.Types.ObjectId.isValid(from)) {
        const staffFrom = await Staff.findById(from).select('userField');
        if (staffFrom && staffFrom.userField) {
          from = staffFrom.userField.toString();
          console.log('Resolved staffId:', req.body.from, 'to userId:', from);
        } else if (staffFrom) {
          // Ensure userField exists
          from = (await ensureStaffUserField(from)).toString();
          console.log('Ensured userField for staffId:', req.body.from, 'to userId:', from);
        }
      }

      // Resolve Staff ID to User ID for 'to'
      if (mongoose.Types.ObjectId.isValid(to)) {
        const staffTo = await Staff.findById(to).select('userField');
        if (staffTo && staffTo.userField) {
          to = staffTo.userField.toString();
          console.log('Resolved staffId:', req.body.to, 'to userId:', to);
        } else if (staffTo) {
          // Ensure userField exists
          to = (await ensureStaffUserField(to)).toString();
          console.log('Ensured userField for staffId:', req.body.to, 'to userId:', to);
        }
      }

      // Validate from and to as User IDs
      if (!mongoose.Types.ObjectId.isValid(from) || !mongoose.Types.ObjectId.isValid(to)) {
        console.log('Invalid user IDs after resolution:', { from, to });
        return res.status(400).json({ error: 'Invalid user IDs' });
      }

      // Verify from and to users exist
      const fromUser = await User.findById(from).select('name role');
      const toUser = await User.findById(to).select('name role');
      console.log('User lookup:', { fromUser: !!fromUser, toUser: !!toUser });
      if (!fromUser || !toUser) {
        console.log('Users not found:', { fromUser: !!fromUser, toUser: !!toUser });
        return res.status(400).json({ error: 'One or both users not found' });
      }

      if (from === to) {
        console.log('Self-request attempted:', from);
        return res.status(400).json({ error: 'Cannot send request to yourself' });
      }

      // Check existing requests
      const existingRequest = await ChatRequest.findOne({
        $or: [
          { from, to, status: { $in: ['pending', 'accepted'] } },
          { from: to, to: from, status: { $in: ['pending', 'accepted'] } },
        ],
      });
      if (existingRequest) {
        console.log('Existing request found:', existingRequest._id);
        return res.status(400).json({ error: 'A chat request is already pending or accepted' });
      }

      // Check existing chat
      const existingChat = await Chat.findOne({
        participants: { $all: [from, to], $size: 2 },
        isGroup: false,
      });
      if (existingChat) {
        console.log('Existing chat found:', existingChat._id);
        return res.status(400).json({ error: 'A chat already exists with this user' });
      }

      const chatRequest = new ChatRequest({ from, to, requestMessage, status: 'pending' });
      await chatRequest.save();
      console.log('Chat request created:', chatRequest._id);

      // Emit socket event to recipient's room
      io.to(to.toString()).emit('chatRequest', {
        from: fromUser,
        to: toUser,
        requestId: chatRequest._id,
        requestMessage,
        status: 'pending',
        createdAt: chatRequest.createdAt,
      });

      res.json({ requestId: chatRequest._id });
    } catch (error) {
      console.error('Request error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Accept chat request
  router.post('/request/accept', async (req, res) => {
    try {
      const { requestId } = req.body;
      console.log('Accepting chat request:', requestId);

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        console.log('Invalid requestId:', requestId);
        return res.status(400).json({ error: 'Invalid request ID' });
      }

      const chatRequest = await ChatRequest.findById(requestId).populate('from to', 'name role');
      if (!chatRequest) {
        console.log('Chat request not found:', requestId);
        return res.status(404).json({ error: 'Chat request not found' });
      }

      if (chatRequest.status !== 'pending') {
        console.log('Chat request not pending:', chatRequest.status);
        return res.status(400).json({ error: 'Chat request is not pending' });
      }

      const chat = new Chat({
        participants: [chatRequest.from._id, chatRequest.to._id],
        isGroup: false,
        createdAt: new Date(),
      });
      await chat.save();
      console.log('Chat created:', {
        _id: chat._id,
        participants: chat.participants.map(id => id.toString()),
        isGroup: chat.isGroup,
        createdAt: chat.createdAt,
      });

      // Verify chat exists in database
      const savedChat = await Chat.findById(chat._id);
      if (!savedChat) {
        console.log('Failed to verify saved chat:', chat._id);
        throw new Error('Chat creation failed');
      }
      console.log('Verified saved chat:', savedChat._id);

      if (chatRequest.requestMessage) {
        const message = new Message({
          chatId: chat._id,
          sender: chatRequest.from._id,
          content: chatRequest.requestMessage,
          status: 'delivered',
          timestamp: new Date(),
        });
        await message.save();
        console.log('Initial message saved:', message._id);

        // Emit newMessage event to both participants
        io.to(chatRequest.from._id.toString()).emit('newMessage', {
          chatId: chat._id.toString(),
          senderId: chatRequest.from._id.toString(),
          content: chatRequest.requestMessage,
          timestamp: message.timestamp,
          status: 'delivered',
          messageId: message._id.toString(),
        });
        io.to(chatRequest.to._id.toString()).emit('newMessage', {
          chatId: chat._id.toString(),
          senderId: chatRequest.from._id.toString(),
          content: chatRequest.requestMessage,
          timestamp: message.timestamp,
          status: 'delivered',
          messageId: message._id.toString(),
        });
      }

      chatRequest.status = 'accepted';
      await chatRequest.save();
      console.log('Chat request accepted:', requestId);

      // Emit requestAccepted event to both participants
      io.to(chatRequest.from._id.toString()).emit('requestAccepted', { chatId: chat._id.toString() });
      io.to(chatRequest.to._id.toString()).emit('requestAccepted', { chatId: chat._id.toString() });

      res.json({ chatId: chat._id });
    } catch (error) {
      console.error('Accept request error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Reject chat request
  router.post('/request/reject', async (req, res) => {
    try {
      const { requestId } = req.body;
      console.log('Rejecting chat request:', requestId);

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        console.log('Invalid requestId:', requestId);
        return res.status(400).json({ error: 'Invalid request ID' });
      }

      const chatRequest = await ChatRequest.findById(requestId);
      if (!chatRequest) {
        console.log('Chat request not found:', requestId);
        return res.status(404).json({ error: 'Chat request not found' });
      }

      chatRequest.status = 'rejected';
      await chatRequest.save();
      console.log('Chat request rejected:', requestId);

      res.json({ message: 'Chat request rejected' });
    } catch (error) {
      console.error('Reject request error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Create group chat
  router.post('/group/create', async (req, res) => {
    try {
      const { groupName, adminId, participants } = req.body;
      console.log('Creating group chat:', { groupName, adminId, participants });

      if (!groupName || !adminId || !participants || !Array.isArray(participants)) {
        console.log('Invalid group creation payload:', { groupName, adminId, participants });
        return res.status(400).json({ error: 'Invalid group creation payload' });
      }

      if (!mongoose.Types.ObjectId.isValid(adminId) || participants.some(p => !mongoose.Types.ObjectId.isValid(p))) {
        console.log('Invalid adminId or participant IDs:', { adminId, participants });
        return res.status(400).json({ error: 'Invalid admin or participant IDs' });
      }

      const chat = new Chat({
        isGroup: true,
        groupName,
        participants: [adminId, ...participants],
        admin: adminId,
      });
      await chat.save();
      console.log('Group chat created:', chat._id);

      // Emit groupCreated event to all participants
      [adminId, ...participants].forEach(userId => {
        io.to(userId.toString()).emit('groupCreated', {
          chatId: chat._id,
          groupName,
          participants: [adminId, ...participants],
        });
      });

      res.json({ chatId: chat._id });
    } catch (error) {
      console.error('Group creation error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Delete chat
  router.delete('/:chatId', async (req, res) => {
    try {
      const { chatId } = req.params;
      console.log(`Deleting chat: ${chatId}`);

      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        console.log('Invalid chatId:', chatId);
        return res.status(400).json({ error: 'Invalid chat ID' });
      }

      const chat = await Chat.findByIdAndDelete(chatId);
      if (!chat) {
        console.log('Chat not found:', chatId);
        return res.status(404).json({ error: 'Chat not found' });
      }

      await Message.deleteMany({ chatId });
      console.log('Chat and messages deleted:', chatId);

      // Notify participants of chat deletion
      chat.participants.forEach(userId => {
        io.to(userId.toString()).emit('chatDeleted', chatId);
      });

      res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
      console.error('Delete chat error:', error.message, error.stack);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};