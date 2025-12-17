/**
 * Input validation utilities for API endpoints
 * Prevents SQL injection, XSS attacks, and data corruption
 */

/**
 * Validates and sanitizes a client ID
 * Client IDs should be alphanumeric with optional hyphens/underscores
 */
export function validateClientId(clientId: string | undefined | null): string {
  if (!clientId || typeof clientId !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Client ID is required and must be a string'
    })
  }

  // Remove whitespace
  const trimmed = clientId.trim()

  // Validate length (reasonable limit)
  if (trimmed.length === 0 || trimmed.length > 100) {
    throw createError({
      statusCode: 400,
      message: 'Client ID must be between 1 and 100 characters'
    })
  }

  // Validate format: alphanumeric, hyphens, underscores, dots only
  // This prevents SQL injection and XSS
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    throw createError({
      statusCode: 400,
      message: 'Client ID contains invalid characters. Only alphanumeric characters, dots, hyphens, and underscores are allowed.'
    })
  }

  return trimmed
}

/**
 * Validates and sanitizes a search query
 * Removes potentially dangerous characters and limits length
 */
export function validateSearchQuery(query: string | undefined | null, maxLength: number = 200): string {
  if (!query) {
    return ''
  }

  if (typeof query !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Search query must be a string'
    })
  }

  // Trim and limit length
  const trimmed = query.trim().substring(0, maxLength)

  // Remove potentially dangerous characters but allow most unicode
  // Allow letters, numbers, spaces, and common punctuation
  const sanitized = trimmed.replace(/[<>'"\\]/g, '')

  return sanitized
}

/**
 * Validates and sanitizes a numeric parameter (limit, offset, etc.)
 */
export function validateNumericParam(
  value: string | number | undefined | null,
  options: {
    min?: number
    max?: number
    defaultValue?: number
    paramName?: string
  } = {}
): number {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, defaultValue, paramName = 'parameter' } = options

  // Use default if not provided
  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw createError({
      statusCode: 400,
      message: `${paramName} is required`
    })
  }

  // Convert to number
  const num = typeof value === 'string' ? parseInt(value, 10) : value

  // Validate it's a valid number
  if (isNaN(num) || !isFinite(num)) {
    throw createError({
      statusCode: 400,
      message: `${paramName} must be a valid number`
    })
  }

  // Validate range
  if (num < min || num > max) {
    throw createError({
      statusCode: 400,
      message: `${paramName} must be between ${min} and ${max}`
    })
  }

  return num
}

/**
 * Validates and sanitizes an email address
 */
export function validateEmail(email: string | undefined | null): string {
  if (!email || typeof email !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Email is required and must be a string'
    })
  }

  const trimmed = email.trim().toLowerCase()

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid email format'
    })
  }

  // Length limit
  if (trimmed.length > 254) {
    throw createError({
      statusCode: 400,
      message: 'Email address is too long'
    })
  }

  return trimmed
}

/**
 * Validates an array of strings (e.g., account IDs)
 */
export function validateStringArray(
  value: any,
  options: {
    maxLength?: number
    maxItems?: number
    itemValidator?: (item: string) => string
  } = {}
): string[] {
  const { maxLength = 100, maxItems = 1000, itemValidator } = options

  if (!Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      message: 'Expected an array'
    })
  }

  if (value.length > maxItems) {
    throw createError({
      statusCode: 400,
      message: `Array cannot contain more than ${maxItems} items`
    })
  }

  return value.map((item, index) => {
    if (typeof item !== 'string') {
      throw createError({
        statusCode: 400,
        message: `Array item at index ${index} must be a string`
      })
    }

    const trimmed = item.trim()
    if (trimmed.length === 0 || trimmed.length > maxLength) {
      throw createError({
        statusCode: 400,
        message: `Array item at index ${index} must be between 1 and ${maxLength} characters`
      })
    }

    // Apply custom validator if provided
    return itemValidator ? itemValidator(trimmed) : trimmed
  })
}

/**
 * Validates a transcript ID
 */
export function validateTranscriptId(transcriptId: string | number | undefined | null): string | number {
  if (transcriptId === undefined || transcriptId === null) {
    throw createError({
      statusCode: 400,
      message: 'Transcript ID is required'
    })
  }

  // Can be string (UUID) or number
  if (typeof transcriptId === 'number') {
    if (!isFinite(transcriptId) || transcriptId < 0) {
      throw createError({
        statusCode: 400,
        message: 'Transcript ID must be a positive number'
      })
    }
    return transcriptId
  }

  if (typeof transcriptId !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Transcript ID must be a string or number'
    })
  }

  const trimmed = transcriptId.trim()

  // UUID format or alphanumeric
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed) || trimmed.length > 100) {
    throw createError({
      statusCode: 400,
      message: 'Invalid transcript ID format'
    })
  }

  return trimmed
}

/**
 * Validates sortBy parameter
 */
export function validateSortBy(sortBy: string | undefined | null, allowedValues: string[]): string {
  if (!sortBy || typeof sortBy !== 'string') {
    return allowedValues[0] || 'id'
  }

  const trimmed = sortBy.trim().toLowerCase()

  if (!allowedValues.includes(trimmed)) {
    throw createError({
      statusCode: 400,
      message: `Invalid sortBy value. Allowed values: ${allowedValues.join(', ')}`
    })
  }

  return trimmed
}

/**
 * Sanitizes a string to prevent XSS
 * Removes HTML tags and dangerous characters
 */
export function sanitizeString(input: string | undefined | null, maxLength: number = 10000): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove HTML tags
  const withoutHtml = input.replace(/<[^>]*>/g, '')
  
  // Remove potentially dangerous characters
  const sanitized = withoutHtml
    .replace(/[<>'"\\]/g, '')
    .trim()
    .substring(0, maxLength)

  return sanitized
}

