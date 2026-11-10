const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5001', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',

  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthmate_ai',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: {
      guestSession: parseInt(process.env.REDIS_GUEST_TTL || '3600', 10), // 1 hour
      reportExtraction: parseInt(process.env.REDIS_REPORT_TTL || '1800', 10), // 30 mins
      geoCache: parseInt(process.env.REDIS_GEO_TTL || '7200', 10), // 2 hours
    }
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_do_not_use_in_prod_min64chars!',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_do_not_use_in_prod_min64chars!',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },

  internalSecret: process.env.INTERNAL_SERVICE_SECRET || 'dev_internal_hmac_secret_key_12345',

  llm: {
    primaryProvider: process.env.LLM_PRIMARY_PROVIDER || 'openrouter',
    fallbackProvider: process.env.LLM_FALLBACK_PROVIDER || 'gemini',
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openRouterModel: process.env.OPENROUTER_MODEL_NAME || 'anthropic/claude-3.5-sonnet',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash',
    timeoutSeconds: parseInt(process.env.LLM_TIMEOUT_SECONDS || '10', 10),
    maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '2', 10)
  }
};

module.exports = config;
