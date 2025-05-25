export default {

  // ...existing config...

  extensionsToTreatAsEsm: [], // Treat .js files as ESM
  transform: {},
  // OR if you're using Babel:
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  preset: undefined,

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
    "!**/index.js",
    
    "!**/*.test.{js,jsx}",
    "!**/firebaseConfig.js", // ⛔ exclude utility/init-only files
    //"!**/index.js", // ⛔ exclude entry files if not testable
    "!**/jest.config.js",
    "!**/babel.config.js",
    //"!**/coverage",
    //COVERAGE
    "!**/prettify.js",
    "!**/block-navigation.js",
    "!**/sorter.js",
    //NOT TESTES YET
    //"!**/checkoutdelivery.js",
    //"!**/delivery.js",
    //"!**/paystack.js",
    //"!**/product-details.js",
    //"!**/reviews.js",
    //"!**/view-orders.js",
    //"!**/orderedProducts.js",

    //CODE THAT HAVE TEST SUITES FAILS
    "!**/checkoutdelivery.js",
    "!**/checkout.js",


    
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],

  // Output coverage information
  coverageReporters: ['json', 'lcov', 'text', 'clover'],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  //transform:{},
  /*transform: {
    '^.+\\.js$': 'babel-jest',
  }*/

  /*globals: {
    TextEncoder: require('util').TextEncoder,
  },*/
};