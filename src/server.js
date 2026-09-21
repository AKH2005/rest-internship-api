require('dotenv').config();
const app = require('./app');
const { getDatabase, closeDatabase, getDatabasePath } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Initialize database connection & schema before listening
try {
  getDatabase();
  console.log(`[Database] SQLite connected at: ${getDatabasePath()}`);
} catch (error) {
  console.error('[Database] Initialization error:', error);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`[Server] REST Internship API is running on http://localhost:${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/health`);
  console.log(`[Server] API base URL: http://localhost:${PORT}/api/v1/internships`);
});

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Closing gracefully...`);
  server.close(() => {
    closeDatabase();
    console.log('[Server] HTTP server and SQLite database connection closed.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = server;
