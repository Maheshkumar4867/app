interface LogLevel {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
}

export default class Logger {
  private static logLevel: number = 1; // INFO level by default
  private static prefix: string = '[VideoPlayer]';

  private static readonly levels: LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  /**
   * Set the minimum log level
   * @param level - Log level (0=DEBUG, 1=INFO, 2=WARN, 3=ERROR)
   */
  static setLogLevel(level: number): void {
    Logger.logLevel = level;
  }

  /**
   * Set the log prefix
   * @param prefix - Prefix to use for all log messages
   */
  static setPrefix(prefix: string): void {
    Logger.prefix = prefix;
  }

  /**
   * Log a debug message
   * @param message - Message to log
   * @param data - Optional data to log
   */
  static debug(message: string, data?: any): void {
    if (Logger.logLevel <= Logger.levels.DEBUG) {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ${Logger.prefix} [DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Log an info message
   * @param message - Message to log
   * @param data - Optional data to log
   */
  static info(message: string, data?: any): void {
    if (Logger.logLevel <= Logger.levels.INFO) {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ${Logger.prefix} [INFO] ${message}`, data || '');
    }
  }

  /**
   * Log a warning message
   * @param message - Message to log
   * @param data - Optional data to log
   */
  static warn(message: string, data?: any): void {
    if (Logger.logLevel <= Logger.levels.WARN) {
      const timestamp = new Date().toISOString();
      console.warn(`${timestamp} ${Logger.prefix} [WARN] ${message}`, data || '');
    }
  }

  /**
   * Log an error message
   * @param message - Message to log
   * @param data - Optional data to log
   */
  static error(message: string, data?: any): void {
    if (Logger.logLevel <= Logger.levels.ERROR) {
      const timestamp = new Date().toISOString();
      console.error(`${timestamp} ${Logger.prefix} [ERROR] ${message}`, data || '');
    }
  }

  /**
   * Log performance metrics
   * @param label - Performance label
   * @param startTime - Start time in milliseconds
   * @param endTime - End time in milliseconds (optional, defaults to current time)
   */
  static performance(label: string, startTime: number, endTime?: number): void {
    if (Logger.logLevel <= Logger.levels.DEBUG) {
      const duration = (endTime || Date.now()) - startTime;
      Logger.debug(`Performance: ${label} took ${duration}ms`);
    }
  }

  /**
   * Create a scoped logger with a specific prefix
   * @param scope - Scope name to add to prefix
   * @returns Scoped logger methods
   */
  static createScopedLogger(scope: string) {
    const scopedPrefix = `${Logger.prefix}:${scope}`;
    
    return {
      debug: (message: string, data?: any) => {
        if (Logger.logLevel <= Logger.levels.DEBUG) {
          const timestamp = new Date().toISOString();
          console.log(`${timestamp} ${scopedPrefix} [DEBUG] ${message}`, data || '');
        }
      },
      info: (message: string, data?: any) => {
        if (Logger.logLevel <= Logger.levels.INFO) {
          const timestamp = new Date().toISOString();
          console.log(`${timestamp} ${scopedPrefix} [INFO] ${message}`, data || '');
        }
      },
      warn: (message: string, data?: any) => {
        if (Logger.logLevel <= Logger.levels.WARN) {
          const timestamp = new Date().toISOString();
          console.warn(`${timestamp} ${scopedPrefix} [WARN] ${message}`, data || '');
        }
      },
      error: (message: string, data?: any) => {
        if (Logger.logLevel <= Logger.levels.ERROR) {
          const timestamp = new Date().toISOString();
          console.error(`${timestamp} ${scopedPrefix} [ERROR] ${message}`, data || '');
        }
      },
    };
  }
}