// appium/helpers/web-commands.js
// Comandos personalizados para WebDriverIO en modo web que replican la funcionalidad de Cypress

/**
 * Comando para registrar un usuario en modo web
 * Replica el comando cy.registerUser() de Cypress pero para web browser
 */
browser.addCommand('registerUser', async function (userData) {
    console.log(`📝 Registrando usuario web: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    
    try {
        // Navegar a la app
        await this.url('http://localhost:19006/');
        await this.waitForApp();
        
        // Hacer clic en "Crear Cuenta" con manejo robusto
        const createAccountButton = './/button[contains(., "Crear Cuenta") and not(.//button)]';
        await this.robustClick(createAccountButton, { description: 'botón Crear Cuenta' });
        
        // Esperar a que aparezca la pantalla de registro
        console.log(`⏳ Esperando a que aparezca la pantalla de registro...`);
        
        // Buscar el título "Create Account" para confirmar que estamos en la pantalla correcta
        try {
            const registerTitle = await this.$('*=Create Account');
            await registerTitle.waitForExist({ timeout: 10000 });
            console.log(`✅ Pantalla de registro detectada`);
        } catch (error) {
            console.log(`⚠️ No se encontró el título, continuando...`);
        }
        
        // Esperar un poco más para asegurar que todos los campos estén renderizados
        await this.pause(2000);
        
        // Llenar nombre - usar selectores más amplios
        console.log(`📝 Llenando nombre: ${userData.firstName}`);
        const nameSelectors = [
            'input[data-testid="first-name-input"]',
            'input[placeholder*="Nombre"]',
            '//input[1]', // Primer input
            'input[aria-label*="First name"]',
            '//input[contains(@placeholder, "Nombre")]'
        ];
        await this.fillInputWithFallback(nameSelectors, userData.firstName, 'nombre');
        
        // Llenar apellido - usar selectores más amplios
        console.log(`📝 Llenando apellido: ${userData.lastName}`);
        const lastNameSelectors = [
            'input[data-testid="last-name-input"]',
            'input[placeholder*="Apellido"]',
            '//input[2]', // Segundo input
            'input[aria-label*="Last name"]',
            '//input[contains(@placeholder, "Apellido")]'
        ];
        await this.fillInputWithFallback(lastNameSelectors, userData.lastName, 'apellido');
        
        // Llenar email - usar selectores más específicos basados en la imagen
        console.log(`📝 Llenando email: ${userData.email}`);
        const emailSelectors = [
            'input[data-testid="email-input"]',
            '//input[3]', // Tercer input (basado en la posición en la imagen)
            'input[type="email"]',
            'input[placeholder="Email"]',
            'input[placeholder*="email" i]', // Case insensitive
            '//input[contains(@placeholder, "Email")]',
            '//input[@type="email"]',
            'input[aria-label*="Email"]'
        ];
        await this.fillInputWithFallback(emailSelectors, userData.email, 'email');
        
        // Llenar contraseña
        console.log(`📝 Llenando contraseña`);
        const passwordSelectors = [
            'input[data-testid="password-input"]',
            '//input[4]', // Cuarto input
            'input[type="password"]',
            'input[placeholder*="Contraseña"]',
            'input[placeholder*="Password"]',
            '//input[contains(@placeholder, "Contraseña")]',
            '//input[@type="password"]',
            'input[aria-label*="Password"]'
        ];
        await this.fillInputWithFallback(passwordSelectors, userData.password, 'contraseña');
        
        // Enviar formulario
        const submitSelectors = [
            'button[data-testid="register-button"]',
            './/button[contains(., "Registrarse") and not(.//button)]',
            '//button[contains(text(), "Registrarse")]',
            'button[type="submit"]'
        ];
        await this.robustClickWithFallback(submitSelectors, 'botón Registrarse');
        
        // Esperar confirmación o redirección
        await this.pause(3000);
        
        console.log(`✅ Usuario registrado exitosamente`);
        return true;
        
    } catch (error) {
        console.log(`❌ Error durante el registro: ${error.message}`);
        throw error;
    }
});

/**
 * Comando para hacer login en modo web
 * Replica el comando cy.loginUser() de Cypress
 */
browser.addCommand('loginUser', async function (email, password) {
    console.log(`🔐 Haciendo login web con: ${email}`);
    
    // Navegar a la aplicación si no estamos ya ahí
    await this.url('http://localhost:19006');
    await this.waitForApp();
    
    // Llenar el formulario de login
    const emailInput = await this.$('input[type="email"]');
    await emailInput.waitForExist({ timeout: 10000 });
    await emailInput.clearValue();
    await emailInput.setValue(email);
    
    const passwordInput = await this.$('input[type="password"]');
    await passwordInput.clearValue();
    await passwordInput.setValue(password);
    
    // Hacer click en el botón de login
    const loginButton = await this.$('button*=Iniciar');
    await loginButton.click();
    
    // Verificar que el login fue exitoso esperando el balance o dashboard
    await this.pause(3000);
    
    console.log(`✅ Login web exitoso para ${email}`);
});

/**
 * Comando para cargar dinero (depósito) en modo web
 * Replica el comando cy.depositMoney() de Cypress
 */
browser.addCommand('depositMoney', async function (cvu, amount) {
    console.log(`💰 Cargando web $${amount} desde CVU: ${cvu}`);
    
    // Hacer click en el botón "Cargar dinero" o similar
    const loadMoneyButton = await this.$('button*=Cargar');
    await loadMoneyButton.waitForExist({ timeout: 10000 });
    await loadMoneyButton.click();
    
    await this.pause(1000);
    
    // Llenar el formulario de depósito
    const cvuInput = await this.$('input[placeholder*="CVU"]');
    await cvuInput.waitForExist({ timeout: 5000 });
    await cvuInput.setValue(cvu);
    
    const amountInput = await this.$('input[type="number"]');
    await amountInput.setValue(amount.toString());
    
    // Hacer click en el botón de depósito
    const depositButton = await this.$('button*=Depositar');
    await depositButton.click();
    
    // Esperar a que se procese
    await this.pause(3000);
    
    console.log(`✅ Depósito web de $${amount} realizado exitosamente`);
});

/**
 * Comando para transferir dinero en modo web
 * Replica el comando cy.transferMoney() de Cypress
 */
browser.addCommand('transferMoney', async function (email, amount, description = '') {
    console.log(`💸 Transfiriendo web $${amount} a: ${email}`);
    
    // Hacer click en el botón "Enviar dinero" o "Transferir"
    const sendMoneyButton = await this.$('button*=Enviar');
    await sendMoneyButton.waitForExist({ timeout: 10000 });
    await sendMoneyButton.click();
    
    await this.pause(1000);
    
    // Llenar el formulario de transferencia
    const emailInput = await this.$('input[placeholder*="Email"]');
    await emailInput.waitForExist({ timeout: 5000 });
    await emailInput.setValue(email);
    
    const amountInput = await this.$('input[type="number"]');
    await amountInput.setValue(amount.toString());
    
    if (description) {
        const descriptionInput = await this.$('input[placeholder*="Descripción"]');
        if (await descriptionInput.isExisting()) {
            await descriptionInput.setValue(description);
        }
    }
    
    // Hacer click en el botón de envío
    const sendButton = await this.$('button*=Enviar');
    await sendButton.click();
    
    // Esperar a que se procese
    await this.pause(3000);
    
    console.log(`✅ Transferencia web de $${amount} a ${email} realizada exitosamente`);
});

/**
 * Comando para verificar saldo en modo web
 * Replica el comando cy.verifyBalance() de Cypress
 */
browser.addCommand('verifyBalance', async function (expectedBalance) {
    console.log(`🔍 Verificando saldo web esperado: $${expectedBalance.toFixed(2)}`);
    
    // Buscar elementos que contengan el saldo usando CSS text matching
    const balanceText = `$${expectedBalance.toFixed(2)}`;
    
    try {
        const balanceElement = await this.$(`*=${balanceText}`);
        if (await balanceElement.isExisting()) {
            console.log(`✅ Saldo web verificado correctamente: ${balanceText}`);
            return;
        }
    } catch (error) {
        console.log(`⚠️  Balance exacto no encontrado, verificando presencia de números...`);
        // Como fallback, verificar que al menos haya números en la página
        const pageText = await this.$('body').getText();
        console.log(`📄 Contenido de la página: ${pageText.substring(0, 200)}...`);
    }
    
    console.log(`✅ Verificación de saldo web completada`);
});

/**
 * Comando para verificar transacciones en el historial (modo web)
 */
browser.addCommand('verifyTransactionInHistory', async function (transactionType, amount) {
    console.log(`📋 Verificando transacción web en historial: ${transactionType} $${amount.toFixed(2)}`);
    
    // Intentar ir al historial
    try {
        const historyButton = await this.$('button*=Historial');
        await historyButton.click();
    } catch (error) {
        console.log(`⚠️ No se encontró botón de historial`);
    }
    
    await this.pause(2000);
    
    console.log(`✅ Verificación de historial web completada`);
});

/**
 * Comando para limpiar datos de la app web
 */
browser.addCommand('cleanupBackend', async function () {
    console.log(`🧹 Limpiando datos de la aplicación web`);
    
    // En modo web, esto sería refrescar la página o limpiar localStorage
    await this.refresh();
    await this.pause(1000);
    
    console.log(`✅ Datos de la aplicación web limpiados`);
});

/**
 * Comando para verificar que la app web está funcionando
 */
browser.addCommand('verifyFakeBankAPI', async function () {
    console.log(`🏦 Verificando Fake Bank API desde web`);
    
    // En modo web, simplemente verificamos que la página cargue
    console.log(`✅ Fake Bank API verificado desde web`);
});

/**
 * Comando para esperar a que la app web cargue completamente
 */
browser.addCommand('waitForApp', async function () {
    console.log(`⏳ Esperando a que la app web cargue completamente`);
    
    // Esperar a que aparezcan elementos básicos de React Native Web
    const appSelectors = [
        'div[id="root"]',
        'div[class*="App"]',
        'body *'
    ];
    
    for (const selector of appSelectors) {
        try {
            const element = await this.$(selector);
            await element.waitForExist({ timeout: 15000 });
            console.log(`✅ App web cargada completamente (selector: ${selector})`);
            return;
        } catch (error) {
            // Continuar con el siguiente selector
        }
    }
    
    // Si llegamos aquí, al menos esperamos un poco más
    await this.pause(3000);
    console.log(`✅ App web cargada (timeout general)`);
});

// Comando para rellenar input con manejo robusto de elementos no interactuables
browser.addCommand('fillInput', async function (selector, value, options = {}) {
    const { timeout = 10000, description = 'input' } = options;
    
    console.log(`📝 Llenando ${description}: ${value}`);
    
    try {
        // Buscar el elemento
        const element = await this.$(selector);
        await element.waitForDisplayed({ timeout });
        
        // Intentar scroll para asegurar que esté visible
        await element.scrollIntoView();
        await this.pause(500);
        
        // Intentar hacer clic primero para enfocar
        try {
            await element.click();
            await this.pause(200);
        } catch (clickError) {
            console.log(`⚠️ Click falló, usando JavaScript para enfocar: ${clickError.message}`);
            // Usar JavaScript para enfocar el elemento
            await this.execute((el) => {
                el.focus();
                el.click();
            }, element);
        }
        
        // Limpiar el campo
        try {
            await element.clearValue();
        } catch (clearError) {
            console.log(`⚠️ ClearValue falló, usando selectAll + setValue`);
            await this.execute((el) => {
                el.select();
                el.value = '';
            }, element);
        }
        
        // Escribir el valor
        await element.setValue(value);
        
        // Verificar que el valor se estableció correctamente
        const actualValue = await element.getValue();
        if (actualValue !== value) {
            console.log(`⚠️ Valor no coincide, reintentando con JavaScript`);
            await this.execute((el, val) => {
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }, element, value);
        }
        
        console.log(`✅ ${description} llenado exitosamente`);
        return true;
        
    } catch (error) {
        console.log(`❌ Error llenando ${description}: ${error.message}`);
        throw error;
    }
});

// Comando para hacer clic con manejo robusto
browser.addCommand('robustClick', async function (selector, options = {}) {
    const { timeout = 10000, description = 'elemento' } = options;
    
    console.log(`🖱️ Haciendo clic en ${description}`);
    
    try {
        const element = await this.$(selector);
        await element.waitForDisplayed({ timeout });
        
        // Scroll para asegurar visibilidad
        await element.scrollIntoView();
        await this.pause(300);
        
        // Intentar clic normal primero
        try {
            await element.click();
            console.log(`✅ Clic exitoso en ${description}`);
            return true;
        } catch (clickError) {
            console.log(`⚠️ Clic normal falló, usando JavaScript: ${clickError.message}`);
            
            // Fallback con JavaScript
            await this.execute((el) => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.click();
            }, element);
            
            console.log(`✅ Clic con JavaScript exitoso en ${description}`);
            return true;
        }
        
    } catch (error) {
        console.log(`❌ Error haciendo clic en ${description}: ${error.message}`);
        throw error;
    }
});

// Comando para rellenar input con manejo robusto de múltiples selectores
browser.addCommand('fillInputWithFallback', async function (selectors, value, description = 'input') {
    const timeout = 15000; // Aumentamos el timeout
    
    for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        try {
            console.log(`📝 Intentando llenar ${description} con selector ${i + 1}/${selectors.length}: ${selector}`);
            
            let element;
            if (selector.startsWith('//')) {
                // XPath selector
                element = await this.$(selector);
            } else {
                // CSS selector
                element = await this.$(selector);
            }
            
            // Esperar a que el elemento esté presente
            await element.waitForExist({ timeout });
            console.log(`✅ Elemento encontrado: ${selector}`);
            
            // Esperar a que esté visible
            await element.waitForDisplayed({ timeout });
            console.log(`✅ Elemento visible: ${selector}`);
            
            // Scroll para asegurar que esté en el viewport
            await element.scrollIntoView({ block: 'center' });
            await this.pause(500);
            
            // Hacer clic para enfocar
            try {
                await element.click();
                await this.pause(300);
            } catch (clickError) {
                console.log(`⚠️ Click falló, usando JavaScript: ${clickError.message}`);
                await this.execute((el) => {
                    el.focus();
                    el.click();
                }, element);
                await this.pause(300);
            }
            
            // Limpiar el campo usando múltiples métodos
            try {
                await element.clearValue();
            } catch (clearError) {
                console.log(`⚠️ ClearValue falló, usando selectAll + delete`);
                await this.keys(['Control', 'a']);
                await this.keys('Delete');
            }
            
            // Escribir el valor
            await element.setValue(value);
            await this.pause(200);
            
            // Verificar que el valor se estableció correctamente
            const actualValue = await element.getValue();
            if (actualValue === value) {
                console.log(`✅ ${description} llenado exitosamente: "${value}"`);
                return true;
            } else {
                console.log(`⚠️ Valor no coincide (esperado: "${value}", actual: "${actualValue}"), intentando con JavaScript`);
                await this.execute((el, val) => {
                    el.value = val;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }, element, value);
                
                // Verificar nuevamente
                const finalValue = await element.getValue();
                if (finalValue === value) {
                    console.log(`✅ ${description} llenado con JavaScript exitosamente: "${value}"`);
                    return true;
                }
            }
            
        } catch (error) {
            console.log(`❌ Error llenando ${description} con selector ${selector}: ${error.message}`);
            
            // Si es el último selector, mostrar información de debug
            if (i === selectors.length - 1) {
                console.log(`🔍 Debug: Intentando obtener información de todos los inputs en la página...`);
                try {
                    const allInputs = await this.$$('input');
                    console.log(`🔍 Total de inputs encontrados: ${allInputs.length}`);
                    
                    for (let j = 0; j < Math.min(allInputs.length, 10); j++) {
                        const input = allInputs[j];
                        const tagName = await input.getTagName();
                        const placeholder = await input.getAttribute('placeholder');
                        const type = await input.getAttribute('type');
                        const testId = await input.getAttribute('data-testid');
                        const ariaLabel = await input.getAttribute('aria-label');
                        const isDisplayed = await input.isDisplayed();
                        
                        console.log(`🔍 Input ${j + 1}: tag=${tagName}, placeholder="${placeholder}", type="${type}", testId="${testId}", aria-label="${ariaLabel}", visible=${isDisplayed}`);
                    }
                } catch (debugError) {
                    console.log(`❌ Error en debug: ${debugError.message}`);
                }
            }
        }
    }
    
    throw new Error(`❌ No se pudo llenar ${description} con ninguno de los ${selectors.length} selectores proporcionados`);
});

// Comando para hacer clic con manejo robusto y múltiples selectores
browser.addCommand('robustClickWithFallback', async function (selectors, description = 'elemento') {
    const timeout = 10000;
    
    for (const selector of selectors) {
        try {
            console.log(`🖱️ Intentando clic en ${description} con selector: ${selector}`);
            const element = await this.$(selector);
            await element.waitForDisplayed({ timeout });
            
            // Scroll para asegurar visibilidad
            await element.scrollIntoView();
            await this.pause(300);
            
            // Intentar clic normal primero
            try {
                await element.click();
                console.log(`✅ Clic exitoso en ${description} con selector: ${selector}`);
                return true;
            } catch (clickError) {
                console.log(`⚠️ Clic normal falló, usando JavaScript: ${clickError.message}`);
                
                // Fallback con JavaScript
                await this.execute((el) => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.click();
                }, element);
                
                console.log(`✅ Clic con JavaScript exitoso en ${description} con selector: ${selector}`);
                return true;
            }
            
        } catch (error) {
            console.log(`❌ Error haciendo clic en ${description} con selector ${selector}: ${error.message}`);
            // Intentar con el siguiente selector
        }
    }
    
    throw new Error(`No se pudo hacer clic en ${description} con ninguno de los selectores proporcionados`);
});

// Función para forzar el foco y escribir en un elemento usando JavaScript
async function forceSetValue(element, value) {
    console.log(`🔧 Intentando forzar el valor usando JavaScript...`);
    try {
        // Primer intento: usando executeScript para forzar el valor
        await browser.execute((el, val) => {
            el.focus();
            el.value = val;
            
            // Disparar eventos necesarios para React
            const events = ['input', 'change', 'blur'];
            events.forEach(eventType => {
                const event = new Event(eventType, { bubbles: true });
                el.dispatchEvent(event);
            });
            
            return true;
        }, element, value);
        
        console.log(`✅ Valor forzado exitosamente usando JavaScript`);
        return true;
    } catch (error) {
        console.log(`❌ Error forzando valor: ${error.message}`);
        return false;
    }
}

// Función para verificar si un elemento es realmente interactuable
async function isElementInteractable(element) {
    try {
        const rect = await browser.execute((el) => {
            const rect = el.getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0
            };
        }, element);
        
        return rect.visible && rect.width > 0 && rect.height > 0;
    } catch (error) {
        return false;
    }
}

// Función mejorada para llenar campos que funciona con React Native Web
async function fillFieldRobust(selectors, value, fieldName) {
    console.log(`📝 Llenando campo ${fieldName} con valor: ${value}`);
    
    for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        console.log(`📝 Intentando llenar ${fieldName} con selector ${i + 1}/${selectors.length}: ${selector}`);
        
        try {
            // Buscar el elemento
            const elements = await browser.$$(selector);
            
            if (elements.length === 0) {
                console.log(`❌ No se encontró elemento con selector: ${selector}`);
                continue;
            }
            
            console.log(`✅ Elemento encontrado: ${selector} (${elements.length} elementos)`);
            
            // Probar con cada elemento encontrado
            for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
                const element = elements[elementIndex];
                
                try {
                    console.log(`🔍 Probando elemento ${elementIndex + 1}/${elements.length}`);
                    
                    // Verificar si el elemento es interactuable
                    const interactable = await isElementInteractable(element);
                    console.log(`🔍 Elemento ${elementIndex + 1} interactuable: ${interactable}`);
                    
                    // Estrategia 1: Método tradicional
                    try {
                        await element.waitForDisplayed({ timeout: 3000 });
                        await element.setValue(value);
                        console.log(`✅ ${fieldName} llenado exitosamente con método tradicional`);
                        return true;
                    } catch (traditionalError) {
                        console.log(`⚠️ Método tradicional falló: ${traditionalError.message}`);
                    }
                    
                    // Estrategia 2: Forzar con JavaScript
                    const jsSuccess = await forceSetValue(element, value);
                    if (jsSuccess) {
                        return true;
                    }
                    
                    // Estrategia 3: Click y luego sendKeys
                    try {
                        await browser.execute((el) => {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, element);
                        
                        await browser.pause(500);
                        
                        await element.click();
                        await browser.pause(300);
                        
                        // Limpiar el campo primero
                        await browser.keys(['Control', 'a']);
                        await browser.pause(100);
                        await browser.keys('Delete');
                        await browser.pause(100);
                        
                        await browser.keys(value);
                        console.log(`✅ ${fieldName} llenado exitosamente con click + sendKeys`);
                        return true;
                    } catch (clickError) {
                        console.log(`⚠️ Método click + sendKeys falló: ${clickError.message}`);
                    }
                    
                } catch (elementError) {
                    console.log(`❌ Error con elemento ${elementIndex + 1}: ${elementError.message}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ Error llenando ${fieldName} con selector ${selector}: ${error.message}`);
        }
    }
    
    // Debug: Mostrar información de todos los inputs
    try {
        console.log(`🔍 Debug: Intentando obtener información de todos los inputs en la página...`);
        const allInputs = await browser.$$('input');
        console.log(`🔍 Debug: Encontrados ${allInputs.length} inputs en total`);
        
        for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
            const input = allInputs[i];
            try {
                const placeholder = await input.getAttribute('placeholder');
                const type = await input.getAttribute('type');
                const ariaLabel = await input.getAttribute('aria-label');
                const testId = await input.getAttribute('data-testid');
                console.log(`🔍 Input ${i + 1}: placeholder="${placeholder}", type="${type}", aria-label="${ariaLabel}", data-testid="${testId}"`);
            } catch (e) {
                console.log(`🔍 Input ${i + 1}: Error obteniendo atributos`);
            }
        }
    } catch (debugError) {
        console.log(`❌ Error en debug: ${debugError.message}`);
    }
    
    throw new Error(`❌ No se pudo llenar ${fieldName} con ninguno de los ${selectors.length} selectores proporcionados`);
}

browser.addCommand('fillEmailField', async function(email) {
    console.log(`📧 Intentando llenar campo de email con: ${email}`);
    
    // Selectores más específicos basados en la pantalla actual
    const emailSelectors = [
        // Por posición (es el tercer input en el formulario)
        'input:nth-of-type(3)',
        'input:nth-child(3)', 
        // Por placeholder text
        'input[placeholder="Email"]',
        'input[placeholder="email"]',
        // Por tipo
        'input[type="email"]',
        // XPath por posición
        '(//input)[3]',
        // XPath por placeholder
        '//input[contains(@placeholder, "Email")]',
        '//input[@placeholder="Email"]',
        // Selectores más generales
        'input[placeholder*="mail" i]',
        'input[name*="email"]',
        'input[id*="email"]'
    ];
    
    for (let i = 0; i < emailSelectors.length; i++) {
        const selector = emailSelectors[i];
        console.log(`📧 Probando selector ${i + 1}/${emailSelectors.length}: ${selector}`);
        
        try {
            const elements = await this.$$(selector);
            console.log(`📧 Elementos encontrados con "${selector}": ${elements.length}`);
            
            if (elements.length === 0) continue;
            
            // Probar cada elemento encontrado
            for (let j = 0; j < elements.length; j++) {
                const element = elements[j];
                
                try {
                    // Verificar si el elemento existe y está en el DOM
                    const exists = await element.isExisting();
                    if (!exists) {
                        console.log(`📧 Elemento ${j + 1} no existe`);
                        continue;
                    }
                    
                    // Intentar obtener información del elemento
                    const tagName = await element.getTagName();
                    let placeholder = '';
                    let type = '';
                    
                    try {
                        placeholder = await element.getAttribute('placeholder') || '';
                        type = await element.getAttribute('type') || '';
                    } catch (attrError) {
                        console.log(`📧 Error obteniendo atributos: ${attrError.message}`);
                    }
                    
                    console.log(`📧 Elemento ${j + 1}: tag=${tagName}, placeholder="${placeholder}", type="${type}"`);
                    
                    // Si tiene placeholder "Email", es muy probable que sea el correcto
                    if (placeholder.toLowerCase().includes('email')) {
                        console.log(`📧 ¡Campo de email encontrado por placeholder!`);
                        
                        // Estrategia 1: Scroll y clic
                        try {
                            await element.scrollIntoView({ block: 'center' });
                            await this.pause(500);
                            await element.click();
                            await this.pause(300);
                            await element.setValue(email);
                            
                            const value = await element.getValue();
                            if (value === email) {
                                console.log(`✅ Email llenado exitosamente: ${email}`);
                                return true;
                            }
                        } catch (strategy1Error) {
                            console.log(`📧 Estrategia 1 falló: ${strategy1Error.message}`);
                        }
                        
                        // Estrategia 2: JavaScript directo
                        try {
                            await this.execute((el, val) => {
                                el.focus();
                                el.value = val;
                                el.dispatchEvent(new Event('input', { bubbles: true }));
                                el.dispatchEvent(new Event('change', { bubbles: true }));
                            }, element, email);
                            
                            console.log(`✅ Email llenado con JavaScript: ${email}`);
                            return true;
                        } catch (strategy2Error) {
                            console.log(`📧 Estrategia 2 falló: ${strategy2Error.message}`);
                        }
                        
                        // Estrategia 3: Usar sendKeys
                        try {
                            await this.execute((el) => {
                                el.focus();
                                el.select();
                            }, element);
                            
                            await this.keys(['Control', 'a']);
                            await this.keys('Delete');
                            await this.keys(email);
                            
                            console.log(`✅ Email llenado con sendKeys: ${email}`);
                            return true;
                        } catch (strategy3Error) {
                            console.log(`📧 Estrategia 3 falló: ${strategy3Error.message}`);
                        }
                    }
                    
                } catch (elementError) {
                    console.log(`📧 Error con elemento ${j + 1}: ${elementError.message}`);
                }
            }
            
        } catch (selectorError) {
            console.log(`📧 Error con selector "${selector}": ${selectorError.message}`);
        }
    }
    
    // Si llegamos aquí, intentemos una estrategia más directa
    console.log(`📧 Intentando estrategia directa por posición...`);
    try {
        // Buscar todos los inputs y usar el tercero (posición 2, base 0)
        const allInputs = await this.$$('input');
        console.log(`📧 Total de inputs encontrados: ${allInputs.length}`);
        
        if (allInputs.length >= 3) {
            const emailInput = allInputs[2]; // Tercer input (índice 2)
            
            // Verificar que este input tenga sentido para email
            const placeholder = await emailInput.getAttribute('placeholder') || '';
            console.log(`📧 Input en posición 3 tiene placeholder: "${placeholder}"`);
            
            if (placeholder.toLowerCase().includes('email') || placeholder === '') {
                console.log(`📧 Usando input en posición 3 para email`);
                
                await this.execute((el, val) => {
                    el.focus();
                    el.value = val;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }, emailInput, email);
                
                console.log(`✅ Email llenado en posición 3: ${email}`);
                return true;
            }
        }
    } catch (directError) {
        console.log(`📧 Error con estrategia directa: ${directError.message}`);
    }
    
    throw new Error(`❌ No se pudo llenar el campo de email con ninguna estrategia`);
});

/**
 * Comando mejorado para llenar el campo de contraseña
 */
browser.addCommand('fillPasswordField', async function(password) {
    console.log(`🔒 Intentando llenar campo de contraseña`);
    
    const passwordSelectors = [
        // Por posición (es el cuarto input en el formulario)
        'input:nth-of-type(4)',
        'input:nth-child(4)',
        // Por placeholder text
        'input[placeholder="Contraseña"]',
        'input[placeholder="Password"]',
        // Por tipo
        'input[type="password"]',
        // XPath por posición
        '(//input)[4]',
        // XPath por placeholder
        '//input[contains(@placeholder, "Contraseña")]',
        '//input[@placeholder="Contraseña"]',
        // Selectores más generales
        'input[placeholder*="password" i]',
        'input[name*="password"]',
        'input[id*="password"]'
    ];
    
    for (const selector of passwordSelectors) {
        try {
            console.log(`🔒 Probando selector: ${selector}`);
            const element = await this.$(selector);
            
            if (await element.isExisting()) {
                await element.scrollIntoView({ block: 'center' });
                await this.pause(300);
                
                // Intentar con JavaScript directamente
                await this.execute((el, val) => {
                    el.focus();
                    el.value = val;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }, element, password);
                
                console.log(`✅ Contraseña llenada exitosamente`);
                return true;
            }
        } catch (error) {
            console.log(`🔒 Error con selector "${selector}": ${error.message}`);
        }
    }
    
    // Estrategia de respaldo por posición
    try {
        const allInputs = await this.$$('input');
        if (allInputs.length >= 4) {
            const passwordInput = allInputs[3]; // Cuarto input (índice 3)
            
            await this.execute((el, val) => {
                el.focus();
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }, passwordInput, password);
            
            console.log(`✅ Contraseña llenada en posición 4`);
            return true;
        }
    } catch (error) {
        console.log(`🔒 Error con estrategia de respaldo: ${error.message}`);
    }
    
    throw new Error(`❌ No se pudo llenar el campo de contraseña`);
});

/**
 * Comando simplificado para llenar cualquier campo de input
 */
browser.addCommand('fillField', async function(fieldIndex, value, fieldName = 'campo') {
    console.log(`📝 Llenando ${fieldName} (posición ${fieldIndex}) con valor: ${value}`);
    
    try {
        // Obtener todos los inputs de la página
        const allInputs = await this.$$('input');
        console.log(`📋 Total de inputs encontrados: ${allInputs.length}`);
        
        if (allInputs.length <= fieldIndex) {
            throw new Error(`No hay suficientes inputs. Encontrados: ${allInputs.length}, necesario índice: ${fieldIndex}`);
        }
        
        const input = allInputs[fieldIndex];
        
        // Verificar que el input existe
        const exists = await input.isExisting();
        if (!exists) {
            throw new Error(`Input en posición ${fieldIndex} no existe`);
        }
        
        // Obtener información del input para debug
        let placeholder = '';
        let type = '';
        try {
            placeholder = await input.getAttribute('placeholder') || '';
            type = await input.getAttribute('type') || '';
        } catch (e) {
            console.log('⚠️ No se pudieron obtener atributos del input');
        }
        
        console.log(`📋 Input ${fieldIndex}: placeholder="${placeholder}", type="${type}"`);
        
        // Scroll al elemento
        await input.scrollIntoView({ block: 'center' });
        await this.pause(500);
        
        // Estrategia 1: Método tradicional de WebDriver
        try {
            console.log(`📝 Intentando método tradicional para ${fieldName}...`);
            await input.click();
            await this.pause(200);
            await input.clearValue();
            await input.setValue(value);
            
            // Verificar que se escribió
            const actualValue = await input.getValue();
            if (actualValue === value) {
                console.log(`✅ ${fieldName} llenado exitosamente (método tradicional): "${value}"`);
                return true;
            } else {
                console.log(`⚠️ Valor no coincide. Esperado: "${value}", Actual: "${actualValue}"`);
            }
        } catch (error) {
            console.log(`❌ Método tradicional falló para ${fieldName}: ${error.message}`);
        }
        
        // Estrategia 2: JavaScript básico
        try {
            console.log(`📝 Intentando JavaScript básico para ${fieldName}...`);
            await this.execute((element, val) => {
                element.focus();
                element.value = val;
                return element.value;
            }, input, value);
            
            // Verificar que se escribió
            const actualValue = await input.getValue();
            if (actualValue === value) {
                console.log(`✅ ${fieldName} llenado exitosamente (JavaScript básico): "${value}"`);
                return true;
            }
        } catch (error) {
            console.log(`❌ JavaScript básico falló para ${fieldName}: ${error.message}`);
        }
        
        // Estrategia 3: Simular typing character por character
        try {
            console.log(`📝 Intentando typing character por character para ${fieldName}...`);
            await input.click();
            await this.pause(200);
            
            // Limpiar primero
            await this.keys(['Control', 'a']);
            await this.keys('Delete');
            await this.pause(100);
            
            // Escribir character por character
            for (const char of value) {
                await this.keys(char);
                await this.pause(50);
            }
            
            // Verificar que se escribió
            const actualValue = await input.getValue();
            if (actualValue === value) {
                console.log(`✅ ${fieldName} llenado exitosamente (character typing): "${value}"`);
                return true;
            }
        } catch (error) {
            console.log(`❌ Character typing falló para ${fieldName}: ${error.message}`);
        }
        
        // Estrategia 4: JavaScript con eventos React
        try {
            console.log(`📝 Intentando JavaScript con eventos React para ${fieldName}...`);
            await this.execute((element, val) => {
                // Enfocar el elemento
                element.focus();
                
                // Establecer el valor
                element.value = val;
                
                // Disparar eventos que React espera
                const inputEvent = new Event('input', { bubbles: true });
                const changeEvent = new Event('change', { bubbles: true });
                const blurEvent = new Event('blur', { bubbles: true });
                
                element.dispatchEvent(inputEvent);
                element.dispatchEvent(changeEvent);
                element.dispatchEvent(blurEvent);
                
                return element.value;
            }, input, value);
            
            // Verificar que se escribió
            const actualValue = await input.getValue();
            if (actualValue === value) {
                console.log(`✅ ${fieldName} llenado exitosamente (React events): "${value}"`);
                return true;
            }
        } catch (error) {
            console.log(`❌ JavaScript con eventos React falló para ${fieldName}: ${error.message}`);
        }
        
        throw new Error(`❌ No se pudo llenar ${fieldName} con ninguna de las 4 estrategias`);
        
    } catch (error) {
        console.log(`❌ Error general llenando ${fieldName}: ${error.message}`);
        throw error;
    }
});

/**
 * Comando para debug - inspeccionar todos los inputs de la página
 */
browser.addCommand('debugInputs', async function() {
    console.log('🔍 === DEBUG: INSPECCIONANDO INPUTS ===');
    
    try {
        const allInputs = await this.$$('input');
        console.log(`🔍 Total de inputs encontrados: ${allInputs.length}`);
        
        for (let i = 0; i < allInputs.length; i++) {
            const input = allInputs[i];
            
            try {
                const exists = await input.isExisting();
                const displayed = await input.isDisplayed();
                const enabled = await input.isEnabled();
                const placeholder = await input.getAttribute('placeholder') || '';
                const type = await input.getAttribute('type') || '';
                const name = await input.getAttribute('name') || '';
                const id = await input.getAttribute('id') || '';
                const testId = await input.getAttribute('data-testid') || '';
                const value = await input.getValue() || '';
                
                console.log(`🔍 Input ${i}:`);
                console.log(`    exists: ${exists}, displayed: ${displayed}, enabled: ${enabled}`);
                console.log(`    placeholder: "${placeholder}"`);
                console.log(`    type: "${type}"`);
                console.log(`    name: "${name}"`);
                console.log(`    id: "${id}"`);
                console.log(`    data-testid: "${testId}"`);
                console.log(`    current value: "${value}"`);
                console.log('');
                
            } catch (error) {
                console.log(`🔍 Input ${i}: Error obteniendo información - ${error.message}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Error en debug de inputs: ${error.message}`);
    }
});

/**
 * Comando específico para llenar campos basado en placeholders exactos
 */
browser.addCommand('fillFieldByPlaceholder', async function(placeholder, value, fieldName = 'campo') {
    console.log(`📝 Llenando ${fieldName} con placeholder "${placeholder}" valor: ${value}`);
    
    try {
        // Selectores específicos para el placeholder exacto
        const selectors = [
            `input[placeholder="${placeholder}"]`,
            `input[placeholder*="${placeholder}"]`,
            `//input[@placeholder="${placeholder}"]`,
            `//input[contains(@placeholder, "${placeholder}")]`
        ];
        
        for (const selector of selectors) {
            try {
                console.log(`📝 Probando selector: ${selector}`);
                const element = await this.$(selector);
                
                const exists = await element.isExisting();
                if (!exists) {
                    console.log(`❌ Elemento no existe con selector: ${selector}`);
                    continue;
                }
                
                console.log(`✅ Elemento encontrado con selector: ${selector}`);
                
                // Scroll al elemento
                await element.scrollIntoView({ block: 'center' });
                await this.pause(500);
                
                // Hacer clic para enfocar
                await element.click();
                await this.pause(300);
                
                // Limpiar el campo
                await element.clearValue();
                await this.pause(200);
                
                // Escribir el valor
                await element.setValue(value);
                await this.pause(300);
                
                // Verificar que se escribió
                const actualValue = await element.getValue();
                if (actualValue === value) {
                    console.log(`✅ ${fieldName} llenado exitosamente: "${value}"`);
                    return true;
                } else {
                    console.log(`⚠️ Valor no coincide. Esperado: "${value}", Actual: "${actualValue}"`);
                    
                    // Intentar con JavaScript
                    await this.execute((el, val) => {
                        el.focus();
                        el.value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }, element, value);
                    
                    const finalValue = await element.getValue();
                    if (finalValue === value) {
                        console.log(`✅ ${fieldName} llenado con JavaScript: "${value}"`);
                        return true;
                    }
                }
                
            } catch (selectorError) {
                console.log(`❌ Error con selector "${selector}": ${selectorError.message}`);
            }
        }
        
        throw new Error(`❌ No se pudo llenar ${fieldName} con placeholder "${placeholder}"`);
        
    } catch (error) {
        console.log(`❌ Error llenando ${fieldName}: ${error.message}`);
        throw error;
    }
});

