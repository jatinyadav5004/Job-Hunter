const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Please add MONGODB_URI in Vercel Settings -> Environment Variables.'
    );
  }

  try {
    const maskedUri = uri.replace(/\/\/.*@/, '//***:***@');
    console.log(`[MongoDB] Connecting to ${maskedUri}...`);

    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
      bufferCommands: false,
    });

    cachedConnection = conn;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    cachedConnection = null;
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
