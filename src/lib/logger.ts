type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private log(level: LogLevel, message: string, ...args: any[]) {
    if (process.env.NODE_ENV === 'production' && level === 'debug') {
      return
    }

    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    console[level](logMessage, ...args)
    
    // In production, you might want to send logs to a service
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      // Send to logging service (e.g., Sentry, LogRocket, etc.)
    }
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args)
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args)
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args)
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args)
  }
}

export const logger = new Logger()