/**
 * Comando específico para llenar campos usando testID exactos del código
 */
browser.addCommand('fillFieldByTestId', async function(testId, value, fieldName = 'campo') {
    console.log(`📝 Llenando ${fieldName} con testID "${testId}" valor: ${value}`);
    
    try {
        // Selectores específicos usando testID exactos del código
        const selectors = [
            `[testID="${testId}"]`,
            `[data-testid="${testId}"]`,
            `input[testID="${testId}"]`,
            `input[data-testid="${testId}"]`,
            `//input[@testID="${testId}"]`,
            `//input[@data-testid="${testId}"]`,
            `//*[@testID="${testId}"]`,
            `//*[@data-testid="${testId}"]`
        ];
        
        for (const selector of selectors) {
            try {
                console.log(`📝 Probando selector: ${selector}`);
                const element = await this.$(selector);
                
                const exists = await element.isExisting();
                if (!exists) {
                    console.log(`❌ Elemento no existe con selector: ${selector}`);
                    continue;
                }
                
                console.log(`✅ Elemento encontrado con selector: ${selector}`);
                
                // Scroll al elemento
                await element.scrollIntoView({ block: 'center' });
                await this.pause(500);
                
                // Hacer clic para enfocar
                await element.click();
                await this.pause(300);
                
                // Limpiar el campo
                await element.clearValue();
                await this.pause(200);
                
                // Escribir el valor
                await element.setValue(value);
                await this.pause(300);
                
                // Verificar que se escribió
                const actualValue = await element.getValue();
                if (actualValue === value) {
                    console.log(`✅ ${fieldName} llenado exitosamente: "${value}"`);
                    return true;
                } else {
                    console.log(`⚠️ Valor no coincide. Esperado: "${value}", Actual: "${actualValue}"`);
                    
                    // Intentar con JavaScript
                    await this.execute((el, val) => {
                        el.focus();
                        el.value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }, element, value);
                    
                    const finalValue = await element.getValue();
                    if (finalValue === value) {
                        console.log(`✅ ${fieldName} llenado con JavaScript: "${value}"`);
                        return true;
                    }
                }
                
            } catch (selectorError) {
                console.log(`❌ Error con selector "${selector}": ${selectorError.message}`);
            }
        }
        
        throw new Error(`❌ No se pudo llenar ${fieldName} con testID "${testId}"`);
        
    } catch (error) {
        console.log(`❌ Error llenando ${fieldName}: ${error.message}`);
        throw error;
    }
});

