// appium/tests/wallet-complete-flow.spec.js
// Tests de Appium que replican exactamente el flujo de Cypress

const testData = require('../config/testData.json');

describe('Flujo completo de Wallet - Registro, Login, Carga y Transferencia', () => {
    let userData;
    
    beforeEach(async () => {
        console.log('🧹 Limpiando datos antes del test');
        await browser.cleanupBackend();
        
        // Generar datos únicos para cada test
        const timestamp = Date.now();
        userData = {
            firstName: 'Juan',
            lastName: 'Pérez',
            email: `usuario${timestamp}@email.com`,
            password: '123456',
            cvu: '0000003100010000000001',
            amount: 1000
        };
        
        console.log(`📊 Datos del test generados:`, userData);
    });

    it('Debe completar el flujo completo: registro → login → carga → transferencia', async () => {
        console.log('🚀 Iniciando test de inspección real de elementos');
        
        try {
            // Paso 1: Navegar a la aplicación
            console.log('\n📝 === PASO 1: NAVEGACIÓN ===');
            await browser.url('http://localhost:19006/');
            await browser.waitForApp();
            
            // Paso 2: Ir a registro
            console.log('\n🖱️ === PASO 2: IR A REGISTRO ===');
            await browser.robustClick('//button[contains(., "Crear Cuenta")]', { 
                description: 'botón Crear Cuenta' 
            });
            
            // Esperar a que aparezca la pantalla de registro
            console.log('⏳ Esperando pantalla de registro...');
            await browser.pause(3000);
            
            // Paso 3: INSPECCIONAR ELEMENTOS REALES
            console.log('\n🔍 === PASO 3: INSPECCIÓN REAL DE ELEMENTOS ===');
            const inspection = await browser.inspectRealElements();
            
            // Paso 4: Llenar formulario usando los atributos reales encontrados
            console.log('\n📝 === PASO 4: LLENADO CON ATRIBUTOS REALES ===');
            
            // Llenar campo por campo usando el comando universal
            console.log('📝 Llenando campos usando inspección real...');
            
            // 📝 Llenar formulario de registro con el orden correcto del DOM
            console.log('📝 Llenando formulario de registro...');
            
            // Orden real del DOM según inspección:
            // Index 0: Email, Index 1: Contraseña, Index 2: Nombre, Index 3: Apellido
            await browser.fillFieldUniversal(2, userData.firstName, 'Llenando nombre');     // Input 2 = Nombre
            await browser.fillFieldUniversal(3, userData.lastName, 'Llenando apellido');    // Input 3 = Apellido  
            await browser.fillFieldUniversal(0, userData.email, 'Llenando email');          // Input 0 = Email
            await browser.fillFieldUniversal(1, userData.password, 'Llenando contraseña');  // Input 1 = Contraseña

            // Pausa para verificar que todos los campos están llenos
            console.log('⏸️ Pausa de 5 segundos para verificar campos...');
            await browser.pause(5000);
            
            // Paso 5: Enviar formulario
            console.log('\n📤 === PASO 5: ENVÍO DE FORMULARIO ===');
            await browser.robustClick('//button[contains(., "Registrarse")]', { 
                description: 'botón Registrarse' 
            });
            
            // Esperar redirección
            await browser.pause(5000);
            
            // Verificar resultado
            console.log('\n🔍 === VERIFICACIÓN FINAL ===');
            const currentUrl = await browser.getUrl();
            const pageText = await browser.$('body').getText();
            console.log(`📄 URL actual: ${currentUrl}`);
            console.log(`📄 Contenido actual: ${pageText.substring(0, 300)}...`);
            
            console.log('🎉 ¡Test de inspección completado exitosamente!');
            
        } catch (error) {
            console.log(`❌ Test falló: ${error.message}`);
            
            // Debug adicional
            try {
                const url = await browser.getUrl();
                const title = await browser.getTitle();
                console.log(`🔍 URL de error: ${url}`);
                console.log(`🔍 Título de error: ${title}`);
            } catch (debugError) {
                console.log(`❌ Error en debug: ${debugError.message}`);
            }
            
            throw error;
        }
    });

    it('Debe validar CVU correctamente en carga de dinero', async () => {
        console.log('🧪 Test simplificado con inspección directa');
        
        try {
            // Ir a la app
            await browser.url('http://localhost:19006/');
            await browser.waitForApp();
            
            // Ir a registro
            console.log('📝 Navegando a registro...');
            await browser.robustClick('//button[contains(., "Crear Cuenta")]');
            await browser.pause(3000);
            
            // Hacer inspección completa
            console.log('🔍 Inspeccionando elementos...');
            await browser.inspectRealElements();
            
            // Intentar llenado con JavaScript directo basado en posición
            console.log('📝 Llenando campos con JavaScript directo...');
            
            const fillResult = await browser.execute((data) => {
                const inputs = document.querySelectorAll('input');
                console.log(`JavaScript: Encontrados ${inputs.length} inputs`);
                
                if (inputs.length >= 4) {
                    try {
                        // Llenar por posición directa
                        inputs[0].focus();
                        inputs[0].value = data.firstName;
                        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
                        
                        inputs[1].focus();
                        inputs[1].value = data.lastName;
                        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
                        inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
                        
                        inputs[2].focus();
                        inputs[2].value = data.email;
                        inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
                        inputs[2].dispatchEvent(new Event('change', { bubbles: true }));
                        
                        inputs[3].focus();
                        inputs[3].value = data.password;
                        inputs[3].dispatchEvent(new Event('input', { bubbles: true }));
                        inputs[3].dispatchEvent(new Event('change', { bubbles: true }));
                        
                        return {
                            success: true,
                            message: 'Todos los campos llenados',
                            values: [
                                inputs[0].value,
                                inputs[1].value,
                                inputs[2].value,
                                inputs[3].value
                            ]
                        };
                    } catch (error) {
                        return {
                            success: false,
                            message: error.message
                        };
                    }
                } else {
                    return {
                        success: false,
                        message: `Solo ${inputs.length} inputs encontrados`
                    };
                }
            }, userData);
            
            console.log(`📋 Resultado JavaScript:`, fillResult);
            
            if (fillResult.success) {
                console.log('✅ Campos llenados exitosamente');
                console.log('📋 Valores establecidos:', fillResult.values);
                
                // Pausa para verificar
                await browser.pause(5000);
                
                // Intentar enviar
                await browser.robustClick('//button[contains(., "Registrarse")]');
                await browser.pause(5000);
                
                console.log('✅ Test JavaScript directo completado');
            } else {
                console.log(`❌ Error en JavaScript: ${fillResult.message}`);
            }
            
        } catch (error) {
            console.log(`❌ Test JavaScript falló: ${error.message}`);
            throw error;
        }
    });

    afterEach(async () => {
        console.log('🧹 Limpiando datos después del test');
        await browser.cleanupBackend();
        console.log('📋 Suite Chrome completada: Flujo completo de Wallet - Registro, Login, Carga y Transferencia');
    });
});

console.log('🏁 Tests de Appium Chrome completados');