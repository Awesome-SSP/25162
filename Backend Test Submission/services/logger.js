/**
 * Backend Logger Service
 * Wrapper around the centralized logging middleware for backend use
 */

const { Log } = require('../../Logging Midleware/index.js');

// Valid backend packages according to the centralized logger
const VALID_BACKEND_PACKAGES = [
    'cache', 'controller', 'cron_job', 'db', 'domain', 
    'handler', 'repository', 'route', 'service',
    'auth', 'config', 'middleware', 'utils' // common packages
];

class BackendLogger {
    /**
     * Log a debug message
     * @param {string} pkg - The package name (must be valid backend package)
     * @param {string} message - The log message
     */
    debug(pkg, message) {
        Log('backend', 'debug', pkg, message);
    }

    /**
     * Log an info message
     * @param {string} pkg - The package name (must be valid backend package)
     * @param {string} message - The log message
     */
    info(pkg, message) {
        Log('backend', 'info', pkg, message);
    }

    /**
     * Log a warning message
     * @param {string} pkg - The package name (must be valid backend package)
     * @param {string} message - The log message
     */
    warn(pkg, message) {
        Log('backend', 'warn', pkg, message);
    }

    /**
     * Log an error message
     * @param {string} pkg - The package name (must be valid backend package)
     * @param {string} message - The log message
     */
    error(pkg, message) {
        Log('backend', 'error', pkg, message);
    }

    /**
     * Log a fatal message
     * @param {string} pkg - The package name (must be valid backend package)
     * @param {string} message - The log message
     */
    fatal(pkg, message) {
        Log('backend', 'fatal', pkg, message);
    }

    /**
     * Get list of valid packages for backend
     * @returns {string[]} Array of valid package names
     */
    getValidPackages() {
        return [...VALID_BACKEND_PACKAGES];
    }
}

// Export singleton instance
module.exports = {
    logger: new BackendLogger(),
    Log // Export the raw Log function as well for direct use
};