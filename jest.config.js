module.exports = {
    testEnvironment: "jsdom",
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
      'src/**/*.{js,jsx}',
      '!**/node_modules/**',
      '!**/__tests__/**'
    ],
    coverageReporters: ['text', 'lcov']
  };
  