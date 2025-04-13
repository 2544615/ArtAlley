// babel.config.js
module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['@babel/preset-env'],
      plugins: ['babel-plugin-istanbul'],
      env: {
        test: {
          plugins: ['istanbul'] // <--- enables instrumentation for code coverage
        }
      }
    };
  };
  