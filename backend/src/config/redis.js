const Redis = require('ioredis');
const config = require('./env');

let redisClient = null;
let isRedisAvailable = false;

const initRedis = () => {
  try {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Max connection retries reached. Operating in disconnected fallback mode.');
          return null; // Stop retrying
        }
        return Math.min(times * 1000, 3000);
      }
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      console.log('[Redis] Connected successfully for ephemeral storage and TTL management.');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      console.warn(`[Redis] Connection warning: ${err.message}`);
    });

    redisClient.on('close', () => {
      isRedisAvailable = false;
    });

    // Attempt lazy connect
    redisClient.connect().catch((err) => {
      console.warn(`[Redis] Initial connection attempt skipped: ${err.message}`);
    });
  } catch (error) {
    console.warn(`[Redis] Initialization warning: ${error.message}`);
  }

  return redisClient;
};

const getRedisStatus = () => {
  if (!redisClient) return 'not_initialized';
  return isRedisAvailable ? 'connected' : redisClient.status;
};

const getRedisClient = () => {
  if (!redisClient) {
    initRedis();
  }
  return redisClient;
};

module.exports = { initRedis, getRedisClient, getRedisStatus };
