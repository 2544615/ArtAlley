export default {
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
    //"**/*.js",
    //"!**/*.test.js",
    //"!**/node_modules/**",
    "**/*.{js,jsx}",
    "!**/node_modules/**",
    "!/**/index.js",
    
    "!**/*.test.{js,jsx}",
    //"!**/firebaseConfig.js", // ⛔ exclude utility/init-only files
    //"!**/index.js", // ⛔ exclude entry files if not testable
    "!**/jest.config.js",
    //"!**/coverage",
    "!**/prettify.js",
    "!**/block-navigation.js",
    "!**/sorter.js"
    //"!**/Homepage Folder"

    
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/'
  ],

  // Output coverage information
  coverageReporters: ['json', 'lcov', 'text', 'clover'],

  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  /*globals: {
    TextEncoder: require('util').TextEncoder,
  },*/
};
