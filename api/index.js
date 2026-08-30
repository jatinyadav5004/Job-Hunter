const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const connectDB = require('../server/src/config/db');
const app = require('../server/src/app');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless DB Error]:', err.message);
    }
  }
  return app(req, res);
};
