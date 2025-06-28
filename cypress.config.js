const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    env: {
      // Variables d'environnement pour les tests
      apiUrl: 'https://ci-cd-ynov-back-lanzafame.vercel.app',
      testUser: {
        email: 'test@example.com',
        password: 'password123'
      },
      adminUser: {
        email: 'loise.fenoll@ynov.com',
        password: 'admin123'
      }
    }
  },
});
