const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('./config/db');
const app = require('./app');
const { initScheduler } = require('./jobs/scheduler');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start Node-Cron Daily Job Runner
initScheduler();

// Start Server
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 JobHunter AI Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'gemini'}`);
  console.log(`=========================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[UnhandledRejection] ${err.message}`);
});
