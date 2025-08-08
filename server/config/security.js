const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Security configuration
const securityConfig = {
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    issuer: process.env.JWT_ISSUER || 'elearning-platform',
    audience: process.env.JWT_AUDIENCE || 'elearning-users'
  },

  // Password configuration
  password: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbiddenPasswords: [
      'password',
      '12345678',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      'dragon'
    ]
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    }
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
  },

  // Authentication rate limiting
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts, please try again later.'
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
  },

  // Encryption configuration
  encryption: {
    algorithm: 'aes-256-cbc',
    key: process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
    ivLength: 16
  },

  // File upload configuration
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      videos: ['video/mp4', 'video/webm', 'video/ogg'],
      audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    maxFiles: 5
  },

  // Security headers configuration
  securityHeaders: {
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
  },

  // Data retention configuration
  dataRetention: {
    // Data retention periods in days
    userActivity: 365, // 1 year
    analytics: 730, // 2 years
    logs: 90, // 90 days
    deletedData: 30, // 30 days
    inactiveAccounts: 365 // 1 year
  },

  // GDPR compliance configuration
  gdpr: {
    dataController: {
      name: 'eLearning Platform',
      email: 'privacy@elearning.com',
      address: '123 Privacy Street, Secure City, Country'
    },
    dataProtectionOfficer: {
      name: 'DPO Name',
      email: 'dpo@elearning.com'
    },
    cookieConsent: {
      necessary: true,
      analytics: false,
      marketing: false
    },
    consentTypes: [
      'personal_data_processing',
      'analytics',
      'marketing',
      'cookies'
    ]
  },

  // Security audit configuration
  audit: {
    logLevel: 'info',
    logSensitiveData: false,
    logFormat: 'combined',
    maxLogFiles: 10,
    maxLogSize: '10m',
    auditLogRetention: 90 // days
  },

  // Password reset configuration
  passwordReset: {
    tokenExpiry: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    lockoutPeriod: 15 * 60 * 1000 // 15 minutes
  },

  // Two-factor authentication configuration
  twoFactorAuth: {
    issuer: 'eLearning Platform',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    window: 2,
    backupCodeCount: 10
  },

  // Email verification configuration
  emailVerification: {
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    maxAttempts: 3,
    lockoutPeriod: 15 * 60 * 1000 // 15 minutes
  },

  // Account lockout configuration
  accountLockout: {
    maxAttempts: 5,
    lockoutPeriod: 15 * 60 * 1000, // 15 minutes
    progressiveLockout: true
  }
};

// Helper functions
const securityHelpers = {
  // Generate a random token
  generateToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Hash a password
  hashPassword: async (password) => {
    try {
      const salt = await bcrypt.genSalt(securityConfig.password.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  },

  // Compare a password with a hash
  comparePassword: async (password, hash) => {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Error comparing password:', error);
      throw error;
    }
  },

  // Generate a JWT token
  generateJWT: (payload) => {
    try {
      return jwt.sign(payload, securityConfig.jwt.secret, {
        expiresIn: securityConfig.jwt.expiresIn,
        issuer: securityConfig.jwt.issuer,
        audience: securityConfig.jwt.audience
      });
    } catch (error) {
      console.error('Error generating JWT:', error);
      throw error;
    }
  },

  // Verify a JWT token
  verifyJWT: (token) => {
    try {
      return jwt.verify(token, securityConfig.jwt.secret, {
        issuer: securityConfig.jwt.issuer,
        audience: securityConfig.jwt.audience
      });
    } catch (error) {
      console.error('Error verifying JWT:', error);
      throw error;
    }
  },

  // Generate a refresh token
  generateRefreshToken: (payload) => {
    try {
      return jwt.sign(payload, securityConfig.jwt.secret, {
        expiresIn: securityConfig.jwt.refreshExpiresIn,
        issuer: securityConfig.jwt.issuer,
        audience: securityConfig.jwt.audience
      });
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw error;
    }
  },

  // Encrypt data
  encryptData: (data) => {
    try {
      const iv = crypto.randomBytes(securityConfig.encryption.ivLength);
      const cipher = crypto.createCipheriv(
        securityConfig.encryption.algorithm,
        Buffer.from(securityConfig.encryption.key, 'hex'),
        iv
      );
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  },

  // Decrypt data
  decryptData: (encryptedData) => {
    try {
      const textParts = encryptedData.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encrypted = textParts.join(':');
      const decipher = crypto.createDecipheriv(
        securityConfig.encryption.algorithm,
        Buffer.from(securityConfig.encryption.key, 'hex'),
        iv
      );
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  },

  // Validate password strength
  validatePasswordStrength: (password) => {
    const errors = [];
    
    if (password.length < securityConfig.password.minLength) {
      errors.push(`Password must be at least ${securityConfig.password.minLength} characters long`);
    }
    
    if (password.length > securityConfig.password.maxLength) {
      errors.push(`Password must be no more than ${securityConfig.password.maxLength} characters long`);
    }
    
    if (securityConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (securityConfig.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (securityConfig.password.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (securityConfig.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (securityConfig.password.forbiddenPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and not allowed');
    }
    
    return errors;
  },

  // Sanitize input to prevent XSS
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  },

  // Generate a secure random string
  generateSecureRandom: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  }
};

module.exports = {
  securityConfig,
  securityHelpers
};