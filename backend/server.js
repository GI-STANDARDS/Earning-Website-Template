const app = require('./app');
const { connectDB } = require('./config/db');
const { PORT } = require('./config/serverConfig');

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API ready for requests`);
});
