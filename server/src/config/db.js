const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[MongoDB Error]: MONGODB_URI environment variable is missing!');
    throw new Error('MONGODB_URI environment variable is missing. Please set MONGODB_URI in your Vercel project settings.');
  }

  try {
    const maskedUri = uri.replace(/\/\/.*@/, '//***:***@');
    console.log(`[MongoDB] Connecting to ${maskedUri}...`);

    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
      bufferCommands: false,
    });

    cachedConnection = conn;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    cachedConnection = null;
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
