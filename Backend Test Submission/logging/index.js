/**
 * Logging middleware for the URL shortener backend
 * Provides structured logging functionality throughout the application
 */

/**
 * Log function for structured logging
 * @param {string} stack - The application stack (e.g., "backend")
 * @param {string} level - Log level (error, warn, info, debug)
 * @param {string} package - The package/module name (e.g., "handler", "validation")
 * @param {string} message - The log message
 */
function Log(stack, level, package, message) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        stack,
        level: level.toUpperCase(),
        package,
        message
    };
    
    // Format the log output
    const formattedLog = `[${timestamp}] [${stack.toUpperCase()}] [${level.toUpperCase()}] [${package}] ${message}`;
    
    // Output based on log level
    switch (level.toLowerCase()) {
        case 'error':
            console.error(formattedLog);
            break;
        case 'warn':
            console.warn(formattedLog);
            break;
        case 'debug':
            if (process.env.NODE_ENV !== 'production') {
                console.debug(formattedLog);
            }
            break;
        case 'info':
        default:
            console.log(formattedLog);
            break;
    }
}

module.exports = { Log };