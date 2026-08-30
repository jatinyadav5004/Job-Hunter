const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobhunter-ai';

  try {
    console.log(`[MongoDB] Connecting to ${uri.replace(/\/\/.*@/, '//***:***@')}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ [MongoDB Connection Error]: ${error.message}`);
    console.error(`➡️ Please verify that your MongoDB service is running on 127.0.0.1:27017, or set MONGODB_URI in server/.env to your MongoDB Atlas cloud URI.\n`);
  }
};

module.exports = connectDB;
