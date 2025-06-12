# Tests de Appium para Mercadito Wallet

Este proyecto incluye tests de Appium que replican exactamente el mismo flujo que los tests de Cypress, pero para la aplicación móvil nativa de React Native.

## 📱 Estructura de Appium

```
appium/
├── config/
│   └── testData.json       # Datos de prueba (idénticos a Cypress)
├── helpers/
│   └── commands.js         # Comandos personalizados de Appium
└── tests/
    └── wallet-complete-flow.spec.js  # Test principal del flujo completo
```

## 🚀 Configuración Inicial

### 1. Instalar Appium Server
```bash
npm install -g appium
```

### 2. Instalar Drivers
```bash
# Para iOS
appium driver install xcuitest

# Para Android
appium driver install uiautomator2
```

### 3. Configurar Simuladores/Emuladores

#### iOS (Simulador)
- Abrir Xcode
- Ir a Window > Devices and Simulators
- Crear un simulador iPhone 15 con iOS 17.0

#### Android (Emulador)
- Abrir Android Studio
- Crear un AVD con API level 30+

## 🧪 Tests Disponibles

### Test Principal: Flujo Completo
El test principal replica exactamente el mismo flujo que está en Cypress:

1. **Registro de Usuarios**: Registra dos usuarios de prueba
2. **Login**: Hace login con el primer usuario
3. **Verificación de Saldo Inicial**: Confirma saldo en $0.00
4. **Carga de Dinero**: Deposita $100 desde cuenta bancaria
5. **Verificación de Saldo**: Confirma saldo de $100.00
6. **Transferencia**: Envía $50 al segundo usuario
7. **Verificación Final**: Confirma que el primer usuario tiene $50 y el segundo usuario recibió $50

### Test de Validaciones
- Valida CVU inválido (muy corto)
- Valida monto inválido (cero o negativo)

## 🏃‍♂️ Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar todos los tests de Appium
npm run appium:test

# Ejecutar solo el flujo completo
npm run appium:wallet-flow

# Ejecutar tests móviles (alias)
npm run test:mobile

# Ejecutar específicamente para iOS
npm run test:mobile:ios
```

### Ejecución Manual

```bash
# 1. Iniciar Appium Server (en terminal separado)
appium

# 2. Ejecutar tests
npx wdio wdio.conf.js
```

## ⚙️ Configuración

### iOS (wdio.conf.js)
```javascript
capabilities: [{
    platformName: 'iOS',
    'appium:deviceName': 'iPhone 15',
    'appium:platformVersion': '17.0',
    'appium:app': path.resolve('./ios/build/Build/Products/Debug-iphonesimulator/MercaditoWallet.app'),
    'appium:automationName': 'XCUITest'
}]
```

### Android (wdio.android.conf.js)
```javascript
capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'Pixel_7_API_30',
    'appium:platformVersion': '11.0',
    'appium:app': path.resolve('./android/app/build/outputs/apk/debug/app-debug.apk'),
    'appium:automationName': 'UiAutomator2'
}]
```

## 🎯 Datos de Prueba

Los tests utilizan exactamente los mismos datos que Cypress:

- **Usuario 1**: juan.perez.test@example.com / password123
- **Usuario 2**: maria.garcia.test@example.com / password456
- **CVU Válido**: 0000003100010000000001
- **Monto de Depósito**: $100
- **Monto de Transferencia**: $50

## 🔧 Comandos Personalizados

Los tests incluyen comandos personalizados que replican exactamente la funcionalidad de Cypress:

- `browser.registerUser(userData)` - Registra un usuario
- `browser.loginUser(email, password)` - Hace login
- `browser.depositMoney(cvu, amount)` - Carga dinero
- `browser.transferMoney(email, amount, description)` - Transfiere dinero
- `browser.verifyBalance(amount)` - Verifica saldo
- `browser.verifyTransactionInHistory(type, amount)` - Verifica historial
- `browser.cleanupBackend()` - Limpia datos de la app
- `browser.waitForApp()` - Espera que la app cargue

## 🚨 Requisitos Previos

### Para iOS
1. **Xcode** instalado
2. **iOS Simulator** funcionando
3. **App compilada** en `./ios/build/Build/Products/Debug-iphonesimulator/`

### Para Android
1. **Android Studio** instalado
2. **SDK Tools** configurados
3. **Emulador Android** funcionando
4. **APK compilado** en `./android/app/build/outputs/apk/debug/`

### Variables de Entorno
```bash
# Para Android
export ANDROID_HOME=/path/to/android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools

