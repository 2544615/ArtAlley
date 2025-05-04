module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ["**/*.test.[jt]s?(x)"],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^https://www.gstatic.com/firebasejs/(.*)$': '<rootDir>/__mocks__/firebase.js'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "**/SignUp Folder/**/*.js",
    "**/SignIn Folder/**/*.js",
    "**/Seller Folder/**/*.js",
    "!**/node_modules/**",
    "!**/*.test.js"
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'text-summary'],
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
  transformIgnorePatterns: [
    '/node_modules/(?!firebase)',
    'https://www.gstatic.com/firebasejs/.*'
  ],
  globals: {
    TextEncoder: require('util').TextEncoder,
  },
  verbose: true
};