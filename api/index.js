const path = require('path');
// Load local env if running locally
try {
  require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
} catch (e) {
  // Ignore in production
}

const connectDB = require('../server/src/config/db');
const app = require('../server/src/app');

module.exports = async (req, res) => {
  // Ensure DB connection before processing request
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless DB Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: `Database connection failed on server: ${err.message}. Please verify MONGODB_URI on Vercel and check MongoDB Atlas Network Access is set to '0.0.0.0/0' (Allow access from anywhere).`,
    });
  }

  return app(req, res);
};
