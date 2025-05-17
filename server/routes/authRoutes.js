

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Resident = require('../models/Resident');
const Society = require('../models/Society');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
require('dotenv').config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

router.post('/request-verification', async (req, res) => {
  const { name, phoneNumber, email, password, address, houseNumber, societyId, managerId } = req.body;
  try {
    if (!name || !phoneNumber || !email || !password || !address || !houseNumber || !societyId || !managerId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    let user = await User.findOne({ email });
    if (user && user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const verificationToken = crypto.randomBytes(32).toString('hex');
    if (user) {
      user.name = name;
      user.phoneNumber = phoneNumber;
      user.password = password;
      user.address = address;
      user.society = societyId;
      user.houseNumber = houseNumber;
      user.managerId = managerId;
      user.verificationToken = verificationToken;
      user.isEmailVerified = false;
    } else {
      user = new User({
        name,
        phoneNumber,
        email,
        password,
        address,
        houseNumber,
        society: societyId,
        managerId,
        role: 'resident',
        verificationToken,
        isEmailVerified: false,
      });
    }
    await user.save();
    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    const msg = {
      to: email,
      from: 'osmamghani009009@gmail.com', // Use your verified sender email
      subject: 'Verify Your RSMS Account',
      html: `
        <h2>RSMS Email Verification</h2>
        <p>Dear ${name},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #14B8A6; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link is valid for 24 hours.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>RSMS Team</p>
      `,
    };

    const emailResponse = await sgMail.send(msg);
    console.log(`Email send response for ${email}:`, emailResponse);
    console.log(`Verification link for ${email}: ${verificationLink}`);
    res.status(200).json({ message: `Verification link sent to ${email}` });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({ message: 'Failed to send verification link', error: error.message });
  }
});

router.get('/verify-email', async (req, res) => {
  console.log('req.query:', req.query);
  const { token, email } = req.query;
  try {
    if (!token || !email) {
      return res.status(400).json({ message: 'Token and email are required' });
    }
    const user = await User.findOne({ email, verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();
    const resident = new Resident({
      user: user._id,
      email,
      houseNumber: user.houseNumber,
      society: user.society,
      manager: user.managerId,
      status: 'Pending',
    });
    await resident.save();
    const societyDoc = await Society.findById(user.society);
    if (!societyDoc) {
      return res.status(404).json({ message: 'Society not found' });
    }
    societyDoc.residentRequests.push({
      name: user.name,
      phoneNumber: user.phoneNumber,
      email,
      address: user.address,
      houseNumber: user.houseNumber,
      status: 'Pending',
      createdAt: new Date(),
    });
    await societyDoc.save();
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );
    // Redirect to frontend with query params
    const redirectUrl = `exp://localhost:8081/VerificationSuccessScreen?message=${encodeURIComponent('Email verified successfully. Your registration is pending manager approval.')}&email=${encodeURIComponent(email)}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Failed to verify email', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  const { email, houseNumber, society, manager } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }
    const resident = new Resident({
      user: user._id,
      email,
      houseNumber,
      society,
      manager,
      status: 'Pending',
    });
    await resident.save();
    const societyDoc = await Society.findById(society);
    if (!societyDoc) return res.status(404).json({ message: 'Society not found' });
    societyDoc.residentRequests.push({
      name: user.name,
      phoneNumber: user.phoneNumber,
      email,
      address: user.address,
      houseNumber,
      status: 'Pending',
      createdAt: new Date(),
    });
    await societyDoc.save();
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );
    res.json({
      message: 'Signup request submitted. Waiting for manager approval.',
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        society: user.society,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No user found with this email.' });
    }
    if (!user.isEmailVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password.' });
    }
    const resident = await Resident.findOne({ user: user._id });
    if (!resident) {
      return res.status(400).json({ message: 'Resident profile not found' });
    }
    if (resident.status !== 'Approved') {
      return res.status(403).json({ message: 'Waiting for approval' });
    }
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '30d' }
    );
    res.json({
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        society: user.society,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, email, phoneNumber, address } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email already exists' });
      user.email = email;
      user.isEmailVerified = false;
    }
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        society: user.society,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});

module.exports = router;