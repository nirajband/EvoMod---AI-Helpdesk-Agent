const express = require('express');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const { authenticate, authRateLimit } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authRateLimit, asyncHandler(async (req, res) => {
  const { name, email, password, role, skills } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Please provide name, email, and password'
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: 'Please provide a valid email address'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long'
    });
  }

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({
      message: 'Name must be between 2 and 100 characters'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      message: 'User with this email already exists'
    });
  }

  // Validate role
  const validRoles = ['user', 'moderator', 'admin'];
  const userRole = role && validRoles.includes(role) ? role : 'user';

  // Process skills for moderators
  const userSkills = userRole === 'moderator' && skills 
    ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(s => s))
    : [];

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role: userRole,
    skills: userSkills
  });

  // Update last login
  await user.updateLastLogin();

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      createdAt: user.createdAt
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authRateLimit, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      message: 'Please provide email and password'
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: 'Please provide a valid email address'
    });
  }

  // Check if user exists and get password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      message: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      message: 'Account has been deactivated. Please contact support.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      message: 'Invalid credentials'
    });
  }

  // Update last login
  await user.updateLastLogin();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      lastLogin: user.lastLogin
    }
  });
}));

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  const stats = user.getStats();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      stats
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', authenticate, asyncHandler(async (req, res) => {
  const { name, skills } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  // Update fields
  if (name && name.trim()) {
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        message: 'Name must be between 2 and 100 characters'
      });
    }
    user.name = name.trim();
  }

  // Update skills for moderators
  if (user.role === 'moderator' && skills !== undefined) {
    user.skills = Array.isArray(skills) 
      ? skills.filter(skill => skill && skill.trim())
      : (skills ? skills.split(',').map(s => s.trim()).filter(s => s) : []);
  }

  await user.save();

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      updatedAt: user.updatedAt
    }
  });
}));

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', authenticate, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: 'Please provide current and new password'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: 'New password must be at least 6 characters long'
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');
  
  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    message: 'Password changed successfully'
  });
}));

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', authenticate, asyncHandler(async (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      skills: req.user.skills
    }
  });
}));

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can log the logout event or perform cleanup if needed
  
  res.json({
    message: 'Logged out successfully'
  });
}));

// @desc    Get all moderators (for admin use)
// @route   GET /api/auth/moderators
// @access  Private (Admin only)
router.get('/moderators', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin role required.'
    });
  }

  const moderators = await User.find({ 
    role: { $in: ['moderator', 'admin'] },
    isActive: true 
  }).select('-password').sort({ name: 1 });

  res.json({
    moderators
  });
}));

// @desc    Request password reset (placeholder)
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', authRateLimit, asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      message: 'Please provide a valid email address'
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // TODO: Implement password reset functionality
  // For now, just return success message
  res.json({
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
}));

module.exports = router;