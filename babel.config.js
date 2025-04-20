module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['@babel/preset-env'],
    env: {
      test: {
        plugins: ['babel-plugin-istanbul'] // <-- Use full plugin name
      }
    }
  };
};