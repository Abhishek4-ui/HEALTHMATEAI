/**
 * Sanitize user input to prevent NoSQL injection attacks (e.g. $gt, $where, etc.)
 */
const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const clean = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Remove keys starting with $ or containing a period to prevent operator injection
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      clean[key] = cleanObject(obj[key]);
    }
  }
  return clean;
};

const sanitizeInputMiddleware = (req, res, next) => {
  if (req.body) req.body = cleanObject(req.body);
  if (req.query) req.query = cleanObject(req.query);
  if (req.params) req.params = cleanObject(req.params);
  next();
};

module.exports = { cleanObject, sanitizeInputMiddleware };
