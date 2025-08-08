# eLearning Platform Developer Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Structure](#project-structure)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Database Schema](#database-schema)
8. [API Development](#api-development)
9. [Authentication and Authorization](#authentication-and-authorization)
10. [Multitenancy Implementation](#multitenancy-implementation)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Monitoring and Logging](#monitoring-and-logging)
14. [Security Best Practices](#security-best-practices)
15. [Contributing Guidelines](#contributing-guidelines)
16. [Troubleshooting](#troubleshooting)

## Introduction

This developer guide provides comprehensive information for developers working on the eLearning Platform. It covers the architecture, development environment setup, coding standards, and best practices for contributing to the project.

### Technology Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React, Redux, Material-UI
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest, Supertest, React Testing Library
- **CI/CD**: GitHub Actions
- **Monitoring**: Winston, Prometheus
- **Deployment**: Docker, Kubernetes

## Architecture Overview

The eLearning Platform follows a microservices-inspired architecture with a clear separation between frontend and backend services.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Monitoring    │    │   File Storage  │
│   (React Native)│    │   (Prometheus)  │    │   (AWS S3)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

The platform is organized into several key components:

1. **Authentication Service**: Handles user registration, login, and session management
2. **Tenant Service**: Manages multitenant architecture and organization settings
3. **Content Service**: Manages courses, presentations, quizzes, and tutorials
4. **User Service**: Handles user profiles and preferences
5. **Analytics Service**: Tracks user progress and generates reports
6. **Notification Service**: Manages email and in-app notifications

## Development Environment Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn (v1.22 or higher)
- MongoDB (v4.4 or higher)
- Git

### Setting Up the Project

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/elearning-platform.git
   cd elearning-platform
   ```

2. **Install dependencies**:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy the example environment file
   cp server/.env.example server/.env

   # Edit the environment file with your settings
   nano server/.env
   ```

4. **Start MongoDB**:
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**:
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # In a new terminal, start the frontend
   cd client
   npm start
   ```

### Environment Variables

The application requires the following environment variables:

#### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/elearning

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Security
BCRYPT_SALT_ROUNDS=12
ENCRYPTION_KEY=your_encryption_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

## Project Structure

The project follows a structured organization to maintain code clarity and separation of concerns.

### Backend Structure

```
server/
├── config/                 # Configuration files
│   ├── db.js               # Database connection
│   ├── security.js         # Security configuration
│   ├── logging.js          # Logging configuration
│   └── monitoring.js       # Monitoring configuration
├── middleware/             # Custom middleware
│   ├── auth.js             # Authentication middleware
│   ├── tenant.js           # Multitenancy middleware
│   ├── error.js            # Error handling middleware
│   ├── validation.js       # Input validation middleware
│   ├── rateLimit.js        # Rate limiting middleware
│   └── security.js         # Security middleware
├── models/                 # Database models
│   ├── User.js             # User model
│   ├── Tenant.js           # Tenant model
│   ├── Course.js           # Course model
│   ├── Presentation.js     # Presentation model
│   ├── Quiz.js             # Quiz model
│   ├── Screenshot.js       # Screenshot model
│   ├── Tutorial.js         # Tutorial model
│   └── Analytics.js        # Analytics model
├── routes/                 # API routes
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User routes
│   ├── tenants.js          # Tenant routes
│   ├── courses.js          # Course routes
│   ├── presentations.js    # Presentation routes
│   ├── quizzes.js          # Quiz routes
│   ├── screenshots.js      # Screenshot routes
│   ├── tutorials.js        # Tutorial routes
│   └── analytics.js        # Analytics routes
├── controllers/            # Route controllers
│   ├── auth.js             # Authentication controller
│   ├── users.js            # User controller
│   ├── tenants.js          # Tenant controller
│   ├── courses.js          # Course controller
│   ├── presentations.js    # Presentation controller
│   ├── quizzes.js          # Quiz controller
│   ├── screenshots.js      # Screenshot controller
│   ├── tutorials.js        # Tutorial controller
│   └── analytics.js        # Analytics controller
├── services/               # Business logic services
│   ├── auth.js             # Authentication service
│   ├── email.js            # Email service
│   ├── storage.js          # File storage service
│   ├── analytics.js        # Analytics service
│   └── notification.js     # Notification service
├── utils/                  # Utility functions
│   ├── validation.js       # Validation helpers
│   ├── encryption.js       # Encryption helpers
│   ├── errorHandler.js     # Error handling helpers
│   └── response.js         # Response helpers
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── uploads/                # File uploads directory
├── logs/                   # Log files directory
├── .env                    # Environment variables
├── .env.example            # Environment variables example
├── index.js                # Server entry point
└── package.json            # Dependencies and scripts
```

### Frontend Structure

```
client/
├── public/                 # Public assets
│   ├── index.html          # HTML template
│   ├── favicon.ico         # Favicon
│   └── manifest.json       # PWA manifest
├── src/
│   ├── actions/            # Redux actions
│   │   ├── auth.js         # Authentication actions
│   │   ├── tenant.js       # Tenant actions
│   │   ├── course.js       # Course actions
│   │   ├── presentation.js # Presentation actions
│   │   ├── quiz.js         # Quiz actions
│   │   ├── screenshot.js  # Screenshot actions
│   │   ├── tutorial.js     # Tutorial actions
│   │   ├── analytics.js    # Analytics actions
│   │   ├── alert.js        # Alert actions
│   │   └── types.js        # Action types
│   ├── components/         # React components
│   │   ├── layout/         # Layout components
│   │   │   ├── Navbar.js   # Navigation bar
│   │   │   ├── Sidebar.js  # Sidebar
│   │   │   └── Footer.js   # Footer
│   │   ├── auth/           # Authentication components
│   │   │   ├── Login.js    # Login form
│   │   │   ├── Register.js # Registration form
│   │   │   └── ForgotPassword.js # Forgot password form
│   │   ├── dashboard/      # Dashboard components
│   │   │   ├── CreatorDashboard.js # Creator dashboard
│   │   │   └── LearnerDashboard.js # Learner dashboard
│   │   ├── course/         # Course components
│   │   │   ├── CourseList.js # Course list
│   │   │   ├── CourseCard.js # Course card
│   │   │   ├── CourseDetails.js # Course details
│   │   │   └── CourseEditor.js # Course editor
│   │   ├── presentation/   # Presentation components
│   │   │   ├── PresentationList.js # Presentation list
│   │   │   ├── PresentationCard.js # Presentation card
│   │   │   ├── PresentationDetails.js # Presentation details
│   │   │   ├── PresentationCreator.js # Presentation creator
│   │   │   ├── SlideEditor.js # Slide editor
│   │   │   ├── HotspotEditor.js # Hotspot editor
│   │   │   └── BranchingScenarioEditor.js # Branching scenario editor
│   │   ├── quiz/           # Quiz components
│   │   │   ├── QuizList.js # Quiz list
│   │   │   ├── QuizCard.js # Quiz card
│   │   │   ├── QuizDetails.js # Quiz details
│   │   │   ├── QuizCreator.js # Quiz creator
│   │   │   ├── QuestionEditor.js # Question editor
│   │   │   └── QuizTaker.js # Quiz taker
│   │   ├── screenshot/     # Screenshot components
│   │   │   ├── ScreenshotList.js # Screenshot list
│   │   │   ├── ScreenshotCard.js # Screenshot card
│   │   │   ├── ScreenshotCapture.js # Screenshot capture
│   │   │   └── ScreenshotEditor.js # Screenshot editor
│   │   ├── tutorial/       # Tutorial components
│   │   │   ├── TutorialList.js # Tutorial list
│   │   │   ├── TutorialCard.js # Tutorial card
│   │   │   ├── TutorialDetails.js # Tutorial details
│   │   │   └── TutorialCreator.js # Tutorial creator
│   │   ├── analytics/      # Analytics components
│   │   │   ├── AnalyticsDashboard.js # Analytics dashboard
│   │   │   ├── CourseAnalytics.js # Course analytics
│   │   │   ├── UserAnalytics.js # User analytics
│   │   │   └── ReportGenerator.js # Report generator
│   │   ├── common/         # Common components
│   │   │   ├── Spinner.js  # Loading spinner
│   │   │   ├── Alert.js    # Alert component
│   │   │   ├── Modal.js    # Modal component
│   │   │   └── PrivateRoute.js # Private route component
│   │   └── ui/             # UI components
│   │       ├── Button.js   # Button component
│   │       ├── Input.js    # Input component
│   │       ├── Card.js     # Card component
│   │       └── Avatar.js   # Avatar component
│   ├── reducers/           # Redux reducers
│   │   ├── index.js        # Root reducer
│   │   ├── auth.js         # Authentication reducer
│   │   ├── tenant.js       # Tenant reducer
│   │   ├── course.js       # Course reducer
│   │   ├── presentation.js # Presentation reducer
│   │   ├── quiz.js         # Quiz reducer
│   │   ├── screenshot.js   # Screenshot reducer
│   │   ├── tutorial.js     # Tutorial reducer
│   │   ├── analytics.js    # Analytics reducer
│   │   ├── alert.js        # Alert reducer
│   │   └── ui.js           # UI reducer
│   ├── store/              # Redux store
│   │   ├── index.js        # Store configuration
│   │   └── middleware.js   # Store middleware
│   ├── utils/              # Utility functions
│   │   ├── api.js          # API utility
│   │   ├── auth.js         # Authentication utility
│   │   ├── validation.js   # Validation utility
│   │   ├── helpers.js      # Helper functions
│   │   └── constants.js    # Constants
│   ├── styles/             # Styles
│   │   ├── index.css       # Global styles
│   │   ├── theme.js        # Theme configuration
│   │   └── components/     # Component styles
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.js      # Authentication hook
│   │   ├── useTenant.js    # Tenant hook
│   │   ├── useApi.js       # API hook
│   │   └── useDebounce.js  # Debounce hook
│   ├── services/           # Services
│   │   ├── api.js          # API service
│   │   ├── auth.js         # Authentication service
│   │   ├── storage.js      # Local storage service
│   │   └── notification.js # Notification service
│   ├── pages/              # Page components
│   │   ├── Home.js         # Home page
│   │   ├── Dashboard.js    # Dashboard page
│   │   ├── Courses.js      # Courses page
│   │   ├── Presentations.js # Presentations page
│   │   ├── Quizzes.js      # Quizzes page
│   │   ├── Screenshots.js  # Screenshots page
│   │   ├── Tutorials.js    # Tutorials page
│   │   ├── Analytics.js    # Analytics page
│   │   ├── Profile.js      # Profile page
│   │   ├── Settings.js     # Settings page
│   │   └── NotFound.js     # 404 page
│   ├── App.js              # Main App component
│   ├── index.js            # App entry point
│   └── serviceWorker.js    # Service worker for PWA
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── .env                    # Environment variables
├── .env.example            # Environment variables example
├── package.json            # Dependencies and scripts
└── jsconfig.json           # JavaScript configuration
```

## Backend Development

### Express.js Setup

The backend is built using Express.js, a minimal and flexible Node.js web application framework.

#### Server Configuration

```javascript
// server/index.js
const express = require('express');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error');
const { requestLogger, errorLogger } = require('./config/logging');
const { httpRequestMetrics, connectionMetrics, initializeMetrics } = require('./config/monitoring');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Logging middleware
app.use(requestLogger);

// Monitoring middleware
app.use(httpRequestMetrics);
app.use(connectionMetrics);

// Initialize metrics
initializeMetrics();

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/presentations', require('./routes/presentations'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/screenshots', require('./routes/screenshots'));
app.use('/api/tutorials', require('./routes/tutorials'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorLogger);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
```

### Database Models

The application uses Mongoose ODM to interact with MongoDB.

#### User Model

```javascript
// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  role: {
    type: String,
    enum: ['admin', 'creator', 'learner'],
    default: 'learner'
  },
  tenantId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tenant',
    required: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorBackupCodes: [String],
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  consents: [{
    type: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['granted', 'denied'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
UserSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

module.exports = mongoose.model('User', UserSchema);
```

### Middleware

Middleware functions are used to handle various aspects of the request-response cycle.

#### Authentication Middleware

```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { securityConfig } = require('../config/security');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, securityConfig.jwt.secret);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Check if user is creator or admin
exports.isCreatorOrAdmin = (req, res, next) => {
  if (req.user.role !== 'creator' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
  next();
};

// Check if user is creator
exports.isCreator = (req, res, next) => {
  if (req.user.role !== 'creator') {
    return res.status(403).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
  next();
};

// Check if user is learner or admin
exports.isLearnerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'learner' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
  next();
};

// Check if user is learner
exports.isLearner = (req, res, next) => {
  if (req.user.role !== 'learner') {
    return res.status(403).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
  next();
};
```

#### Tenant Middleware

```javascript
// server/middleware/tenant.js
const { Tenant } = require('../models/Tenant');

// Get tenant from request
exports.getTenant = async (req, res, next) => {
  try {
    // Get tenant from subdomain or header
    let tenant;
    
    if (req.subdomains && req.subdomains.length > 0) {
      tenant = await Tenant.findOne({ slug: req.subdomains[0] });
    } else if (req.headers['x-tenant-id']) {
      tenant = await Tenant.findById(req.headers['x-tenant-id']);
    } else if (req.user && req.user.tenantId) {
      tenant = await Tenant.findById(req.user.tenantId);
    }

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (!tenant.isActive) {
      return res.status(403).json({ success: false, message: 'Tenant is not active' });
    }

    req.tenant = tenant;
    next();
  } catch (err) {
    next(err);
  }
};

