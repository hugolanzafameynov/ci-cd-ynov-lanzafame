const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: process.env.REACT_APP_URL,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    env: {
      apiUrl: process.env.REACT_APP_API_URL,
      testUser: {
        email: 'test@example.com',
        password: 'password123'
      },
      adminUser: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      }
    }
  },
});
