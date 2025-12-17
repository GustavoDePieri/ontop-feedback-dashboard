/**
 * POST /api/auth/login
 * 
 * Authenticate user and generate JWT token
 * For now, uses simple credential check
 * TODO: Integrate with proper user management system
 */

import { generateAuthToken } from '~/server/utils/auth'
import { sanitizeString } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate password input
  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'Request body is required'
    })
  }

  const { password } = body

  if (!password || typeof password !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Password is required and must be a string'
    })
  }

  // Sanitize password input (limit length to prevent DoS)
  const sanitizedPassword = sanitizeString(password, 500)

  // Check against environment variable (or use default)
  // Set ADMIN_PASSWORD in Vercel to use your own password
  const validPassword = process.env.ADMIN_PASSWORD || 'ontop2024'

  // Use constant-time comparison to prevent timing attacks
  if (sanitizedPassword.length !== validPassword.length) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Constant-time string comparison
  let match = true
  for (let i = 0; i < sanitizedPassword.length; i++) {
    match = match && sanitizedPassword[i] === validPassword[i]
  }

  if (!match) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Generate JWT token
  const userId = 'admin'
  const email = 'admin@ontop.com'
  const token = generateAuthToken(userId, email)

  // Set token in cookie (httpOnly for security)
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })

  return {
    success: true,
    token, // Also return token for localStorage on client
    user: {
      userId,
      email
    }
  }
})


