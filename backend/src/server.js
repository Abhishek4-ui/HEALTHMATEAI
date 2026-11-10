const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config/env');
const { connectDB } = require('./config/db');
const { initRedis } = require('./config/redis');
const { apiLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require('./routes/health.routes');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO for real-time signaling & consultations
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware pipeline
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use('/api', apiLimiter);

// Health check endpoint (Available at /health and /api/v1/health)
app.use('/health', healthRoutes);
app.use('/api/v1', healthRoutes);

// Base route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to HealthMate AI Core Backend API Gateway',
    version: '1.0.0',
    documentation: '/api/v1/health',
    roles: ['PATIENT', 'DOCTOR', 'ADMINISTRATION']
  });
});

// Real-time signaling socket connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] New real-time signaling connection: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`[Socket.IO] Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Socket ${socket.id} disconnected`);
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    // Initialize Database and Cache
    await connectDB();
    initRedis();

    server.listen(config.port, () => {
      console.log(`==================================================`);
      console.log(`🚀 HealthMate AI Backend listening on port ${config.port}`);
      console.log(`🌐 Environment: ${config.env}`);
      console.log(`🔒 Allowed Roles: PATIENT, DOCTOR, ADMINISTRATION`);
      console.log(`🛡️  Zero-Trust Ephemeral Patient Privacy: Active (Redis TTL)`);
      console.log(`📡 Health Check: http://localhost:${config.port}/health`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Fatal error starting HealthMate AI backend server:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