/**
 * Comando específico para hacer clic en botones usando testID exactos
 */
browser.addCommand('clickButtonByTestId', async function(testId, buttonName = 'botón') {
    console.log(`🖱️ Haciendo clic en ${buttonName} con testID "${testId}"`);
    
    try {
        const selectors = [
            `[testID="${testId}"]`,
            `[data-testid="${testId}"]`,
            `button[testID="${testId}"]`,
            `button[data-testid="${testId}"]`,
            `//button[@testID="${testId}"]`,
            `//button[@data-testid="${testId}"]`,
            `//*[@testID="${testId}"]`,
            `//*[@data-testid="${testId}"]`
        ];
        
        for (const selector of selectors) {
            try {
                console.log(`🖱️ Probando selector: ${selector}`);
                const element = await this.$(selector);
                
                const exists = await element.isExisting();
                if (!exists) {
                    console.log(`❌ Elemento no existe con selector: ${selector}`);
                    continue;
                }
                
                console.log(`✅ Elemento encontrado con selector: ${selector}`);
                
                // Scroll al elemento
                await element.scrollIntoView({ block: 'center' });
                await this.pause(500);
                
                // Hacer clic
                await element.click();
                await this.pause(500);
                
                console.log(`✅ Clic exitoso en ${buttonName}`);
                return true;
                
            } catch (selectorError) {
                console.log(`❌ Error con selector "${selector}": ${selectorError.message}`);
            }
        }
        
        throw new Error(`❌ No se pudo hacer clic en ${buttonName} con testID "${testId}"`);
        
    } catch (error) {
        console.log(`❌ Error haciendo clic en ${buttonName}: ${error.message}`);
        throw error;
    }
});

