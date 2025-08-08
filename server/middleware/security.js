const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

// Security middleware configuration
const securityMiddleware = (app) => {
  // Use helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
        fontSrc: ["'self'", "data:", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "data:", "https:"],
        frameSrc: ["'self'"],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  }));

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts, please try again later.',
    skip: (req) => {
      // Skip rate limiting for authenticated users
      return req.user && req.user.id;
    }
  });

  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);
  app.use('/api/auth/', authLimiter);

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp({
    whitelist: [
      'sort',
      'page',
      'limit',
      'fields',
      'search',
      'category',
      'tags',
      'status'
    ]
  }));

  // CORS configuration
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
  };

  app.use(cors(corsOptions));

  // Request validation middleware
  const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };

  // Validation rules for user registration
  const userRegistrationValidation = [
    body('firstName')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters and spaces'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    
    body('password')
      .trim()
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('role')
      .optional()
      .isIn(['learner', 'creator']).withMessage('Role must be either learner or creator')
  ];

  // Validation rules for user login
  const userLoginValidation = [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    
    body('password')
      .trim()
      .notEmpty().withMessage('Password is required')
  ];

  // Validation rules for tenant creation
  const tenantCreationValidation = [
    body('name')
      .trim()
      .notEmpty().withMessage('Tenant name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Tenant name must be between 2 and 100 characters'),
    
    body('slug')
      .trim()
      .notEmpty().withMessage('Slug is required')
      .isLength({ min: 2, max: 50 }).withMessage('Slug must be between 2 and 50 characters')
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
      .custom((value) => {
        // Check if slug is a reserved word
        const reservedWords = ['admin', 'login', 'register', 'dashboard', 'api', 'settings'];
        if (reservedWords.includes(value)) {
          throw new Error('This slug is reserved and cannot be used');
        }
        return true;
      }),
    
    body('settings.theme')
      .optional()
      .isIn(['default', 'dark', 'light', 'corporate', 'education']).withMessage('Invalid theme option'),
    
    body('subscription.plan')
      .optional()
      .isIn(['free', 'basic', 'premium', 'enterprise']).withMessage('Invalid subscription plan')
  ];

  // Return middleware functions
  return {
    userRegistrationValidation,
    userLoginValidation,
    tenantCreationValidation,
    validateRequest
  };
};

module.exports = securityMiddleware;