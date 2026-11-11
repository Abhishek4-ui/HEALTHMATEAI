const { redactSensitiveData } = require('../security/redact');

const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const safeMeta = redactSensitiveData(meta);
  const metaStr = Object.keys(safeMeta).length > 0 ? ` ${JSON.stringify(safeMeta)}` : '';
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
};

const logger = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      log('debug', msg, meta);
    }
  },
};

module.exports = logger;
