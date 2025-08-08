const prometheus = require('prom-client');
const responseTime = require('response-time');
const { logger } = require('./logging');

// Create a Registry to register the metrics
const register = new prometheus.Registry();

// Enable the collection of default metrics
prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code', 'tenant_id'],
  buckets: [0.1, 5, 15, 50, 100, 500, 1000]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'tenant_id']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const databaseQueryDuration = new prometheus.Histogram({
  name: 'database_query_duration_ms',
  help: 'Duration of database queries in ms',
  labelNames: ['operation', 'collection', 'tenant_id'],
  buckets: [0.1, 5, 15, 50, 100, 500]
});

const authenticationAttempts = new prometheus.Counter({
  name: 'authentication_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['type', 'result', 'tenant_id']
});

const userRegistrations = new prometheus.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['role', 'tenant_id']
});

const contentCreations = new prometheus.Counter({
  name: 'content_creations_total',
  help: 'Total number of content creations',
  labelNames: ['type', 'tenant_id']
});

const contentViews = new prometheus.Counter({
  name: 'content_views_total',
  help: 'Total number of content views',
  labelNames: ['type', 'tenant_id']
});

const quizAttempts = new prometheus.Counter({
  name: 'quiz_attempts_total',
  help: 'Total number of quiz attempts',
  labelNames: ['result', 'tenant_id']
});

const activeUsers = new prometheus.Gauge({
  name: 'active_users',
  help: 'Number of active users',
  labelNames: ['tenant_id']
});

const systemMemoryUsage = new prometheus.Gauge({
  name: 'system_memory_usage_bytes',
  help: 'System memory usage in bytes'
});

const systemCpuUsage = new prometheus.Gauge({
  name: 'system_cpu_usage_percent',
  help: 'System CPU usage percentage'
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseQueryDuration);
register.registerMetric(authenticationAttempts);
register.registerMetric(userRegistrations);
register.registerMetric(contentCreations);
register.registerMetric(contentViews);
register.registerMetric(quizAttempts);
register.registerMetric(activeUsers);
register.registerMetric(systemMemoryUsage);
register.registerMetric(systemCpuUsage);

// Middleware to collect HTTP request metrics
const httpRequestMetrics = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : 'unknown';
    const statusCode = res.statusCode;
    const tenantId = req.tenant ? req.tenant.id : 'unknown';
    
    // Record metrics
    httpRequestDurationMicroseconds
      .labels(req.method, route, statusCode, tenantId)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, statusCode, tenantId)
      .inc();
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        statusCode,
        tenantId
      });
    }
  });
  
  next();
};

// Middleware to track active connections
const connectionMetrics = (req, res, next) => {
  activeConnections.inc();
  
  res.on('finish', () => {
    activeConnections.dec();
  });
  
  next();
};

// Function to record database query metrics
const recordDatabaseQuery = (operation, collection, tenantId, duration) => {
  databaseQueryDuration
    .labels(operation, collection, tenantId || 'unknown')
    .observe(duration);
  
  // Log slow queries
  if (duration > 100) {
    logger.warn('Slow database query detected', {
      operation,
      collection,
      duration: `${duration}ms`,
      tenantId
    });
  }
};

// Function to record authentication attempts
const recordAuthenticationAttempt = (type, result, tenantId) => {
  authenticationAttempts
    .labels(type, result, tenantId || 'unknown')
    .inc();
  
  // Log failed authentication attempts
  if (result === 'failed') {
    securityLog('Authentication failed', {
      type,
      tenantId
    });
  }
};

// Function to record user registrations
const recordUserRegistration = (role, tenantId) => {
  userRegistrations
    .labels(role, tenantId || 'unknown')
    .inc();
  
  businessLog('User registered', {
    role,
    tenantId
  });
};

// Function to record content creations
const recordContentCreation = (type, tenantId) => {
  contentCreations
    .labels(type, tenantId || 'unknown')
    .inc();
  
  businessLog('Content created', {
    type,
    tenantId
  });
};

// Function to record content views
const recordContentView = (type, tenantId) => {
  contentViews
    .labels(type, tenantId || 'unknown')
    .inc();
};

// Function to record quiz attempts
const recordQuizAttempt = (result, tenantId) => {
  quizAttempts
    .labels(result, tenantId || 'unknown')
    .inc();
};

// Function to update active users count
const updateActiveUsers = (count, tenantId) => {
  activeUsers
    .labels(tenantId || 'unknown')
    .set(count);
};

// Function to update system metrics
const updateSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  systemMemoryUsage.set(memUsage.heapUsed);
  
  // Get CPU usage (simplified approach)
  const cpuUsage = process.cpuUsage();
  systemCpuUsage.set(cpuUsage.user / 1000000); // Convert to percentage
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error generating metrics', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).end('Error generating metrics');
  }
};

// Health check endpoint
const healthCheck = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      environment: process.env.NODE_ENV
    };
    
    res.status(200).json(health);
  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Ready check endpoint (for Kubernetes)
const readyCheck = async (req, res) => {
  try {
    // Check database connection
    // This would typically involve a simple database query
    const dbReady = true; // Replace with actual check
    
    // Check external services
    const servicesReady = true; // Replace with actual checks
    
    if (dbReady && servicesReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbReady ? 'ready' : 'not ready',
          services: servicesReady ? 'ready' : 'not ready'
        }
      });
    }
  } catch (error) {
    logger.error('Ready check failed', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Live check endpoint (for Kubernetes)
const liveCheck = async (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
};

// Initialize metrics collection
const initializeMetrics = () => {
  // Update system metrics every 15 seconds
  setInterval(updateSystemMetrics, 15000);
  
  logger.info('Monitoring initialized');
};

module.exports = {
  httpRequestMetrics,
  connectionMetrics,
  recordDatabaseQuery,
  recordAuthenticationAttempt,
  recordUserRegistration,
  recordContentCreation,
  recordContentView,
  recordQuizAttempt,
  updateActiveUsers,
  metricsEndpoint,
  healthCheck,
  readyCheck,
  liveCheck,
  initializeMetrics
};