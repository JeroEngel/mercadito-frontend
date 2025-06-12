// cypress/support/e2e.js
import './commands'

// Hide fetch/XHR requests from command log
Cypress.on('window:before:load', (win) => {
  // Configuración adicional si es necesaria
})

// Configuración global
beforeEach(() => {
  // Limpiar localStorage antes de cada test
  cy.clearLocalStorage()
})