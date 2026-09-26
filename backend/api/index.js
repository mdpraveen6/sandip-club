// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json),
// which hands it to the same Express app used locally.
try {
  require('dotenv').config();
} catch {
  /* .env absent on Vercel — platform env vars apply instead */
}

const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDb } = require('../src/config/db');

module.exports = async (req, res) => {
  // Reuse the Mongo connection across warm invocations.
  if (mongoose.connection.readyState !== 1) {
    await connectDb();
  }
  return app(req, res);
};
