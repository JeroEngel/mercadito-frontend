const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:19006', // Puerto típico de Expo Web
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      // URLs de APIs
      BACKEND_API_URL: 'http://localhost:8080/api',
      FAKE_BANK_API_URL: 'http://localhost:3000'
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
})