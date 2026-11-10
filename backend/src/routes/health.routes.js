const express = require('express');
const { getDBStatus } = require('../config/db');
const { getRedisStatus } = require('../config/redis');
const config = require('../config/env');

const router = express.Router();

const handleHealthCheck = (req, res) => {
  const dbStatus = getDBStatus();
  const redisStatus = getRedisStatus();

  res.status(200).json({
    status: 'healthy',
    service: 'healthmate-ai-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.env,
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    infrastructure: {
      mongoDatabase: dbStatus,
      redisCache: redisStatus,
      ephemeralDefault: true,
      allowedRoles: ['PATIENT', 'DOCTOR', 'ADMINISTRATION']
    },
    llmGatewayConfig: {
      primaryProvider: config.llm.primaryProvider,
      fallbackProvider: config.llm.fallbackProvider,
      primaryModel: config.llm.openRouterModel,
      fallbackModel: config.llm.geminiModel,
      timeoutSeconds: config.llm.timeoutSeconds
    }
  });
};

router.get('/', handleHealthCheck);
router.get('/health', handleHealthCheck);

module.exports = router;
