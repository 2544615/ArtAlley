module.exports = {
  testEnvironment: 'node', // or 'jsdom' for browser-like env
  testMatch: ['**/*.test.js', '**/*.spec.js'], // test file patterns
  collectCoverage: true, // enable coverage
  coverageDirectory: 'coverage', // where coverage reports go
  coverageReporters: ['text', 'lcov'], // report formats
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
};