import { app } from './app.js';
import { config } from './config/env.js';
import { logger } from './config/logger.js';

const PORT = config.PORT || 5000;

// ---------------- START SERVER ----------------
const server = app.listen(PORT, () => {
  console.log("🚀 server.js loaded");
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📚 Environment: ${config.NODE_ENV}`);
  logger.info(`📊 Health: http://localhost:${PORT}/health`);
});

// ---------------- ERROR HANDLING ----------------
server.on('error', (err) => {
  console.error("❌ Server failed to start:", err.message);
});

// ---------------- GRACEFUL SHUTDOWN ----------------
const shutdown = (signal) => {
  logger.info(`${signal} received → shutting down`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
