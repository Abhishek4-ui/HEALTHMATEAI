const { errorResponse } = require('../utils/response');

/**
 * Middleware: Verify resource ownership (Prevent IDOR)
 * Checks if the authenticated user owns the resource or has ADMINISTRATION privileges
 * @param {Function} resourceLoader - Async function(req) => returns resource or null
 * @param {string} ownerField - Field on resource containing owner userId (default: 'patientId' or 'userId')
 */
const requireOwnership = (resourceLoader, ownerField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Authentication required.', 401, 'UNAUTHORIZED');
      }

      // Administrators have platform oversight privileges
      if (req.user.role === 'ADMINISTRATION') {
        return next();
      }

      const resource = await resourceLoader(req);
      if (!resource) {
        return errorResponse(res, 'Requested medical resource not found.', 404, 'NOT_FOUND');
      }

      const ownerId = resource[ownerField]?.toString() || resource.patientId?.toString();
      const currentUserId = req.user.id?.toString();

      // Check if user is either the patient owner or assigned doctor
      const isAssignedDoctor = resource.doctorId?.toString() === currentUserId;

      if (ownerId !== currentUserId && !isAssignedDoctor) {
        return errorResponse(res, 'Access denied. You do not own this medical record.', 403, 'FORBIDDEN_RESOURCE');
      }

      req.targetResource = resource;
      next();
    } catch (err) {
      return errorResponse(res, 'Ownership authorization check failed.', 500, 'SERVER_ERROR');
    }
  };
};

module.exports = { requireOwnership };
