const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";

// Define the valid values for stack, level, and package based on the requirements.
const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_BACKEND_PACKAGES = ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"];
const VALID_FRONTEND_PACKAGES = ["api", "component", "hook", "page", "state", "style"];
const VALID_COMMON_PACKAGES = ["auth", "config", "middleware", "utils"];

/**
 * @param {string} stack - The application stack ('backend' or 'frontend').
 * @param {string} level - The log severity level.
 * @param {string} pkg - The logical package or component name.
 * @returns {string | null} An error message if validation fails, otherwise null.
 */
function validateInputs(stack: string, level: string, pkg: string): string | null {
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

export async function Log(stack: string, level: string, pkg: string, message: string): Promise<void> {
  const validationError = validateInputs(stack, level, pkg);
  if (validationError) {
    // Instead of logging to the API, we'll log the validation error to the console
    // to help the developer debug their usage of the Log function.
    console.error(`Logging validation error: ${validationError}`);
    return;
  }

  const logPayload = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logPayload),
    });

    if (!response.ok) {
      // If the API call fails, we still don't want to crash the app.
      // We can log the failure to the developer console for debugging purposes.
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to send log to API. Status: ${response.status}, Message: ${errorData.message || 'No message provided'}`);
    }

  } catch (error) {
    // This handles network errors, CORS issues, etc.
    console.error("Network error while trying to send log to API:", error);
  }
}

// Helper functions for different log levels
export const logger = {
  debug: (pkg: string, message: string) => Log("frontend", "debug", pkg, message),
  info: (pkg: string, message: string) => Log("frontend", "info", pkg, message),
  warn: (pkg: string, message: string) => Log("frontend", "warn", pkg, message),
  error: (pkg: string, message: string) => Log("frontend", "error", pkg, message),
  fatal: (pkg: string, message: string) => Log("frontend", "fatal", pkg, message),
};