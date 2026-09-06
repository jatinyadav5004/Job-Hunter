const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const generateToken = (email) => {
  return jwt.sign(
    { id: email, email },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// Ensure database connection helper
async function ensureDbConnected() {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
}

function sanitizeUser(user) {
  const isAdmin = user.role === 'admin';
  const effectivePlan = isAdmin ? 'pro' : user.plan || 'basic';

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    isAdmin,
    plan: effectivePlan,
    status: user.status || (user.isDeleted ? 'deleted' : user.isSuspended ? 'suspended' : 'active'),
    isSuspended: Boolean(user.isSuspended),
    isDeleted: Boolean(user.isDeleted),
    dailyEmailLimit: effectivePlan === 'pro' ? 50 : (user.dailyEmailLimit || 5),
    autoSendEnabled: Boolean(user.autoSendEnabled),
    activeResumeId: user.activeResumeId,
  };
}

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password)',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Ensure DB connection
    await ensureDbConnected();

    const cleanEmail = email.toLowerCase().trim();

    // Primary key lookup by _id (email)
    const userExists = await User.findById(cleanEmail);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Default every new registration strictly to 'basic' and role 'user'
    const user = await User.create({
      _id: cleanEmail,
      email: cleanEmail,
      name: name.trim(),
      password,
      role: 'user',
      plan: 'basic',
      status: 'active',
      dailyEmailLimit: 5,
    });

    const token = generateToken(user._id);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed on server',
    });
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Ensure DB connection
    await ensureDbConnected();

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findById(cleanEmail).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check account status
    if (user.isDeleted || user.status === 'deleted') {
      return res.status(403).json({
        success: false,
        accountDeleted: true,
        message: 'This account has been deleted by an administrator.',
      });
    }

    if (user.isSuspended || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        accountSuspended: true,
        message: 'Your account has been suspended by an administrator. Please contact support.',
      });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed on server',
    });
  }
};

// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: sanitizeUser(req.user),
  });
};

// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, dailyEmailLimit, autoSendEnabled } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (dailyEmailLimit !== undefined && !isNaN(dailyEmailLimit)) {
      const isProOrAdmin = user.role === 'admin' || user.plan === 'pro';
      const maxAllowed = isProOrAdmin ? 100 : 5;
      user.dailyEmailLimit = Math.min(Math.max(1, Number(dailyEmailLimit)), maxAllowed);
    }
    if (autoSendEnabled !== undefined) user.autoSendEnabled = autoSendEnabled;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/request-upgrade
exports.requestUpgrade = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`[Admin Notice] User ${user.email} requested a PRO plan upgrade.`);

    res.json({
      success: true,
      message: 'Your upgrade request has been submitted to the administrator for review.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = exports.updateProfile;
