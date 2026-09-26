require('dotenv').config();
const { connectDb } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Only listen when run directly (npm run dev). On Vercel, api/index.js
// imports the app instead — listening there would crash the function.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    connectDb();
  });
}