
const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzYXVyYWJocGFybWFyMjA1QGdtYWlsLmNvbSIsImV4cCI6MTc1ODM1MTgzOSwiaWF0IjoxNzU4MzUwOTM5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMDU5N2YyMmItOTJlNi00MDAzLWFlODUtOGNhNzExZTcwNzQ1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2F1cmFiaCBzaW5naCBwYXJtYXIiLCJzdWIiOiI4NzIxMTk2OC0zNWVlLTRmNjAtYTc4NS1iMmY1MmNjMWE5Y2UifSwiZW1haWwiOiJzYXVyYWJocGFybWFyMjA1QGdtYWlsLmNvbSIsIm5hbWUiOiJzYXVyYWJoIHNpbmdoIHBhcm1hciIsInJvbGxObyI6IjI1MTYyIiwiYWNjZXNzQ29kZSI6InJEbmV6ZiIsImNsaWVudElEIjoiODcyMTE5NjgtMzVlZS00ZjYwLWE3ODUtYjJmNTJjYzFhOWNlIiwiY2xpZW50U2VjcmV0IjoiZFNGTmpXZG5wQWJ3eVZFbiJ9.UURdH2tBQ1AZPmiWJPwHIr5Qounjh5ZMuXhuMZ4HhxY";

const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_BACKEND_PACKAGES = ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"];
const VALID_FRONTEND_PACKAGES = ["api", "component", "hook", "page", "state", "style"];
const VALID_COMMON_PACKAGES = ["auth", "config", "middleware", "utils"];

function validateInputs(stack, level, pkg) {
  if (!VALID_STACKS.includes(stack)) {
    return `Invalid stack: "${stack}". Must be one of: ${VALID_STACKS.join(", ")}.`;
  }
  if (!VALID_LEVELS.includes(level)) {
    return `Invalid level: "${level}". Must be one of: ${VALID_LEVELS.join(", ")}.`;
  }

  const allValidPackages = [...VALID_COMMON_PACKAGES];
  if (stack === "backend") {
    allValidPackages.push(...VALID_BACKEND_PACKAGES);
  } else if (stack === "frontend") {
    allValidPackages.push(...VALID_FRONTEND_PACKAGES);
  }

  if (!allValidPackages.includes(pkg)) {
    return `Invalid package: "${pkg}" for stack "${stack}". Must be one of: ${allValidPackages.join(", ")}.`;
  }

  return null;
}

async function Log(stack, level, pkg, message) {
  const validationError = validateInputs(stack, level, pkg);
  if (validationError) {
    console.error(`Logging validation error: ${validationError}`);
    return;
  }

  const timestamp = new Date().toISOString();
  const formattedLog = `[${timestamp}] [${stack.toUpperCase()}] [${level.toUpperCase()}] [${pkg}] ${message}`;
  
  switch (level.toLowerCase()) {
    case 'error':
    case 'fatal':
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

  // API logging disabled for now - using console logging only
  /*
  const logPayload = {
    stack,
    level,
    package: pkg,
    message,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(logPayload),
    });

    if (!response.ok) {
      // If the API call fails, we still don't want to crash the app.
      // We can log the failure to the developer console for debugging purposes.
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to send log to API. Status: ${response.status}, Message: ${errorData.message || 'No message provided'}`);
    } else {
      console.log(`[LOGGING] Successfully sent to central service: ${level.toUpperCase()} - ${message}`);
    }

  } catch (error) {
    // This handles network errors, CORS issues, etc.
    console.error("Network error while trying to send log to API:", error);
  }
  */
}

// Export for CommonJS compatibility
module.exports = { Log };
