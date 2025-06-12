const path = require('path');

exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    
    // ====================
    // Server Configurations
    // ====================
    port: 4723,
    path: '/',
    
    // ====================
    // Test Configurations
    // ====================
    specs: [
        './appium/tests/**/*.spec.js'
    ],
    
    exclude: [],
    
    maxInstances: 1,
    
    capabilities: [{
        platformName: 'iOS',
        'appium:deviceName': 'iPhone 15',
        'appium:platformVersion': '17.0',
        'appium:app': path.resolve('./ios/build/Build/Products/Debug-iphonesimulator/MercaditoWallet.app'),
        'appium:automationName': 'XCUITest',
        'appium:noReset': false,
        'appium:fullReset': true,
        'appium:newCommandTimeout': 300000,
        'appium:wdaLaunchTimeout': 300000,
        'appium:wdaConnectionTimeout': 300000
    }],
    
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'info',
    
    // Set specific log levels per logger
    logLevels: {
        webdriver: 'info',
        '@wdio/appium-service': 'info'
    },
    
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    baseUrl: 'http://localhost:19006',
    
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,
    
    // Default timeout in milliseconds for request
    connectionRetryTimeout: 120000,
    
    // Default request retries count
    connectionRetryCount: 3,
    
    // Test runner services
    services: [
        ['appium', {
            command: 'appium',
            args: {
                address: 'localhost',
                port: 4723,
                relaxedSecurity: true,
                log: './appium.log'
            }
        }]
    ],
    
    // Framework you want to run your specs with.
    framework: 'mocha',
    
    // The number of times to retry the entire specfile when it fails as a whole
    specFileRetries: 1,
    
    // Delay in seconds between the spec file retry attempts
    specFileRetriesDelay: 0,
    
    // Whether or not retried specfiles should be retried immediately or deferred to the end of the queue
    specFileRetriesDeferred: false,
    
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
    
    /**
     * Gets executed once before all workers get launched.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    onPrepare: function (config, capabilities) {
        console.log('🚀 Iniciando tests de Appium para Mercadito Wallet');
    },

    /**
     * Gets executed before a worker process is spawned and can be used to initialise specific service
     * for that worker as well as modify runtime environments in an async fashion.
     * @param  {String} cid      capability id (e.g 0-0)
     * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
     * @param  {[type]} specs    specs to be run in the worker process
     * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
     * @param  {[type]} execArgv list of string arguments passed to the worker process
     */
    onWorkerStart: function (cid, caps, specs, args, execArgv) {
        console.log(`Worker ${cid} iniciado con capacidades:`, caps);
    },

    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     * @param {String} cid worker id (e.g. 0-0)
     */
    beforeSession: function (config, capabilities, specs, cid) {
        console.log(`Iniciando sesión para worker ${cid}`);
    },

    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs        List of spec file paths that are to be run
     * @param {Object}         browser      instance of created browser/device session
     */
    before: function (capabilities, specs) {
        // Importar helpers personalizados
        require('./appium/helpers/commands');
    },

    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    beforeCommand: function (commandName, args) {
        // console.log(`Ejecutando comando: ${commandName}`, args);
    },

    /**
     * Hook that gets executed before the suite starts
     * @param {Object} suite suite details
     */
    beforeSuite: function (suite) {
        console.log(`\n📱 Iniciando suite: ${suite.title}`);
    },

    /**
     * Function to be executed before a test (in Mocha/Jasmine) starts.
     */
    beforeTest: function (test, context) {
        console.log(`\n🧪 Ejecutando test: ${test.title}`);
    },

    /**
     * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
     * beforeEach in Mocha)
     */
    beforeHook: function (test, context) {
        // console.log(`Hook: ${test.title}`);
    },

    /**
     * Hook that gets executed _after_ a hook within the suite ends (e.g. runs after calling
     * afterEach in Mocha)
     */
    afterHook: function (test, context, { error, result, duration, passed, retries }) {
        // console.log(`Hook completado: ${test.title}`);
    },

    /**
     * Function to be executed after a test (in Mocha/Jasmine) completes.
     */
    afterTest: function(test, context, { error, result, duration, passed, retries }) {
        if (error) {
            console.log(`❌ Test falló: ${test.title}`, error.message);
        } else {
            console.log(`✅ Test exitoso: ${test.title}`);
        }
    },

    /**
     * Hook that gets executed after the suite has ended
     * @param {Object} suite suite details
     */
    afterSuite: function (suite) {
        console.log(`📋 Suite completada: ${suite.title}`);
    },

    /**
     * Runs after a WebdriverIO command gets executed
     * @param {String} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {Number} result 0 - command success, 1 - command error
     * @param {Object} error error object if any
     */
    afterCommand: function (commandName, args, result, error) {
        // console.log(`Comando completado: ${commandName}`);
    },

    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {Number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    after: function (result, capabilities, specs) {
        console.log('🏁 Tests de Appium completados');
    },

    /**
     * Gets executed right after terminating the webdriver session.
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    afterSession: function (config, capabilities, specs) {
        console.log('📱 Sesión de dispositivo cerrada');
    },

    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {Object} exitCode 0 - success, 1 - fail
     * @param {Object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    onComplete: function(exitCode, config, capabilities, results) {
        console.log('🎯 Todos los tests de Appium completados');
    },

    /**
    * Gets executed when a refresh happens.
    * @param {String} oldSessionId session ID of the old session
    * @param {String} newSessionId session ID of the new session
    */
    onReload: function(oldSessionId, newSessionId) {
        console.log('🔄 Sesión recargada');
    }
};