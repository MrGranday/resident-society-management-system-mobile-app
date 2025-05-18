

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
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
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// POST /api/issues - Create a new issue
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('POST /api/issues payload:', req.body);
    const { title, description, reporter, role, society, image, issueType } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!reporter) missingFields.push('reporter');
    if (!role) missingFields.push('role');
    if (!society) missingFields.push('society');
    if (!issueType) missingFields.push('issueType');
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate role
    const validRoles = ['Cleaner', 'Gardener', 'Event Manager', 'Security', 'Maintenance'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Validate issueType
    const validIssueTypes = ['General', 'Personal'];
    if (!validIssueTypes.includes(issueType)) {
      return res.status(400).json({ message: 'Invalid issue type' });
    }

    // Get user and validate society
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.society || user.society.toString() !== society) {
      return res.status(400).json({ message: 'Invalid society' });
    }

    // Validate image
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
      imageData = image;
    }

    // Ensure reporterUser is set
    if (!req.userId) {
      return res.status(400).json({ message: 'Invalid user ID from token' });
    }

    // Create issue
    const issue = new Issue({
      title,
      description,
      reporter,
      reporterUser: req.userId,
      role,
      society,
      issueType,
      image: imageData,
      createdAt: new Date(),
      status: 'Open',
      assignedTo: req.body.assignedTo || null
    });

    await issue.save();
    console.log('Saved issue:', { _id: issue._id, title: issue.title, issueType: issue.issueType, role: issue.role, society: issue.society });
    res.status(201).json({ message: 'Issue created successfully', issue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ message: 'Failed to create issue', error: error.message });
  }
});

// GET /api/issues - Fetch all open and under review general issues for the user's society
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.society) {
      return res.status(400).json({ message: 'User is not associated with a society' });
    }

    const issues = await Issue.find({ 
      society: user.society, 
      status: { $in: ['Open', 'Under Review'] },
      issueType: { $eq: 'General', $exists: true }
    })
      .populate('reporterUser', 'name address')
      .sort({ createdAt: -1 });

    console.log('Fetched resident issues:', issues.map(i => ({ _id: i._id, title: i.title, status: i.status, issueType: i.issueType })));
    res.json(issues);
  } catch (error) {
    console.error('Fetch issues error:', error);
    res.status(500).json({ message: 'Failed to fetch issues', error: error.message });
  }
});

// GET /api/issues/resolved - Fetch resolved issues for the user's society
router.get('/resolved', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.society) {
      return res.status(400).json({ message: 'User is not associated with a society' });
    }

    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    const issues = await Issue.find({ 
      society: user.society, 
      status: 'Resolved'
    })
      .populate('reporterUser', 'name address')
      .sort({ createdAt: sortOrder });

    console.log('Fetched resolved issues:', issues.map(i => ({ 
      _id: i._id, 
      title: i.title, 
      status: i.status, 
      createdAt: i.createdAt,
      resolvedAt: i.resolvedAt 
    })));

    res.json(issues);
  } catch (error) {
    console.error('Fetch resolved issues error:', error);
    res.status(500).json({ message: 'Failed to fetch resolved issues', error: error.message });
  }
});


router.get('/staff/:staffId', verifyToken, async (req, res) => {
  try {
    const { staffId } = req.params;
    const { issueType } = req.query;
    console.log('GET /api/issues/staff - staffId:', staffId, 'userId:', req.userId, 'issueType:', issueType);

    if (staffId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to access issues for this staff member' });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    console.log('Staff data:', { _id: staff._id, role: staff.role, society: staff.society });

    // Validate issueType
    const validIssueTypes = ['General', 'Personal'];
    const selectedIssueType = issueType && validIssueTypes.includes(issueType) ? issueType : 'General';

    const query = {
      role: staff.role,
      status: 'Open',
      society: staff.society,
      issueType: { $eq: selectedIssueType, $exists: true }
    };

    const issues = await Issue.find(query)
      .populate('reporterUser', 'name address houseNumber') // Added houseNumber
      .sort({ createdAt: -1 });

    console.log(`Fetched ${selectedIssueType.toLowerCase()} issues:`, issues.map(i => ({ 
      _id: i._id, 
      title: i.title, 
      status: i.status, 
      issueType: i.issueType, 
      reporter: i.reporter, 
      reporterAddress: i.reporterUser?.address || 'Not provided',
      reporterHouseNumber: i.reporterUser?.houseNumber || 'Not provided'
    })));
    res.json(issues);
  } catch (error) {
    console.error('Fetch staff issues error:', error);
    res.status(500).json({ message: 'Failed to fetch staff issues', error: error.message });
  }
});

// PATCH /api/issues/:id/resolve - Mark an issue as Resolved
router.patch('/:id/resolve', verifyToken, async (req, res) => {
  try {
    const issueId = req.params.id;
    const userId = req.userId;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const staff = await Staff.findById(userId);
    if (!staff || issue.role !== staff.role) {
      return res.status(403).json({ message: 'Only assigned staff can resolve this issue' });
    }

    issue.status = 'Resolved';
    issue.resolvedAt = new Date();
    await issue.save();
    console.log('Issue resolved:', { _id: issue._id, status: issue.status });

    res.json({ message: 'Issue marked as resolved', issue });
  } catch (error) {
    console.error('Resolve issue error:', error);
    res.status(500).json({ message: 'Failed to resolve issue', error: error.message });
  }
});

// PUT /api/issues/:id/status - Update issue status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const issueId = req.params.id;
    const { status } = req.body;
    const userId = req.userId;

    console.log('PUT /api/issues/:id/status - issueId:', issueId, 'status:', status, 'userId:', userId);

    // Validate ObjectId
    const ObjectId = mongoose.Types.ObjectId;
    if (!ObjectId.isValid(issueId)) {
      console.log('Invalid ObjectId:', issueId);
      return res.status(400).json({ message: 'Invalid issue ID format' });
    }

    // Validate status
    const validStatuses = ['Open', 'Under Review', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      console.log('Issue not found for ID:', issueId);
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user is the reporter or staff with matching role
    const user = await User.findById(userId);
    const staff = await Staff.findById(userId);
    const isReporter = issue.reporterUser && issue.reporterUser.toString() === userId;
    const isAssignedStaff = staff && issue.role === staff.role;

    if (!isReporter && !isAssignedStaff) {
      return res.status(403).json({ message: 'Only the reporter or assigned staff can update this issue status' });
    }

    // Restrict status changes
    if (issue.status === 'Resolved') {
      return res.status(400).json({ message: 'Cannot change status of a resolved issue' });
    }
    if (status === 'Resolved' && !isAssignedStaff) {
      return res.status(403).json({ message: 'Only assigned staff can mark an issue as Resolved' });
    }

    // Update status and resolvedAt without triggering full validation
    issue.status = status;
    if (status === 'Resolved') {
      issue.resolvedAt = new Date();
    } else {
      issue.resolvedAt = null;
    }
    await issue.save({ validateBeforeSave: false });

    console.log('Issue status updated:', { _id: issue._id, status: issue.status });

    res.json({ message: 'Issue status updated successfully', issue });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ message: 'Failed to update issue status', error: error.message });
  }
});

// Test route for debugging
router.get('/test', (req, res) => {
  res.send('Issues router is working');
});

module.exports = router;