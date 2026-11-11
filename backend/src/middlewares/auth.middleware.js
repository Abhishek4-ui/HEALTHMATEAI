const { verifyAccessToken } = require('../security/jwt');
const { errorResponse } = require('../utils/response');

/**
 * Middleware: Verify Bearer access token in Authorization header
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return errorResponse(res, 'Authentication token required.', 401, 'UNAUTHORIZED');
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return errorResponse(res, 'Invalid or expired access token.', 401, 'TOKEN_EXPIRED');
  }

  req.user = decoded;
  next();
};

/**
 * Optional authentication: If token present, decode user, otherwise continue as guest
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  // Check guest session header
  const sessionId = req.headers['x-session-id'];
  if (sessionId) {
    req.sessionId = sessionId;
  }

  next();
};

module.exports = { authenticateToken, optionalAuth };
