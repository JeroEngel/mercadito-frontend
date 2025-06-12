# Tests E2E con Cypress - Mercadito Wallet

Este documento explica cómo ejecutar los tests end-to-end implementados con Cypress para el flujo completo de la aplicación Mercadito Wallet.

## Configuración Previa

Antes de ejecutar los tests, asegúrate de que los siguientes servicios estén ejecutándose:

### 1. Fake Bank API
```bash
cd wallet-api/fakebank-api
npm start
# Debe estar corriendo en http://localhost:3000
```

### 2. Backend API (Wallet)
```bash
cd wallet-api
./gradlew bootRun
# Debe estar corriendo en http://localhost:8080
```

### 3. Frontend (Expo Web)
```bash
cd mercadito-front
npm run web
# Debe estar corriendo en http://localhost:19006
```

## Ejecutar Tests

### Tests Interactivos (Interfaz Gráfica)
```bash
npm run cypress:open
```

### Tests en Modo Headless (Terminal)
```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar solo el flujo completo de wallet
npm run test:wallet-flow

# Ejecutar solo tests de integración con Fake Bank
npm run test:bank-integration

# Ejecutar con cabecera visible (para debugging)
npm run test:e2e:headed
```

## Flujos de Test Implementados

### 1. Flujo Completo de Wallet (`wallet-complete-flow.cy.js`)
Este test implementa el flujo completo que solicitaste:

1. **Registro de Usuario 1**: Crea cuenta con datos de prueba
2. **Registro de Usuario 2**: Crea segunda cuenta para transferencia
3. **Login**: Inicia sesión con Usuario 1
4. **Verificación de Saldo Inicial**: Confirma saldo en $0.00
5. **Carga de Dinero**: Deposita $1000 desde cuenta bancaria (CVU: 0000003100010000000001)
6. **Verificación de Saldo**: Confirma que el saldo es $1000.00
7. **Transferencia**: Envía $500 al Usuario 2
8. **Verificación de Saldo Post-Transferencia**: Confirma saldo de $500.00
9. **Login Usuario 2**: Verifica que recibió los $500.00
10. **Verificación de Historial**: Confirma transacciones en ambos usuarios

### 2. Tests de Validación
- Validación de campos obligatorios en registro
- Validación de credenciales incorrectas en login
- Validación de CVU (debe ser exactamente 22 dígitos)
- Validación de montos (deben ser mayor a 0)
- Validación de saldo insuficiente para transferencias

### 3. Integración con Fake Bank (`fake-bank-integration.cy.js`)
- Verificación de conectividad con Fake Bank API
- Validación de cuentas bancarias existentes
- Tests directos de depósito/retiro con el API
- Verificación de balances en tiempo real

## Datos de Prueba

Los tests utilizan estos datos predefinidos:

### Usuarios de Prueba
- **Usuario 1**: juan.perez.test@example.com / password123
- **Usuario 2**: maria.garcia.test@example.com / password456

### Cuentas Bancarias (Fake Bank)
- **CVU 1**: 0000003100010000000001 (Juan Pérez - $15,000.50)
- **CVU 2**: 0000003100010000000002 (María García - $25,000.00)

### Montos de Prueba
- **Depósito**: $1,000
- **Transferencia**: $500

## Comandos Personalizados de Cypress

Los tests utilizan comandos personalizados para mayor legibilidad:

- `cy.registerUser(userData)` - Registra un nuevo usuario
- `cy.loginUser(email, password)` - Hace login
- `cy.depositMoney(cvu, amount)` - Carga dinero desde banco
- `cy.transferMoney(email, amount, description)` - Transfiere dinero
- `cy.verifyBalance(amount)` - Verifica el saldo actual
- `cy.verifyTransactionInHistory(type, amount)` - Verifica transacciones
- `cy.verifyFakeBankAPI()` - Verifica conectividad con Fake Bank

## Troubleshooting

### Tests Fallan por Timeout
- Verifica que todos los servicios estén corriendo
- Aumenta los timeouts en `cypress.config.js` si es necesario

### Error de Conectividad
- Confirma que el Frontend esté en http://localhost:19006
- Confirma que el Backend esté en http://localhost:8080
- Confirma que el Fake Bank esté en http://localhost:3000

### Elementos No Encontrados
- Los tests dependen de los `data-testid` en los componentes React
- Verifica que los elementos tengan los atributos correctos

### Datos Conflictivos
- Los tests limpian localStorage automáticamente
- Si hay problemas, reinicia los servicios backend

## Configuración Avanzada

### Variables de Entorno (cypress.config.js)
```javascript
env: {
  BACKEND_API_URL: 'http://localhost:8080/api',
  FAKE_BANK_API_URL: 'http://localhost:3000'
}
```

### Configuración de Viewport
- **Ancho**: 1280px
- **Alto**: 720px
- Simula un navegador de escritorio

## Próximos Pasos

1. **Integración con CI/CD**: Los tests están listos para integrarse con GitHub Actions o similar
2. **Tests de Performance**: Añadir mediciones de tiempo de respuesta
3. **Tests de Seguridad**: Validar autenticación y autorización
4. **Tests Cross-Browser**: Ejecutar en diferentes navegadores