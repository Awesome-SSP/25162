// @ts-ignore: Allow import from JS file
import { Log } from '../../../Logging Midleware/index.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'auth' | 'config' | 'middleware' | 'utils';

class FrontendLogger {
  private async logWithCentralized(level: LogLevel, pkg: FrontendPackage, message: string): Promise<void> {
    try {
      await Log('frontend', level, pkg, message);
    } catch (error) {
      console.error('Centralized logging failed:', error);
      console.log(`[${level.toUpperCase()}] [frontend] [${pkg}] ${message}`);
    }
  }

  debug(pkg: FrontendPackage, message: string): void {
    this.logWithCentralized('debug', pkg, message);
  }

  info(pkg: FrontendPackage, message: string): void {
    this.logWithCentralized('info', pkg, message);
  }

  warn(pkg: FrontendPackage, message: string): void {
    this.logWithCentralized('warn', pkg, message);
  }

  error(pkg: FrontendPackage, message: string): void {
    this.logWithCentralized('error', pkg, message);
  }

  fatal(pkg: FrontendPackage, message: string): void {
    this.logWithCentralized('fatal', pkg, message);
  }

  getValidPackages(): string[] {
    return ['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils'];
  }
}

export const logger = new FrontendLogger();
export { Log };