/**
 * Centralized Error Handling Utility
 * 
 * Provides consistent error handling across the application
 * with proper user feedback and logging.
 */

export interface AppError {
  title: string
  message: string
  details?: string
  code?: string
  retryable?: boolean
}

export class ErrorHandler {
  /**
   * Handle API errors with proper categorization
   */
  static handleApiError(error: any, context: string): AppError {
    console.error(`API Error in ${context}:`, error)
    
    // Network errors
    if (!error.response && error.message?.includes('fetch')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        details: error.message,
        code: 'NETWORK_ERROR',
        retryable: true
      }
    }
    
    // HTTP status errors
    if (error.statusCode || error.status) {
      const status = error.statusCode || error.status
      
      switch (status) {
        case 401:
          return {
            title: 'Authentication Error',
            message: 'Your session has expired. Please refresh the page.',
            details: error.message,
            code: 'AUTH_ERROR',
            retryable: false
          }
        case 403:
          return {
            title: 'Access Denied',
            message: 'You do not have permission to perform this action.',
            details: error.message,
            code: 'FORBIDDEN',
            retryable: false
          }
        case 404:
          return {
            title: 'Not Found',
            message: 'The requested resource was not found.',
            details: error.message,
            code: 'NOT_FOUND',
            retryable: false
          }
        case 429:
          return {
            title: 'Rate Limited',
            message: 'Too many requests. Please wait a moment and try again.',
            details: error.message,
            code: 'RATE_LIMITED',
            retryable: true
          }
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            title: 'Server Error',
            message: 'The server is experiencing issues. Please try again later.',
            details: error.message,
            code: 'SERVER_ERROR',
            retryable: true
          }
        default:
          return {
            title: 'Request Failed',
            message: error.message || 'An unexpected error occurred.',
            details: `Status: ${status}`,
            code: 'HTTP_ERROR',
            retryable: status >= 500
          }
      }
    }
    
    // Generic error
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      details: error.stack,
      code: 'UNKNOWN',
      retryable: true
    }
  }
  
  /**
   * Handle validation errors
   */
  static handleValidationError(error: any, context: string): AppError {
    console.error(`Validation Error in ${context}:`, error)
    
    return {
      title: 'Invalid Data',
      message: error.message || 'The provided data is invalid.',
      details: error.details,
      code: 'VALIDATION_ERROR',
      retryable: false
    }
  }
  
  /**
   * Handle database errors
   */
  static handleDatabaseError(error: any, context: string): AppError {
    console.error(`Database Error in ${context}:`, error)
    
    return {
      title: 'Database Error',
      message: 'Failed to save or retrieve data. Please try again.',
      details: error.message,
      code: 'DATABASE_ERROR',
      retryable: true
    }
  }
  
  /**
   * Create a user-friendly error message
   */
  static createUserError(title: string, message: string, details?: string): AppError {
    return {
      title,
      message,
      details,
      code: 'USER_ERROR',
      retryable: false
    }
  }
  
  /**
   * Log error for debugging
   */
  static logError(error: AppError, context: string) {
    console.group(`🚨 Error in ${context}`)
    console.error('Title:', error.title)
    console.error('Message:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    if (error.code) {
      console.error('Code:', error.code)
    }
    console.error('Retryable:', error.retryable)
    console.groupEnd()
  }
}
