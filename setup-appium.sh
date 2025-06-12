#!/bin/bash

# 🚀 Script de Setup Automático para Tests de Appium - Mercadito Wallet
# Este script configura todo lo necesario para ejecutar tests de Appium

echo "🚀 Configurando Tests de Appium para Mercadito Wallet..."

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar que Appium esté instalado
if ! command -v appium &> /dev/null; then
    echo "📦 Instalando Appium globalmente..."
    sudo npm install -g appium
fi

echo "✅ Appium versión: $(appium --version)"

# Instalar drivers de Appium en modo legacy para evitar conflictos
echo "📱 Instalando drivers de Appium..."

# Crear directorio temporal para drivers
TEMP_DIR="/tmp/appium-setup-$$"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Inicializar package.json temporal
npm init -y > /dev/null

# Instalar drivers con legacy peer deps
echo "🤖 Instalando driver UiAutomator2 para Android..."
npm install appium-uiautomator2-driver --legacy-peer-deps > /dev/null 2>&1

echo "📱 Instalando driver XCUITest para iOS..."
npm install appium-xcuitest-driver --legacy-peer-deps > /dev/null 2>&1

# Copiar drivers instalados al directorio global de Appium
APPIUM_HOME=$(npm list -g appium --parseable | head -1)
if [ -d "$APPIUM_HOME" ]; then
    echo "📋 Configurando drivers en Appium..."
    
    # Crear directorio de drivers si no existe
    mkdir -p "$APPIUM_HOME/node_modules/appium/drivers"
    
    # Copiar drivers
    if [ -d "node_modules/appium-uiautomator2-driver" ]; then
        cp -r node_modules/appium-uiautomator2-driver "$APPIUM_HOME/node_modules/"
        echo "✅ Driver UiAutomator2 configurado"
    fi
    
    if [ -d "node_modules/appium-xcuitest-driver" ]; then
        cp -r node_modules/appium-xcuitest-driver "$APPIUM_HOME/node_modules/"
        echo "✅ Driver XCUITest configurado"
    fi
fi

# Limpiar directorio temporal
cd - > /dev/null
rm -rf "$TEMP_DIR"

# Regresar al directorio del proyecto
cd "$(dirname "$0")"

echo ""
echo "🔧 Verificando configuración del proyecto..."

# Verificar que las dependencias de WebDriverIO estén instaladas
if [ ! -d "node_modules/@wdio/cli" ]; then
    echo "📦 Instalando dependencias de WebDriverIO..."
    npm install --legacy-peer-deps > /dev/null
fi

echo "✅ Dependencias de WebDriverIO configuradas"

echo ""
echo "📱 Verificando configuración de dispositivos..."

# Verificar simuladores iOS disponibles
if command -v xcrun &> /dev/null; then
    echo "🍎 Simuladores iOS disponibles:"
    xcrun simctl list devices | grep -E "iPhone|iPad" | grep "Booted\|Shutdown" | head -3
else
    echo "⚠️  Xcode no encontrado - Los tests de iOS requerirán Xcode instalado"
fi

# Verificar Android SDK
if [ -n "$ANDROID_HOME" ]; then
    echo "🤖 Android SDK configurado en: $ANDROID_HOME"
    if command -v emulator &> /dev/null; then
        echo "📱 Emuladores Android disponibles:"
        emulator -list-avds | head -3
    fi
else
    echo "⚠️  ANDROID_HOME no configurado - Los tests de Android requerirán Android SDK"
fi

echo ""
echo "🎯 Configuración de Tests de Appium completada!"
echo ""
echo "📋 Comandos disponibles:"
echo "   npm run test:mobile:ios      # Ejecutar tests en iOS"
echo "   npm run test:mobile:android  # Ejecutar tests en Android"
echo "   npm run appium:test          # Ejecutar todos los tests"
echo ""
echo "📚 Para más información, consulta: APPIUM_TESTS.md"
echo ""

# Verificar si hay un simulador iOS ejecutándose
if command -v xcrun &> /dev/null; then
    BOOTED_SIMULATOR=$(xcrun simctl list devices | grep "Booted" | head -1)
    if [ -n "$BOOTED_SIMULATOR" ]; then
        echo "✅ Simulador iOS encontrado ejecutándose"
    else
        echo "💡 Tip: Inicia un simulador iOS para ejecutar tests de iOS"
        echo "   Abre Xcode > Window > Devices and Simulators"
    fi
fi

echo "🚀 ¡Todo listo para ejecutar tests de Appium!"