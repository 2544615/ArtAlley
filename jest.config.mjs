export default {

  extensionsToTreatAsEsm: [], 
  transform: {},

  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  preset: undefined,
  testEnvironment: 'jsdom',

  testMatch: ["**/*.test.[jt]s?(x)"],

  moduleDirectories: ['node_modules'],


  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },


  collectCoverage: true,
  collectCoverageFrom: [

    "**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/index.js",
    
    "!**/*.test.{js,jsx}",
    "!**/firebaseConfig.js", 
    "!**/jest.config.js",
    "!**/babel.config.js",

    "!**/prettify.js",
    "!**/block-navigation.js",
    "!**/sorter.js",

    "!**/checkoutdelivery.js",
    "!**/checkout.js",


    
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],

  coverageReporters: ['json', 'lcov', 'text', 'clover'],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

};