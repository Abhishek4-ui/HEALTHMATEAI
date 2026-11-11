const { verifyAccessToken } = require('../security/jwt');
const { Appointment, DoctorProfile } = require('../models');
const logger = require('../utils/logger');

const initSocketIO = (io) => {
  // 1. Handshake Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    const sessionId = socket.handshake.auth?.sessionId || socket.handshake.headers?.['x-session-id'];

    if (token) {
      const user = verifyAccessToken(token);
      if (user) {
        socket.user = user;
        return next();
      }
    }

    // Allow guest sessions for anonymous triage signaling
    if (sessionId) {
      socket.sessionId = sessionId;
      socket.user = { id: sessionId, role: 'GUEST' };
      return next();
    }

    return next(new Error('Authentication token or session ID required for real-time connection.'));
  });

  // 2. Connection and Room Management
  io.on('connection', (socket) => {
    logger.info(`[Socket.IO] Authenticated client connected: ${socket.id}`, {
      userId: socket.user?.id,
      role: socket.user?.role,
    });

    // Join personal user notification room
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    // Join WebRTC Consultation Room with Authorization Verification
    socket.on('join-consultation-room', async ({ appointmentId }) => {
      try {
        if (!appointmentId) return;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
          socket.emit('error', { message: 'Appointment not found.' });
          return;
        }

        // Authorization check: User must be assigned patient or doctor (or admin)
        const isPatient = appointment.patientId.toString() === socket.user.id;
        let isDoctor = false;

        if (socket.user.role === 'DOCTOR') {
          const doc = await DoctorProfile.findOne({ userId: socket.user.id });
          isDoctor = doc && appointment.doctorId.toString() === doc._id.toString();
        }

        const isAdmin = socket.user.role === 'ADMINISTRATION';

        if (!isPatient && !isDoctor && !isAdmin) {
          socket.emit('error', { message: 'Unauthorized room membership.' });
          return;
        }

        const roomKey = `consultation:${appointmentId}`;
        socket.join(roomKey);
        logger.info(`[Socket.IO] ${socket.user.role} (${socket.user.id}) joined room ${roomKey}`);

        // Broadcast to other peer that user has joined
        socket.to(roomKey).emit('peer-joined', {
          userId: socket.user.id,
          role: socket.user.role,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // P2P WebRTC Signaling Relay
    socket.on('signal', ({ appointmentId, signalData }) => {
      if (!appointmentId || !signalData) return;
      const roomKey = `consultation:${appointmentId}`;
      socket.to(roomKey).emit('signal', {
        senderId: socket.user.id,
        signalData,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocketIO };
