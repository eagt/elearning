const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const User = require('../../models/User');
const Tenant = require('../../models/Tenant');

// Mock the auth middleware for testing
jest.mock('../../middleware/auth', () => (req, res, next) => {
  // For testing purposes, we'll mock a user
  req.user = {
    id: '507f1f77bcf86cd799439011', // Mock ObjectId
    role: 'creator'
  };
  next();
});

// Mock the tenant middleware for testing
jest.mock('../../middleware/tenant', () => (req, res, next) => {
  // For testing purposes, we'll mock a tenant
  req.tenantId = '507f1f77bcf86cd799439012'; // Mock ObjectId
  next();
});

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Connect to a test database
    const url = 'mongodb://localhost:27017/elearning_test';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
    await Tenant.deleteMany({});
  });

  describe('POST /api/auth', () => {
    it('should authenticate a user with valid credentials', async () => {
      // Create a test tenant
      const tenant = new Tenant({
        name: 'Test Organization',
        slug: 'test-org',
        settings: {
          theme: 'default',
          customCSS: ''
        }
      });
      await tenant.save();

      // Create a test user
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator',
        tenantId: tenant._id
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('john@example.com');
    });

    it('should not authenticate a user with invalid credentials', async () => {
      // Create a test tenant
      const tenant = new Tenant({
        name: 'Test Organization',
        slug: 'test-org',
        settings: {
          theme: 'default',
          customCSS: ''
        }
      });
      await tenant.save();

      // Create a test user
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator',
        tenantId: tenant._id
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toBe('Invalid credentials');
    });

    it('should not authenticate a user that does not exist', async () => {
      const res = await request(app)
        .post('/api/auth')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth', () => {
    it('should get the current user', async () => {
      // Create a test tenant
      const tenant = new Tenant({
        name: 'Test Organization',
        slug: 'test-org',
        settings: {
          theme: 'default',
          customCSS: ''
        }
      });
      await tenant.save();

      // Create a test user
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator',
        tenantId: tenant._id
      });
      await user.save();

      // Get token for the user
      const token = user.getSignedJwtToken();

      const res = await request(app)
        .get('/api/auth')
        .set('x-auth-token', token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('john@example.com');
    });

    it('should not get the current user without a token', async () => {
      const res = await request(app)
        .get('/api/auth');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toBe('No token, authorization denied');
    });
  });
});