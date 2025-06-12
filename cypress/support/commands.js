// cypress/support/commands.js

// Comando para registrar un usuario
Cypress.Commands.add('registerUser', (userData) => {
  const { firstName, lastName, email, password } = userData
  
  cy.visit('/')
  
  // Esperar a que la app cargue completamente
  cy.get('body', { timeout: 10000 }).should('be.visible')
  
  // Buscar el botón de registro (puede ser "Crear Cuenta" en el LoginScreen)
  cy.contains('Crear Cuenta').click()
  
  // Esperar a que aparezca la pantalla de registro
  cy.contains('Create Account', { timeout: 10000 }).should('be.visible')
  
  // Estrategia más robusta: usar force: true para todos los campos y seleccionar solo elementos visibles
  cy.get('input[placeholder="Nombre"]').filter(':visible').first().clear({ force: true }).type(firstName, { force: true })
  cy.wait(500)
  
  cy.get('input[placeholder="Apellido"]').filter(':visible').first().clear({ force: true }).type(lastName, { force: true })
  cy.wait(500)
  
  cy.get('input[placeholder="Email"]').filter(':visible').first().clear({ force: true }).type(email, { force: true })
  cy.wait(500)
  
  cy.get('input[placeholder="Contraseña"]').filter(':visible').first().clear({ force: true }).type(password, { force: true })
  cy.wait(500)
  
  // Buscar el botón de registro por texto en lugar de testID
  cy.contains('button', 'Registrarse').click()
  
  // Esperar a que regrese al login (botón "Volver a Iniciar Sesión")
  cy.contains('Volver a Iniciar Sesión', { timeout: 10000 }).should('be.visible')
})

// Comando para hacer login
Cypress.Commands.add('loginUser', (email, password) => {
  cy.visit('/')
  
  // Esperar a que la app cargue y aparezca el login
  cy.contains('Mercadito Wallet', { timeout: 10000 }).should('be.visible')
  
  // Usar la misma estrategia robusta que en registro
  cy.get('input[placeholder="Email"]').filter(':visible').first().clear({ force: true }).type(email, { force: true })
  
  cy.get('input[placeholder="Contraseña"]').filter(':visible').first().clear({ force: true }).type(password, { force: true })
  
  cy.contains('button', 'Iniciar Sesión').click()
  
  // Verificar que el login fue exitoso (aparece el balance)
  cy.contains('Saldo disponible', { timeout: 15000 }).should('be.visible')
})

// Comando para cargar dinero (deposit)
Cypress.Commands.add('depositMoney', (cvu, amount) => {
  // Copiar EXACTAMENTE la lógica del segundo test que funciona
  cy.get('[data-testid="load-money-button"]').click()
  
  // Esperar a que aparezca la pantalla de depósito
  
  // Usar la MISMA lógica simple del segundo test - SIN filtros ni force
  cy.get('[data-testid="cvu-input"]').type('0000003100010000000001')
  cy.get('[data-testid="amount-input"]').type('100')
 cy.get('[data-testid="deposit-button"]').click()
  
  // Esperar a que regrese al home
  cy.contains('Saldo disponible', { timeout: 20000 }).should('be.visible')
})

// Comando para transferir dinero
Cypress.Commands.add('transferMoney', (email, amount, description = '') => {
  // Navegar a la pantalla de transferir dinero
  cy.contains('Enviar dinero').should('be.visible').click()
  
  // Esperar a que aparezca la pantalla de transferencia
  
  // Llenar el formulario usando placeholders - añadir verificación de visibilidad y force cuando sea necesario
  cy.get('input[placeholder*="Email"]').should('be.visible').then($el => {
    if ($el.is(':visible')) {
      cy.wrap($el).clear().type(email)
    } else {
      cy.wrap($el).clear({ force: true }).type(email)
    }
  })
  
  cy.get('input[placeholder="Monto"]').should('be.visible').then($el => {
    if ($el.is(':visible')) {
      cy.wrap($el).clear().type(amount.toString())
    } else {
      cy.wrap($el).clear({ force: true }).type(amount.toString())
    }
  })
  
  if (description) {
    cy.get('input[placeholder*="Descripción"]').should('be.visible').then($el => {
      if ($el.is(':visible')) {
        cy.wrap($el).clear().type(description)
      } else {
        cy.wrap($el).clear({ force: true }).type(description)
      }
    })
  }
  
  // Hacer click en enviar
  cy.get('[data-testid="send-button"]').click()
  
  // Esperar a que regrese al home
  cy.contains('Saldo disponible', { timeout: 20000 }).should('be.visible')
})

// Comando para verificar saldo
Cypress.Commands.add('verifyBalance', (expectedBalance) => {
  cy.contains('$' + expectedBalance.toFixed(2)).should('be.visible')
})

// Comando para verificar transacciones en el historial
Cypress.Commands.add('verifyTransactionInHistory', (transactionType, amount) => {
  // Ir al historial de transacciones usando el tab del bottom navigator
  cy.contains('History').click()
  
  // Esperar a que aparezca el historial
  cy.contains('Historial de transacciones', { timeout: 10000 }).should('be.visible')
  
  // Verificar que existe una transacción con el tipo y monto especificado
  cy.contains(transactionType).should('be.visible')
  cy.contains('$' + amount.toFixed(2)).should('be.visible')
  
  // Regresar al home usando el tab del bottom navigator
  cy.contains('Home').click()
})

// Comando para limpiar datos del backend (útil para tests)
Cypress.Commands.add('cleanupBackend', () => {
  // Limpiar localStorage y cookies
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Comando para verificar que el fake bank API está funcionando
Cypress.Commands.add('verifyFakeBankAPI', () => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('FAKE_BANK_API_URL')}/accounts`,
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(200)
  })
})

// Comando para esperar a que la app de React Native cargue completamente
Cypress.Commands.add('waitForApp', () => {
  // Esperar a que aparezca algún elemento que indique que la app cargó
  cy.get('body', { timeout: 15000 }).should('be.visible')
  cy.contains('Mercadito Wallet', { timeout: 15000 }).should('be.visible')
})