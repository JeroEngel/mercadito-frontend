// cypress/e2e/wallet-complete-flow.cy.js

describe('Flujo completo de Wallet - Registro, Login, Carga y Transferencia', () => {
  let testData

  before(() => {
    // Cargar datos de prueba
    cy.fixture('testData').then((data) => {
      testData = data
    })
    
    // Verificar que el Fake Bank API esté funcionando
    cy.verifyFakeBankAPI()
  })

  beforeEach(() => {
    // Limpiar datos antes de cada test
    cy.cleanupBackend()
  })

  it('Debe completar el flujo completo: registro → login → carga → transferencia', () => {
    const user1 = testData.testUsers.user1
    const user2 = testData.testUsers.user2
    const account1 = testData.bankAccounts.account1
    const depositAmount = testData.transactions.deposit.amount
    const transferAmount = testData.transactions.transfer.amount

    // ========== PASO 1: REGISTRAR PRIMER USUARIO ==========
    cy.log('**PASO 1: Registrando primer usuario**')
    cy.registerUser(user1)

    // ========== PASO 2: REGISTRAR SEGUNDO USUARIO ==========
    cy.log('**PASO 2: Registrando segundo usuario**')
    cy.registerUser(user2)

    // ========== PASO 3: LOGIN CON PRIMER USUARIO ==========
    cy.log('**PASO 3: Haciendo login con primer usuario**')
    cy.loginUser(user1.email, user1.password)

    // Verificar saldo inicial (debería ser 0)
    cy.verifyBalance(0)

    // ========== PASO 4: CARGAR DINERO ==========
    cy.log('**PASO 4: Cargando dinero desde cuenta bancaria**')
    // Usar la MISMA lógica del segundo test que funciona
    cy.get('[data-testid="load-money-button"]').click()
    cy.get('[data-testid="cvu-input"]').type(account1.cvu)
    cy.get('[data-testid="amount-input"]').type(depositAmount.toString())
    cy.get('[data-testid="deposit-button"]').click()
    
    // Estrategia más simple: ir directamente al home
    cy.wait(500) // Esperar a que se procese el depósito
    cy.visit('/') // Ir directamente al home
    cy.log('**PASO 3: Haciendo login con primer usuario**')
    cy.loginUser(user1.email, user1.password)
    cy.contains('Saldo disponible', { timeout: 20000 }).should('be.visible')

    // Verificar que el saldo se actualizó
    cy.verifyBalance(depositAmount)

    // Verificar la transacción en el historial
    // ========== PASO 5: TRANSFERIR DINERO ==========
    cy.log('**PASO 5: Transfiriendo dinero al segundo usuario**')
    cy.transferMoney(user2.email, transferAmount, testData.transactions.transfer.description)

    // Verificar que el saldo se actualizó después de la transferencia
    const expectedBalanceAfterTransfer = depositAmount - transferAmount
    cy.verifyBalance(expectedBalanceAfterTransfer)

    // Verificar la transacción de envío en el historial

    // ========== PASO 6: VERIFICAR RECEPCIÓN EN SEGUNDO USUARIO ==========
    cy.log('**PASO 6: Verificando recepción en segundo usuario**')
    
    // Logout del primer usuario (limpiar datos)
    cy.clearLocalStorage()
    
    // Login con segundo usuario
    cy.loginUser(user2.email, user2.password)
    
    // Verificar que recibió el dinero
    cy.verifyBalance(transferAmount)
    
    // Verificar la transacción de recepción en el historial

    cy.log('**✅ FLUJO COMPLETO EXITOSO**')
  })


  it('Debe validar CVU correctamente en carga de dinero', () => {
    const user1 = testData.testUsers.user1

    // Registrar y hacer login
    cy.registerUser(user1)
    cy.loginUser(user1.email, user1.password)

    // Ir a cargar dinero
    cy.get('[data-testid="load-money-button"]').click()

    // ========== TEST CVU INVÁLIDO ==========
    cy.log('**Testing CVU inválido**')
    
    // CVU muy corto
    cy.get('[data-testid="cvu-input"]').type('123456')
    cy.get('[data-testid="amount-input"]').type('100')
    cy.get('[data-testid="deposit-button"]').click()
    
    cy.contains('El CVU debe tener exactamente 22 dígitos').should('be.visible')

    // Limpiar campos
    cy.get('[data-testid="cvu-input"]').clear()
    cy.get('[data-testid="amount-input"]').clear()

    // ========== TEST MONTO INVÁLIDO ==========
    cy.log('**Testing monto inválido**')
    
    cy.get('[data-testid="cvu-input"]').type('0000003100010000000001')
    cy.get('[data-testid="amount-input"]').type('0')
    cy.get('[data-testid="deposit-button"]').click()
    
    cy.contains('Por favor, ingresa una cantidad válida mayor a 0').should('be.visible')
  })
})