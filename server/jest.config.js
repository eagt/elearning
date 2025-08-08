module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage/server',

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json'],

  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/client/src/$1'
  },

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '<rootDir>/server/**/__tests__/**/*.{js}',
    '<rootDir>/server/**/*.{test,spec}.{js}'
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/.vscode/',
    '<rootDir>/.git/'
  ],

  // Setting this value to "fake" allows the use of fake timers for functions such as setTimeout
  timers: 'fake',

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js)$'
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
    '!server/config/**/*.js'
  ],

  // The threshold for global coverage
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Global variables that need to be available in all test environments
  globals: {
    'process.env': {
      NODE_ENV: 'test',
      MONGO_URI: 'mongodb://localhost:27017/elearning_test',
      JWT_SECRET: 'test-jwt-secret',
      PORT: 5001
    }
  }
};