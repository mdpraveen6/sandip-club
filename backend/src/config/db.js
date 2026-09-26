const mongoose = require('mongoose');

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI not set — server runs, but data routes return 503 until you add it to backend/.env');
    return null;
  }
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('[db] MongoDB connected');
    return mongoose.connection;
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    return null;
  }
}

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

// Guards every data route: clear 503 instead of hanging when Mongo is missing.
function requireDb(req, res, next) {
  if (!isDbReady()) {
    return res.status(503).json({ error: 'Database not connected. Add MONGODB_URI to backend/.env and restart.' });
  }
  next();
}

module.exports = { connectDb, isDbReady, requireDb };
