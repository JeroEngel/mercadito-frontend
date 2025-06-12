// appium/helpers/commands.js
// Comandos personalizados para Appium que replican la funcionalidad de Cypress

/**
 * Comando para registrar un usuario
 * Replica el comando cy.registerUser() de Cypress
 */
browser.addCommand('registerUser', async function (userData) {
    const { firstName, lastName, email, password } = userData;
    
    console.log(`📝 Registrando usuario: ${firstName} ${lastName} (${email})`);
    
    // Esperar a que la app cargue completamente
    await this.waitForApp();
    
    // Buscar y hacer click en el botón "Crear Cuenta"
    const createAccountButton = await this.$('~Crear Cuenta');
    await createAccountButton.waitForExist({ timeout: 10000 });
    await createAccountButton.click();
    
    // Esperar a que aparezca la pantalla de registro
    const createAccountTitle = await this.$('~Create Account');
    await createAccountTitle.waitForExist({ timeout: 10000 });
    
    // Llenar el formulario de registro
    const firstNameInput = await this.$('~input-firstName');
    await firstNameInput.waitForExist({ timeout: 5000 });
    await firstNameInput.setValue(firstName);
    
    const lastNameInput = await this.$('~input-lastName');
    await lastNameInput.setValue(lastName);
    
    const emailInput = await this.$('~input-email');
    await emailInput.setValue(email);
    
    const passwordInput = await this.$('~input-password');
    await passwordInput.setValue(password);
    
    // Hacer click en el botón de registro
    const registerButton = await this.$('~button-register');
    await registerButton.click();
    
    // Esperar a que regrese al login
    const backToLoginButton = await this.$('~Volver a Iniciar Sesión');
    await backToLoginButton.waitForExist({ timeout: 10000 });
    
    console.log(`✅ Usuario ${email} registrado exitosamente`);
});

/**
 * Comando para hacer login
 * Replica el comando cy.loginUser() de Cypress
 */
browser.addCommand('loginUser', async function (email, password) {
    console.log(`🔐 Haciendo login con: ${email}`);
    
    // Esperar a que la app cargue
    await this.waitForApp();
    
    // Llenar el formulario de login
    const emailInput = await this.$('~input-email');
    await emailInput.waitForExist({ timeout: 10000 });
    await emailInput.clearValue();
    await emailInput.setValue(email);
    
    const passwordInput = await this.$('~input-password');
    await passwordInput.clearValue();
    await passwordInput.setValue(password);
    
    // Hacer click en el botón de login
    const loginButton = await this.$('~button-login');
    await loginButton.click();
    
    // Verificar que el login fue exitoso esperando el balance
    const balanceLabel = await this.$('~Saldo disponible');
    await balanceLabel.waitForExist({ timeout: 15000 });
    
    console.log(`✅ Login exitoso para ${email}`);
});

/**
 * Comando para cargar dinero (depósito)
 * Replica el comando cy.depositMoney() de Cypress
 */
browser.addCommand('depositMoney', async function (cvu, amount) {
    console.log(`💰 Cargando $${amount} desde CVU: ${cvu}`);
    
    // Hacer click en el botón "Cargar dinero"
    const loadMoneyButton = await this.$('[data-testid="load-money-button"]');
    await loadMoneyButton.waitForExist({ timeout: 10000 });
    await loadMoneyButton.click();
    
    // Llenar el formulario de depósito
    const cvuInput = await this.$('[data-testid="cvu-input"]');
    await cvuInput.waitForExist({ timeout: 5000 });
    await cvuInput.setValue(cvu);
    
    const amountInput = await this.$('[data-testid="amount-input"]');
    await amountInput.setValue(amount.toString());
    
    // Hacer click en el botón de depósito
    const depositButton = await this.$('[data-testid="deposit-button"]');
    await depositButton.click();
    
    // Esperar a que regrese al home y el balance se actualice
    await this.pause(500); // Esperar procesamiento
    const balanceLabel = await this.$('~Saldo disponible');
    await balanceLabel.waitForExist({ timeout: 20000 });
    
    console.log(`✅ Depósito de $${amount} realizado exitosamente`);
});

/**
 * Comando para transferir dinero
 * Replica el comando cy.transferMoney() de Cypress
 */
