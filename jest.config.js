module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/*.test.[jt]s?(x)"],

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ['node_modules'],

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],

  // Mocks CSS files to return an empty object
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // Collect coverage information from specified folders
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/*.test.{js,jsx}",
    "!**/jest.config.js"
  ],

  // Output coverage information
  coverageReporters: ['json', 'lcov', 'text', 'clover','text-summary'],
  coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },

  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  globals: {
    TextEncoder: require('util').TextEncoder,
  },
};
