const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/env');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { sanitizeInputMiddleware } = require('./security/sanitize');
const errorHandler = require('./middlewares/errorHandler');
const v1Router = require('./routes');
const healthRoutes = require('./routes/health.routes');
const swaggerSpec = require('./docs/swagger.json');

const app = express();

// 1. Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Permit Swagger UI rendering in dev
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// 2. Strict CORS Configuration
const allowedOrigins = [
  config.clientUrl,
  'https://healthmate-ai-nine-mocha.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID', 'X-User-Role'],
}));

// 3. Body Parsing with strict limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Input Sanitization (NoSQL injection prevention)
app.use(sanitizeInputMiddleware);

// 5. HTTP Request Logging (excluding health check spam)
app.use(morgan(config.env === 'production' ? 'combined' : 'dev', {
  skip: (req) => req.url === '/health' || req.url === '/api/v1/health',
}));

// 6. Rate Limiting for all API routes
app.use('/api', apiLimiter);

// 7. OpenAPI / Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 8. Health Routes
app.use('/health', healthRoutes);

// 9. Versioned REST API Router (/api/v1)
app.use('/api/v1', v1Router);

// 10. Root Welcome & Directory Route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'HealthMate AI Core Backend API Gateway',
    version: '1.0.0',
    documentation: '/api-docs',
    healthCheck: '/health',
    allowedRoles: ['PATIENT', 'DOCTOR', 'ADMINISTRATION'],
    privacyPolicy: 'Zero-Trust Ephemeral Memory Storage (Redis TTL)',
  });
});

// 11. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// 12. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
