// Test setup file for running server tests

// Set environment to test
process.env.NODE_ENV = 'test';

// Set test database URI
process.env.MONGO_URI = 'mongodb://localhost:27017/elearning_test';

// Set JWT secret
process.env.JWT_SECRET = 'test-jwt-secret';

// Set other environment variables
process.env.PORT = 5001;

// Import dependencies
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Create an in-memory MongoDB server for testing
let mongoServer;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Clear all data before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect from the in-memory database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global test timeout
jest.setTimeout(30000);