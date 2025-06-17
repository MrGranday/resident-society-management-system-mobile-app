

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// POST /api/events - Create a new event
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('POST /api/events payload:', req.body);
    const { title, description, dateTime, location, category, image } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!dateTime) missingFields.push('dateTime');
    if (!location) missingFields.push('location');
    if (!category) missingFields.push('category');
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate dateTime
    const eventDate = new Date(dateTime);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date and time' });
    }
    const now = new Date();
    console.log('Current time:', now, 'Event date:', eventDate);
    if (eventDate <= now) {
      return res.status(400).json({ message: 'Event date and time must be in the future' });
    }

    // Get user and society
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.society) {
      return res.status(400).json({ message: 'User is not associated with a society' });
    }

    // Validate and store base64 image
    let imageData = undefined;
    if (image) {
      const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ message: 'Invalid image format' });
      }
      const extension = matches[1].toLowerCase();
      if (!['jpeg', 'jpg', 'png'].includes(extension)) {
        return res.status(400).json({ message: 'Only JPEG/PNG images are allowed' });
      }
      const buffer = Buffer.from(matches[2], 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ message: 'Image size exceeds 5MB limit' });
      }
      imageData = image; // Store base64 string directly
      console.log('Image validated:', { format: extension, size: buffer.length });
    }

    // Create event
    const event = new Event({
      title,
      description,
      image: imageData,
      dateTime: eventDate,
      location,
      category,
      role: 'Event Manager',
      status: 'Open',
      organizer: req.userId,
      society: user.society,
      createdAt: new Date(),
    });

    await event.save();
    console.log('Saved event:', { _id: event._id, title: event.title, image: event.image ? 'base64' : null, organizer: event.organizer });
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// GET /api/events - Fetch all open events for the user's society
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.society) {
      return res.status(400).json({ message: 'User is not associated with a society' });
    }

    const events = await Event.find({ 
      society: user.society,
      status: 'Open'
    })
      .populate('organizer', 'name')
      .sort({ createdAt: -1 });

    console.log('Fetched events:', events.map(e => ({ _id: e._id, title: e.title, status: e.status, organizer: e.organizer?._id, dateTime: e.dateTime, image: e.image ? 'base64' : null })));
    res.json(events);
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

// PATCH /api/events/:id/finish - Mark an event as Finished
router.patch('/:id/finish', verifyToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.userId;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the user is the organizer
    if (event.organizer.toString() !== userId) {
      return res.status(403).json({ message: 'Only the event organizer can finish this event' });
    }

    // Update status to Finished
    event.status = 'Finished';
    await event.save();
    console.log('Event finished:', { _id: event._id, status: event.status, organizer: event.organizer });

    res.json({ message: 'Event marked as finished', event });
  } catch (error) {
    console.error('Finish event error:', error);
    res.status(500).json({ message: 'Failed to finish event', error: error.message });
  }
});

// GET /api/events/staff/:staffId - Fetch open events assigned to a staff member
router.get('/staff/:staffId', verifyToken, async (req, res) => {
  try {
    const { staffId } = req.params;
    console.log('GET /api/events/staff - staffId:', staffId, 'userId:', req.userId);

    // Verify staffId matches the authenticated user
    if (staffId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to access events for this staff member' });
    }

    // Get staff data
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    console.log('Staff data:', { _id: staff._id, role: staff.role, society: staff.society });

    const events = await Event.find({
      role: staff.role, // Match event role with staff role
      status: 'Open',
      society: staff.society,
    })
      .populate('organizer', 'name')
      .sort({ createdAt: -1 });

    console.log('Fetched staff events:', events.map(e => ({ 
      _id: e._id, 
      title: e.title, 
      status: e.status, 
      role: e.role, 
      organizer: e.organizer?._id, 
      dateTime: e.dateTime, 
      image: e.image ? e.image : null 
    })));
    res.json(events);
  } catch (error) {
    console.error('Fetch staff events error:', error);
    res.status(500).json({ message: 'Fetch staff events error', error: error.message });
  }
});

module.exports = router;