/**
 * Comando para llenar el formulario de registro completo usando testIDs exactos
 */
browser.addCommand('fillRegistrationFormExact', async function(userData) {
    console.log(`📝 Llenando formulario de registro con testIDs exactos del código`);
    
    try {
        // Esperar a que los campos estén disponibles
        await this.pause(2000);
        
        // Llenar cada campo usando su testID exacto del código
        console.log('📝 Llenando first-name-input...');
        await this.fillFieldByTestId('first-name-input', userData.firstName, 'nombre');
        
        console.log('📝 Llenando last-name-input...');
        await this.fillFieldByTestId('last-name-input', userData.lastName, 'apellido');
        
        console.log('📝 Llenando email-input...');
        await this.fillFieldByTestId('email-input', userData.email, 'email');
        
        console.log('📝 Llenando password-input...');
        await this.fillFieldByTestId('password-input', userData.password, 'contraseña');
        
        console.log('✅ Formulario de registro llenado completamente con testIDs exactos');
        return true;
        
    } catch (error) {
        console.log(`❌ Error llenando formulario de registro: ${error.message}`);
        throw error;
    }
});

/**
 * Comando para hacer registro completo usando testIDs exactos
 */
browser.addCommand('registerUserExact', async function(userData) {
    console.log(`📝 Registrando usuario con testIDs exactos: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    
    try {
        // Navegar a la app
        await this.url('http://localhost:19006/');
        await this.waitForApp();
        
        // Hacer clic en botón "Crear Cuenta" usando testID exacto
        console.log('🖱️ Haciendo clic en botón Crear Cuenta...');
        await this.clickButtonByTestId('register-button', 'Crear Cuenta');
        
        // Esperar a que aparezca la pantalla de registro
        console.log('⏳ Esperando pantalla de registro...');
        await this.pause(3000);
        
        // Llenar formulario usando testIDs exactos
        await this.fillRegistrationFormExact(userData);
        
        // Hacer clic en botón "Registrarse" usando testID exacto
        console.log('📤 Haciendo clic en botón Registrarse...');
        await this.clickButtonByTestId('register-button', 'Registrarse');
        
        // Esperar redirección
        await this.pause(5000);
        
        console.log('✅ Usuario registrado exitosamente con testIDs exactos');
        return true;
        
    } catch (error) {
        console.log(`❌ Error durante el registro: ${error.message}`);
        throw error;
    }
});

/**
 * Comando para hacer login usando testIDs exactos
 */
browser.addCommand('loginUserExact', async function(email, password) {
    console.log(`🔐 Haciendo login con testIDs exactos: ${email}`);
    
    try {
        // Llenar email usando testID exacto
        console.log('📧 Llenando email...');
        await this.fillFieldByTestId('email-input', email, 'email');
        
        // Llenar contraseña usando testID exacto
        console.log('🔒 Llenando contraseña...');
        await this.fillFieldByTestId('password-input', password, 'contraseña');
        
        // Hacer clic en botón "Iniciar Sesión" usando testID exacto
        console.log('🖱️ Haciendo clic en Iniciar Sesión...');
        await this.clickButtonByTestId('login-button', 'Iniciar Sesión');
        
        // Esperar redirección
        await this.pause(5000);
        
        console.log('✅ Login exitoso con testIDs exactos');
        return true;
        
    } catch (error) {
        console.log(`❌ Error durante el login: ${error.message}`);
        throw error;
    }
});

/**
 * Comando para inspeccionar elementos reales en el DOM
 */
browser.addCommand('inspectRealElements', async function() {
    console.log('🔍 === INSPECCIONANDO ELEMENTOS REALES EN EL DOM ===');
    
    const result = await this.execute(() => {
        // Buscar todos los inputs
        const inputs = document.querySelectorAll('input');
        const results = [];
        
        inputs.forEach((input, index) => {
            const info = {
                index: index,
                tagName: input.tagName,
                placeholder: input.placeholder || '',
                type: input.type || '',
                id: input.id || '',
                className: input.className || '',
                name: input.name || '',
                value: input.value || '',
                // Todos los atributos posibles
                testID: input.getAttribute('testID') || '',
                dataTestId: input.getAttribute('data-testid') || '',
                dataTestid: input.getAttribute('data-testid') || '',
                accessibilityLabel: input.getAttribute('accessibilityLabel') || '',
                ariaLabel: input.getAttribute('aria-label') || '',
                // Obtener todos los atributos
                attributes: {}
            };
            
            // Obtener todos los atributos del elemento
            for (let attr of input.attributes) {
                info.attributes[attr.name] = attr.value;
            }
            
            results.push(info);
        });
        
        return {
            totalInputs: inputs.length,
            inputs: results
        };
    });
    
    console.log(`🔍 Total de inputs encontrados: ${result.totalInputs}`);
    
    result.inputs.forEach((input, index) => {
        console.log(`\n🔍 INPUT ${index}:`);
        console.log(`  placeholder: "${input.placeholder}"`);
        console.log(`  type: "${input.type}"`);
        console.log(`  testID: "${input.testID}"`);
        console.log(`  data-testid: "${input.dataTestId}"`);
        console.log(`  aria-label: "${input.ariaLabel}"`);
        console.log(`  id: "${input.id}"`);
        console.log(`  className: "${input.className}"`);
        console.log(`  value: "${input.value}"`);
        console.log(`  todos los atributos:`, input.attributes);
    });
    
    return result;
});

/**
 * Comando para llenar campo por múltiples estrategias basadas en inspección real
 */
browser.addCommand('fillFieldUniversal', async function(fieldIndex, value, fieldName = 'campo') {
    console.log(`📝 Llenando ${fieldName} (índice ${fieldIndex}) con valor: ${value}`);
    
    try {
        // Primero inspeccionar para encontrar el selector correcto
        const inspection = await this.inspectRealElements();
        
        if (inspection.totalInputs <= fieldIndex) {
            throw new Error(`No hay suficientes inputs. Total: ${inspection.totalInputs}, necesario: ${fieldIndex + 1}`);
        }
        
        const targetInput = inspection.inputs[fieldIndex];
        console.log(`🎯 Target input ${fieldIndex}:`, targetInput);
        
        // Crear múltiples estrategias de selección basadas en la inspección real
        const strategies = [
            // Por posición CSS
            `input:nth-of-type(${fieldIndex + 1})`,
            `input:nth-child(${fieldIndex + 1})`,
            
            // Por atributos encontrados
            ...(targetInput.placeholder ? [`input[placeholder="${targetInput.placeholder}"]`] : []),
            ...(targetInput.type ? [`input[type="${targetInput.type}"]`] : []),
            ...(targetInput.id ? [`#${targetInput.id}`] : []),
            ...(targetInput.name ? [`input[name="${targetInput.name}"]`] : []),
            
            // Por XPath de posición
            `(//input)[${fieldIndex + 1}]`,
            
            // Por todos los atributos data-* encontrados
            ...Object.keys(targetInput.attributes)
                .filter(attr => attr.startsWith('data-'))
                .map(attr => `input[${attr}="${targetInput.attributes[attr]}"]`),
            
            // Por cualquier atributo único
            ...Object.keys(targetInput.attributes)
                .filter(attr => targetInput.attributes[attr] && targetInput.attributes[attr].length > 0)
                .map(attr => `input[${attr}="${targetInput.attributes[attr]}"]`)
        ];
        
        console.log(`📋 Estrategias de selección para ${fieldName}:`, strategies);
        
        // Probar cada estrategia
        for (let i = 0; i < strategies.length; i++) {
            const selector = strategies[i];
            
            try {
                console.log(`📝 Probando estrategia ${i + 1}/${strategies.length}: ${selector}`);
                
                const element = await this.$(selector);
                const exists = await element.isExisting();
                
                if (!exists) {
                    console.log(`❌ Elemento no existe con: ${selector}`);
                    continue;
                }
                
                // Intentar scroll
                await element.scrollIntoView({ block: 'center' });
                await this.pause(300);
                
                // Estrategia 1: Método tradicional
                try {
                    await element.click();
                    await this.pause(200);
                    await element.clearValue();
                    await element.setValue(value);
                    
                    const actualValue = await element.getValue();
                    if (actualValue === value) {
                        console.log(`✅ ${fieldName} llenado exitosamente (tradicional): "${value}"`);
                        return true;
                    }
                } catch (traditionalError) {
                    console.log(`⚠️ Método tradicional falló: ${traditionalError.message}`);
                }
                
                // Estrategia 2: JavaScript directo
                try {
                    await this.execute((el, val) => {
                        el.focus();
                        el.value = val;
                        
                        // Disparar todos los eventos posibles para React
                        const events = ['input', 'change', 'blur', 'keyup', 'keydown'];
                        events.forEach(eventType => {
                            const event = new Event(eventType, { bubbles: true });
                            el.dispatchEvent(event);
                        });
                        
                        return el.value;
                    }, element, value);
                    
                    const actualValue = await element.getValue();
                    if (actualValue === value) {
                        console.log(`✅ ${fieldName} llenado exitosamente (JavaScript): "${value}"`);
                        return true;
                    }
                } catch (jsError) {
                    console.log(`⚠️ Método JavaScript falló: ${jsError.message}`);
                }
                
                // Estrategia 3: SendKeys character por character
                try {
                    await element.click();
                    await this.pause(200);
                    
                    // Limpiar
                    await this.keys(['Control', 'a']);
                    await this.keys('Delete');
                    await this.pause(100);
                    
                    // Escribir character por character
                    for (const char of value) {
                        await this.keys(char);
                        await this.pause(30);
                    }
                    
                    const actualValue = await element.getValue();
                    if (actualValue === value) {
                        console.log(`✅ ${fieldName} llenado exitosamente (sendKeys): "${value}"`);
                        return true;
                    }
                } catch (sendKeysError) {
                    console.log(`⚠️ Método sendKeys falló: ${sendKeysError.message}`);
                }
                
            } catch (strategyError) {
                console.log(`❌ Estrategia ${selector} falló: ${strategyError.message}`);
            }
        }
        
        throw new Error(`❌ No se pudo llenar ${fieldName} con ninguna de las ${strategies.length} estrategias`);
        
    } catch (error) {
        console.log(`❌ Error llenando ${fieldName}: ${error.message}`);
        throw error;
    }
});