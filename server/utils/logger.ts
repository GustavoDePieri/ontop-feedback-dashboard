/**
 * Centralized logging utility for server-side code
 * 
 * Provides structured logging with different log levels:
 * - error: Critical errors that need attention
 * - warn: Warnings that should be investigated
 * - info: Important informational messages
 * - debug: Detailed debugging information (only in development)
 * 
 * Usage:
 *   import { logger } from '~/server/utils/logger'
 *   logger.info('Processing started')
 *   logger.error('Failed to process', { error: err })
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment: boolean
  private isProduction: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  /**
   * Log an informational message
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context)
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    // In production, only log errors and warnings to reduce noise
    if (this.isProduction && (level === 'debug' || level === 'info')) {
      return
    }

    // Format the log entry
    const logEntry = context 
      ? `${prefix} ${message} ${JSON.stringify(context)}`
      : `${prefix} ${message}`

    // Use appropriate console method
    switch (level) {
      case 'error':
        console.error(logEntry)
        break
      case 'warn':
        console.warn(logEntry)
        break
      case 'info':
        console.info(logEntry)
        break
      case 'debug':
        console.debug(logEntry)
        break
    }
  }
}

// Export singleton instance
export const logger = new Logger()

