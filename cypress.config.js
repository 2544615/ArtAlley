const { defineConfig } = require("cypress");
const codeCoverageTask = require('@cypress/code-coverage/task');
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      codeCoverageTask(on, config);

      // Add custom task for debugging
      on('task', {
        coverageReport(data) {
          console.log('Coverage data received:', data);
          return null;
        },
      });

      return config;
    },
  },
});
