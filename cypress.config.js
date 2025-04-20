const { defineConfig } = require("cypress");
const codeCoverageTask = require('@cypress/code-coverage/task');
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      codeCoverageTask(on, config);

      const fs = require('fs');

      on('task', {
        coverageReport(data) {
          fs.writeFileSync('coverage/cypress-coverage.json', JSON.stringify(data));
          return { success: true }; // Return meaningful status
        }
      });

      return config;
    },
  },
});
