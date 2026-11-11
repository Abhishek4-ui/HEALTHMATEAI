const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const { initRedis } = require('./config/redis');
const { initIndexes } = require('./models');
const { initSocketIO } = require('./sockets/socketHandler');
const authService = require('./services/auth.service');
const syncService = require('./services/sync.service');
const logger = require('./utils/logger');

const server = http.createServer(app);

// Setup Socket.IO for real-time signaling & consultation events
const io = new Server(server, {
  cors: {
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach socket event handlers
initSocketIO(io);

// Start server function
const startServer = async () => {
  try {
    // 1. Initialize Database
    await connectDB();
    await initIndexes();

    // 2. Initialize Redis Cache
    initRedis();

    // 3. Idempotently ensure initial Administrator exists
    await authService.provisionInitialAdmin();

    // 4. Initialize Phase 7 Scheduled Healthcare Synchronization Worker
    syncService.startScheduledWorker();

    // 5. Start HTTP & WebSocket listener
    server.listen(config.port, () => {
      console.log(`==================================================`);
      console.log(`🚀 HealthMate AI Backend listening on port ${config.port}`);
      console.log(`🌐 Environment: ${config.env}`);
      console.log(`🔒 Allowed Roles: PATIENT, DOCTOR, ADMINISTRATION`);
      console.log(`🛡️  Zero-Trust Ephemeral Patient Privacy: Active (Redis TTL)`);
      console.log(`📡 Health Check: http://localhost:${config.port}/health`);
      console.log(`📚 Swagger Docs: http://localhost:${config.port}/api-docs`);
      console.log(`==================================================`);
    });
  } catch (err) {
    logger.error('Fatal error starting HealthMate AI backend server:', { error: err.message });
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  syncService.stopScheduledWorker();
  server.close(() => {
    console.log('[Server] HTTP and Socket.IO servers closed.');
    process.exit(0);
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer, io };
