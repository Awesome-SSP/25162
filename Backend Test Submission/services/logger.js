const { Log } = require('../../Logging Midleware/index.js');

const VALID_BACKEND_PACKAGES = [
    'cache', 'controller', 'cron_job', 'db', 'domain', 
    'handler', 'repository', 'route', 'service',
    'auth', 'config', 'middleware', 'utils'
];

class BackendLogger {
    debug(pkg, message) {
        Log('backend', 'debug', pkg, message);
    }

    info(pkg, message) {
        Log('backend', 'info', pkg, message);
    }

    warn(pkg, message) {
        Log('backend', 'warn', pkg, message);
    }

    error(pkg, message) {
        Log('backend', 'error', pkg, message);
    }

    fatal(pkg, message) {
        Log('backend', 'fatal', pkg, message);
    }

    getValidPackages() {
        return [...VALID_BACKEND_PACKAGES];
    }
}

module.exports = {
    logger: new BackendLogger(),
    Log
};