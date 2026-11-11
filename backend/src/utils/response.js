/**
 * Standardized API Response Utilities
 */

const successResponse = (res, data = null, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const errorResponse = (res, message = 'Internal server error', statusCode = 500, errorCode = 'SERVER_ERROR', details = null) => {
  const payload = {
    success: false,
    error: errorCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (details && process.env.NODE_ENV !== 'production') {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = { successResponse, errorResponse };
