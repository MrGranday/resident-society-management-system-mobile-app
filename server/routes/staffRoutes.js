const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

router.post('/staff-login', async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    console.log('Staff login attempt:', { phoneNumber });
    if (!phoneNumber || !password) {
      console.log('Missing fields:', { phoneNumber, password });
      return res.status(400).json({ message: 'Phone number and password are required.' });
    }

    // Find staff by phone number
    const staff = await Staff.findOne({ phoneNumber });
    if (!staff) {
      console.log('Staff not found for phoneNumber:', phoneNumber);
      return res.status(400).json({ message: `Staff with phone number ${phoneNumber} not found.` });
    }
    console.log('Found staff:', { id: staff._id, user: staff.user });

    // Find the associated user
    let user;
    if (staff.user) {
      user = await User.findById(staff.user);
      console.log('Tried finding user by staff.user:', { userId: staff.user, found: !!user });
    }
    // If user not found by staff.user or staff.user is undefined, try by phoneNumber
    if (!user) {
      user = await User.findOne({ phoneNumber });
      if (user) {
        console.log('Found user by phoneNumber:', { id: user._id, phoneNumber });
        // Update staff.user to link the correct user
        await Staff.updateOne(
          { _id: staff._id },
          { $set: { user: user._id } }
        );
        console.log('Updated staff.user for staff:', { staffId: staff._id, userId: user._id });
      }
    }

    if (!user) {
      console.log('No user found for staff:', { staffId: staff._id, phoneNumber });
      return res.status(400).json({ message: 'Associated user not found.' });
    }

    // Validate password
    if (!user.password) {
      console.log('No password for user:', user._id);
      return res.status(500).json({ message: 'No password stored for this user.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Password mismatch for user:', { userId: user._id, phoneNumber });
      return res.status(400).json({ message: 'Invalid password.' });
    }
    console.log('Password valid for user:', user._id);

    // Create token
    const token = jwt.sign(
      { id: staff._id, role: 'staff' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );

    // Prepare staff data
    const staffData = {
      _id: staff._id,
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber,
      role: staff.role,
      startDate: staff.startDate,
      society: staff.society,
    };

    console.log('Login successful for staff:', staff._id);
    res.status(200).json({
      message: 'Staff login successful',
      staff: staffData,
      token,
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Keep other routes unchanged
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;
    const staff = await Staff.findById(req.staffId);

    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    if (phoneNumber && phoneNumber !== staff.phoneNumber) {
      const existingStaff = await Staff.findOne({ phoneNumber });
      if (existingStaff) return res.status(400).json({ message: 'Phone number already exists in staff' });

      const user = await User.findById(staff.user);
      if (!user) return res.status(404).json({ message: 'Associated user not found' });
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) return res.status(400).json({ message: 'Phone number already exists in users' });

      staff.phoneNumber = phoneNumber;
      user.phoneNumber = phoneNumber;
      await user.save();
    }
    if (fullName) staff.fullName = fullName;

    await staff.save();

    const updatedStaff = {
      _id: staff._id,
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber,
      role: staff.role,
      startDate: staff.startDate,
      society: staff.society,
    };

    res.json({ message: 'Profile updated successfully', staff: updatedStaff });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const staff = await Staff.findById(req.staffId);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const user = await User.findById(staff.user);
    if (!user) return res.status(404).json({ message: 'Associated user not found' });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

module.exports = router;