const mongoose = require('mongoose');
const User = require('../User');

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockImplementation((password, hashedPassword) => {
    return Promise.resolve(password === 'correctPassword');
  })
}));

describe('User Model', () => {
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
  });

  describe('User creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).toBe('hashedPassword');
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should not create a user without required fields', async () => {
      const user = new User({});
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.firstName).toBeDefined();
      expect(error.errors.lastName).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should not create a user with invalid email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
        role: 'creator'
      };

      const user = new User(userData);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should not create a user with duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      
      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Duplicate key error code
    });

    it('should set default role to learner if not provided', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('learner');
    });

    it('should set default isActive to true if not provided', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.isActive).toBe(true);
    });
  });

  describe('User methods', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      });
      await user.save();
    });

    describe('matchPassword', () => {
      it('should return true if password matches', async () => {
        const isMatch = await user.matchPassword('correctPassword');
        expect(isMatch).toBe(true);
      });

      it('should return false if password does not match', async () => {
        const isMatch = await user.matchPassword('wrongPassword');
        expect(isMatch).toBe(false);
      });
    });

    describe('getSignedJwtToken', () => {
      it('should return a JWT token', () => {
        const token = user.getSignedJwtToken();
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
      });
    });
  });

  describe('User virtuals', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      });
      await user.save();
    });

    describe('fullName', () => {
      it('should return the full name of the user', () => {
        expect(user.fullName).toBe('John Doe');
      });
    });
  });

  describe('User toJSON', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      });
      await user.save();
    });

    it('should return user object without password', () => {
      const userObject = user.toJSON();
      expect(userObject.password).toBeUndefined();
      expect(userObject.firstName).toBe('John');
      expect(userObject.lastName).toBe('Doe');
      expect(userObject.email).toBe('john@example.com');
      expect(userObject.role).toBe('creator');
    });
  });

  describe('User pre-save hook', () => {
    it('should hash password before saving', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).toBe('hashedPassword');
    });

    it('should not hash password if it is not modified', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      };

      const user = new User(userData);
      await user.save();

      user.firstName = 'Jane';
      await user.save();

      expect(user.password).toBe('hashedPassword');
    });
  });
});