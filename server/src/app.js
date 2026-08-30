const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const savedSearchRoutes = require('./routes/savedSearchRoutes');
const jobRoutes = require('./routes/jobRoutes');
const coldEmailRoutes = require('./routes/coldEmailRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const emailAccountRoutes = require('./routes/emailAccountRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const digestRoutes = require('./routes/digestRoutes');

const app = express();

// Middlewares - Support all production & local origins dynamically
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static folder for uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'JobHunter AI Core API',
    nodeEnv: process.env.NODE_ENV || 'development',
    hasMongoUri: !!process.env.MONGODB_URI,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/cold-email', coldEmailRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/email', emailAccountRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/digest', digestRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
