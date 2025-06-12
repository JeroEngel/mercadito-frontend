const path = require('path');

exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    
    // ====================
    // Test Configurations
    // ====================
    specs: [
        './appium/tests/**/*.spec.js'
    ],
    
    exclude: [],
    
    maxInstances: 1,
    
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            mobileEmulation: {
                deviceName: 'iPhone 12 Pro'
            },
            args: [
                '--disable-web-security', 
                '--disable-features=VizDisplayCompositor',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-extensions',
                '--disable-gpu'
            ]
        }
    }],
    
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'info',
    
    // Set a base URL for React Native Web
    baseUrl: 'http://localhost:19006',
    
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,
    
    // Default timeout in milliseconds for request
    connectionRetryTimeout: 120000,
    
    // Default request retries count
    connectionRetryCount: 3,
    
    // Usar ChromeDriver directamente sin servicios externos
    hostname: 'localhost',
    port: 9515,
    path: '/',
    
    // Framework you want to run your specs with.
    framework: 'mocha',
    
    // Test reporter for stdout.
    reporters: ['spec'],
    
    // Options to be passed to Mocha.
    mochaOpts: {
        ui: 'bdd',
        timeout: 300000
    },
    
    // =====
    // Hooks
    // =====
    
    onPrepare: function (config, capabilities) {
        console.log('🚀 Iniciando tests de Appium para Mercadito Wallet (Chrome Mode)');
    },

    beforeSession: function (config, capabilities, specs, cid) {
        console.log(`Iniciando sesión Chrome para worker ${cid}`);
    },

    before: function (capabilities, specs) {
        // Importar helpers personalizados para web
        require('./appium/helpers/web-commands');
    },

    beforeSuite: function (suite) {
        console.log(`\n🌐 Iniciando suite Chrome: ${suite.title}`);
    },

    beforeTest: function (test, context) {
        console.log(`\n🧪 Ejecutando test Chrome: ${test.title}`);
    },

    afterTest: function(test, context, { error, result, duration, passed, retries }) {
        if (error) {
            console.log(`❌ Test Chrome falló: ${test.title}`, error.message);
        } else {
            console.log(`✅ Test Chrome exitoso: ${test.title}`);
        }
    },

    afterSuite: function (suite) {
        console.log(`📋 Suite Chrome completada: ${suite.title}`);
    },

    after: function (result, capabilities, specs) {
        console.log('🏁 Tests de Appium Chrome completados');
    },

    onComplete: function(exitCode, config, capabilities, results) {
        console.log('🎯 Todos los tests de Appium Chrome completados');
    }
};