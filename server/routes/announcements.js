const express = require('express');
const Announcement = require('../models/Announcement');
const Society = require('../models/Society');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.staffId = decoded.id;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const isManager = async (req, res, next) => {
  try {
    const user = await User.findById(req.staffId);
    if (!user || user.role !== 'manager') {
      return res.status(403).json({
        message: 'Unauthorized: User is not a manager',
        staffId: req.staffId,
      });
    }
    next();
  } catch (error) {
    console.error('isManager middleware error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all announcements for a specific society (all authenticated users)
router.get('/:societyId/announcements', verifyToken, async (req, res) => {
  try {
    const { societyId } = req.params;
    console.log('Fetching announcements for society:', societyId, 'by staff:', req.staffId);
    const announcements = await Announcement.find({ society: societyId }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
});

// Create a new announcement (manager only)
router.post('/:societyId/announcements', verifyToken, isManager, async (req, res) => {
  try {
    const { societyId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Verify society exists and user is the manager
    const society = await Society.findOne({ _id: societyId, manager: req.staffId });
    if (!society) {
      return res.status(403).json({ 
        message: 'Unauthorized: User is not the manager of this society',
        staffId: req.staffId,
        societyId
      });
    }

    const announcement = new Announcement({
      title,
      content,
      society: societyId,
      manager: req.staffId
    });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Error creating announcement', error: error.message });
  }
});

// Update an announcement (manager only)
router.put('/:societyId/announcements/:id', verifyToken, isManager, async (req, res) => {
  try {
    const { societyId, id } = req.params;
    const { title, content } = req.body;

    // Verify society exists and user is the manager
    const society = await Society.findOne({ _id: societyId, manager: req.staffId });
    if (!society) {
      return res.status(403).json({ 
        message: 'Unauthorized: User is not the manager of this society',
        staffId: req.staffId,
        societyId
      });
    }

    const announcement = await Announcement.findOne({ _id: id, society: societyId });
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found or unauthorized' });
    }

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.updatedAt = Date.now();
    await announcement.save();
    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Error updating announcement', error: error.message });
  }
});

// Delete an announcement (manager only)
router.delete('/:societyId/announcements/:id', verifyToken, isManager, async (req, res) => {
  try {
    const { societyId, id } = req.params;

    // Verify society exists and user is the manager
    const society = await Society.findOne({ _id: societyId, manager: req.staffId });
    if (!society) {
      return res.status(403).json({ 
        message: 'Unauthorized: User is not the manager of this society',
        staffId: req.staffId,
        societyId
      });
    }

    const announcement = await Announcement.findOneAndDelete({ _id: id, society: societyId });
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found or unauthorized' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Error deleting announcement', error: error.message });
  }
});

module.exports = router;