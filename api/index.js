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
  // 1. Direct Diagnostic Health Check (Fast response without waiting for DB)
  if (req.url && (req.url === '/api/health' || req.url === '/health' || req.url.includes('health'))) {
    return res.status(200).json({
      status: 'online',
      service: 'JobHunter AI Vercel API',
      timestamp: new Date().toISOString(),
      diagnostics: {
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriPrefix: process.env.MONGODB_URI
          ? process.env.MONGODB_URI.substring(0, 14) + '...'
          : 'MISSING (Add MONGODB_URI in Vercel Settings -> Environment Variables)',
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasOpenAiKey: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV || 'production',
      },
    });
  }

  // 2. Check for missing MONGODB_URI before connecting
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({
      success: false,
      error: 'MONGODB_URI_MISSING',
      message:
        'MONGODB_URI environment variable is not configured in Vercel. Please open Vercel Dashboard -> Settings -> Environment Variables, and add your MongoDB Atlas connection string as MONGODB_URI.',
    });
  }

  // 3. Connect to MongoDB with fast timeout
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless DB Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'MONGODB_CONNECTION_FAILED',
      message: `Database connection failed: ${err.message}. Please ensure MongoDB Atlas Network Access is set to '0.0.0.0/0' (Allow Access From Anywhere).`,
    });
  }

  return app(req, res);
};
