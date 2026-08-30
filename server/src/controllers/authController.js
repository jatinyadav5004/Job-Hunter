const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateToken = (email) => {
  return jwt.sign({ id: email, email }, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Check DB connection state (1 = connected)
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection offline. Please ensure your MongoDB service is running (or set MONGODB_URI in server/.env).',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Primary key lookup by _id (email)
    const userExists = await User.findById(cleanEmail);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      _id: cleanEmail, // Email is the primary key
      email: cleanEmail,
      name: name.trim(),
      password,
    });

    const token = generateToken(user._id);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyEmailLimit: user.dailyEmailLimit,
        autoSendEnabled: user.autoSendEnabled,
      },
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection offline. Please ensure your MongoDB service is running (or set MONGODB_URI in server/.env).',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findById(cleanEmail).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyEmailLimit: user.dailyEmailLimit,
        autoSendEnabled: user.autoSendEnabled,
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
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
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      dailyEmailLimit: req.user.dailyEmailLimit,
      autoSendEnabled: req.user.autoSendEnabled,
      activeResumeId: req.user.activeResumeId,
    },
  });
};

// @route   PUT /api/auth/settings
exports.updateSettings = async (req, res) => {
  try {
    const { dailyEmailLimit, autoSendEnabled, name } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (dailyEmailLimit) user.dailyEmailLimit = Number(dailyEmailLimit);
    if (typeof autoSendEnabled === 'boolean') user.autoSendEnabled = autoSendEnabled;

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyEmailLimit: user.dailyEmailLimit,
        autoSendEnabled: user.autoSendEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