# Para iOS (automático con Xcode)
```

## 📊 Comparación con Cypress

| Aspecto | Cypress | Appium |
|---------|---------|---------|
| **Plataforma** | Web (React Native Web) | Móvil Nativo (iOS/Android) |
| **Datos** | ✅ Idénticos | ✅ Idénticos |
| **Flujo** | ✅ Completo | ✅ Completo |
| **Comandos** | Personalizados | ✅ Replicados |
| **Validaciones** | ✅ CVU/Monto | ✅ CVU/Monto |

## 🐛 Troubleshooting

### Error: App no encontrada
```bash
# Compilar app iOS
cd ios && xcodebuild -workspace MercaditoWallet.xcworkspace -scheme MercaditoWallet -configuration Debug -sdk iphonesimulator

# Compilar app Android
cd android && ./gradlew assembleDebug
```

### Error: Appium Server no responde
```bash
# Verificar que Appium esté corriendo
appium --version
appium --check-update

# Reiniciar Appium
pkill -f appium
appium
```

### Error: Simulador no disponible
```bash
# Listar simuladores iOS disponibles
xcrun simctl list devices

# Listar emuladores Android disponibles
emulator -list-avds
```

## 📝 Notas Importantes

1. **Misma Lógica**: Los tests de Appium replican exactamente la misma lógica que Cypress
2. **Datos Idénticos**: Utilizan exactamente los mismos datos de prueba
3. **Flujo Completo**: Cubren el mismo flujo end-to-end
4. **Selectores Nativos**: Utilizan accessibility identifiers para elementos móviles
5. **Timeouts Móviles**: Configurados para la velocidad de dispositivos móviles

## 🎉 Resultado Esperado

Al ejecutar los tests exitosamente, deberías ver:

```
🚀 Iniciando tests de Appium para Mercadito Wallet
📱 Iniciando suite: Flujo completo de Wallet
🧪 Ejecutando test: Debe completar el flujo completo
📝 Registrando usuario: Juan Pérez (juan.perez.test@example.com)
✅ Usuario juan.perez.test@example.com registrado exitosamente
📝 Registrando usuario: María García (maria.garcia.test@example.com)
✅ Usuario maria.garcia.test@example.com registrado exitosamente
🔐 Haciendo login con: juan.perez.test@example.com
✅ Login exitoso para juan.perez.test@example.com
🔍 Verificando saldo esperado: $0.00
✅ Saldo verificado correctamente: $0.00
💰 Cargando $100 desde CVU: 0000003100010000000001
✅ Depósito de $100 realizado exitosamente
🔍 Verificando saldo esperado: $100.00
✅ Saldo verificado correctamente: $100.00
💸 Transfiriendo $50 a: maria.garcia.test@example.com
✅ Transferencia de $50 a maria.garcia.test@example.com realizada exitosamente
🔍 Verificando saldo esperado: $50.00
✅ Saldo verificado correctamente: $50.00
🔐 Haciendo login con: maria.garcia.test@example.com
✅ Login exitoso para maria.garcia.test@example.com
🔍 Verificando saldo esperado: $50.00
✅ Saldo verificado correctamente: $50.00
✅ FLUJO COMPLETO EXITOSO
✅ Test exitoso: Debe completar el flujo completo
📋 Suite completada: Flujo completo de Wallet
🎯 Todos los tests de Appium completados
```