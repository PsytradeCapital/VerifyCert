interface ErrorLog {
  id: string;
  timestamp: number;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent: string;
  url: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  logError(error: Error, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.addLog(errorLog);
  }

  logWarning(message: string, context?: Record<string, any>): void {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'warn',
      message,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.addLog(warningLog);
  }

  private addLog(log: ErrorLog): void {
    this.logs.unshift(log);
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    console.log(`[${log.level.toUpperCase()}] ${log.message}`, log.context);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();
export type { ErrorLog };