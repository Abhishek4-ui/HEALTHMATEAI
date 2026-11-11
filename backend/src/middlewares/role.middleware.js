const { errorResponse } = require('../utils/response');

/**
 * Enforce backend Role-Based Access Control (RBAC)
 * Strictly allows only permitted roles among PATIENT, DOCTOR, ADMINISTRATION
 * @param {string[]} allowedRoles 
 */
const requireRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before checking permissions.', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of [${allowedRoles.join(', ')}] role privileges.`,
        403,
        'FORBIDDEN_ROLE'
      );
    }

    next();
  };
};

module.exports = { requireRoles };
