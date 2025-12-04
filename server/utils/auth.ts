/**
 * Authentication utilities with JWT token support
 * Provides secure authentication with server-side token validation
 */

import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const TOKEN_EXPIRY = '7d' // 7 days

interface TokenPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Generate a JWT token for authenticated user
 */
export function generateAuthToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

/**
 * Verify and decode a JWT token
 */
export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header or cookie
 */
export function extractToken(event: H3Event): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = getHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookie as fallback
  const tokenCookie = getCookie(event, 'auth_token')
  if (tokenCookie) {
    return tokenCookie
  }

  return null
}

/**
 * Middleware to require authentication
 * Usage: await requireAuth(event)
 */
export async function requireAuth(event: H3Event): Promise<TokenPayload> {
  const token = extractToken(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required. Please log in.'
    })
  }

  const payload = verifyAuthToken(token)

  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired authentication token. Please log in again.'
    })
  }

  // Attach user info to event context for use in handlers
  event.context.auth = payload

  return payload
}

/**
 * Optional authentication - doesn't throw if not authenticated
 */
export function getOptionalAuth(event: H3Event): TokenPayload | null {
  const token = extractToken(event)
  if (!token) return null
  return verifyAuthToken(token)
}

