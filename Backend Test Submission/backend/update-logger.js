const fs = require('fs');
const path = require('path');

// Read the backend index.js file
const filePath = path.join(__dirname, 'index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all Log calls with logger calls
content = content.replace(/Log\("backend", "debug", "([^"]*)", ([^)]+)\)/g, 'logger.debug("$1", $2)');
content = content.replace(/Log\("backend", "info", "([^"]*)", ([^)]+)\)/g, 'logger.info("$1", $2)');
content = content.replace(/Log\("backend", "warn", "([^"]*)", ([^)]+)\)/g, 'logger.warn("$1", $2)');
content = content.replace(/Log\("backend", "error", "([^"]*)", ([^)]+)\)/g, 'logger.error("$1", $2)');
content = content.replace(/Log\("backend", "fatal", "([^"]*)", ([^)]+)\)/g, 'logger.fatal("$1", $2)');

// Write back the updated content
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated all Log calls to use the new logger');