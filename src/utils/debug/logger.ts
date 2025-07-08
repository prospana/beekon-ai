export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  context?: string;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private logLevel: LogLevel = 'debug';

  constructor() {
    if (typeof window !== 'undefined' && window.__DEBUG__) {
      this.logLevel = 'debug';
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private addLog(level: LogLevel, message: string, data?: any, context?: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      context,
      stack: level === 'error' ? new Error().stack : undefined,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.shouldLog(level)) {
      const prefix = context ? `[${context}]` : '';
      const logMessage = `${prefix} ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(logMessage, data);
          break;
        case 'info':
          console.info(logMessage, data);
          break;
        case 'warn':
          console.warn(logMessage, data);
          break;
        case 'error':
          console.error(logMessage, data);
          break;
      }
    }
  }

  debug(message: string, data?: any, context?: string) {
    this.addLog('debug', message, data, context);
  }

  info(message: string, data?: any, context?: string) {
    this.addLog('info', message, data, context);
  }

  warn(message: string, data?: any, context?: string) {
    this.addLog('warn', message, data, context);
  }

  error(message: string, data?: any, context?: string) {
    this.addLog('error', message, data, context);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();