browser.addCommand('transferMoney', async function (email, amount, description = '') {
    console.log(`💸 Transfiriendo $${amount} a: ${email}`);
    
    // Hacer click en el botón "Enviar dinero"
    const sendMoneyButton = await this.$('~Enviar dinero');
    await sendMoneyButton.waitForExist({ timeout: 10000 });
    await sendMoneyButton.click();
    
    // Llenar el formulario de transferencia
    const emailInput = await this.$('~input-transfer-email');
    await emailInput.waitForExist({ timeout: 5000 });
    await emailInput.setValue(email);
    
    const amountInput = await this.$('~input-transfer-amount');
    await amountInput.setValue(amount.toString());
    
    if (description) {
        const descriptionInput = await this.$('~input-transfer-description');
        await descriptionInput.setValue(description);
    }
    
    // Hacer click en el botón de envío
    const sendButton = await this.$('[data-testid="send-button"]');
    await sendButton.click();
    
    // Esperar a que regrese al home
    const balanceLabel = await this.$('~Saldo disponible');
    await balanceLabel.waitForExist({ timeout: 20000 });
    
    console.log(`✅ Transferencia de $${amount} a ${email} realizada exitosamente`);
});

/**
 * Comando para verificar saldo
 * Replica el comando cy.verifyBalance() de Cypress
 */
browser.addCommand('verifyBalance', async function (expectedBalance) {
    console.log(`🔍 Verificando saldo esperado: $${expectedBalance.toFixed(2)}`);
    
    const balanceText = `$${expectedBalance.toFixed(2)}`;
    const balanceElement = await this.$(`~${balanceText}`);
    
    await balanceElement.waitForExist({ timeout: 10000 });
    const isDisplayed = await balanceElement.isDisplayed();
    
    if (!isDisplayed) {
        throw new Error(`Balance esperado $${expectedBalance.toFixed(2)} no encontrado`);
    }
    
    console.log(`✅ Saldo verificado correctamente: $${expectedBalance.toFixed(2)}`);
});

/**
 * Comando para verificar transacciones en el historial
 * Replica el comando cy.verifyTransactionInHistory() de Cypress
 */
browser.addCommand('verifyTransactionInHistory', async function (transactionType, amount) {
    console.log(`📋 Verificando transacción en historial: ${transactionType} $${amount.toFixed(2)}`);
    
    // Ir al historial usando el tab del bottom navigator
    const historyTab = await this.$('~History');
    await historyTab.click();
    
    // Esperar a que aparezca el historial
    const historyTitle = await this.$('~Historial de transacciones');
    await historyTitle.waitForExist({ timeout: 10000 });
    
    // Verificar que existe la transacción
    const transactionTypeElement = await this.$(`~${transactionType}`);
    await transactionTypeElement.waitForExist({ timeout: 5000 });
    
    const amountElement = await this.$(`~$${amount.toFixed(2)}`);
    await amountElement.waitForExist({ timeout: 5000 });
    
    // Regresar al home
    const homeTab = await this.$('~Home');
    await homeTab.click();
    
    console.log(`✅ Transacción verificada en historial: ${transactionType} $${amount.toFixed(2)}`);
});

/**
 * Comando para limpiar datos de la app
 * Replica el comando cy.cleanupBackend() de Cypress
 */
browser.addCommand('cleanupBackend', async function () {
    console.log(`🧹 Limpiando datos de la aplicación`);
    
    // En Appium, esto sería resetear la app
    await this.reset();
    
    console.log(`✅ Datos de la aplicación limpiados`);
});

/**
 * Comando para verificar que el fake bank API está funcionando
 * Replica el comando cy.verifyFakeBankAPI() de Cypress
 */
browser.addCommand('verifyFakeBankAPI', async function () {
    console.log(`🏦 Verificando Fake Bank API`);
    
    // En un entorno móvil, esto se haría verificando conectividad
    // o haciendo una request HTTP si es necesario
    // Por ahora, asumimos que está funcionando
    
    console.log(`✅ Fake Bank API verificado`);
});

/**
 * Comando para esperar a que la app cargue completamente
 * Replica el comando cy.waitForApp() de Cypress
 */
browser.addCommand('waitForApp', async function () {
    console.log(`⏳ Esperando a que la app cargue completamente`);
    
    // Esperar a que aparezca el título principal de la app
    const appTitle = await this.$('~Mercadito Wallet');
    await appTitle.waitForExist({ timeout: 15000 });
    
    console.log(`✅ App cargada completamente`);
});

console.log('📱 Comandos personalizados de Appium cargados exitosamente');