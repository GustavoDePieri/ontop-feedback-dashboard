/**
 * POST /api/auth/login
 * 
 * Authenticate user and generate JWT token
 * For now, uses simple credential check
 * TODO: Integrate with proper user management system
 */

import { generateAuthToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { password } = body

  // Check against environment variable (or use default)
  // Set ADMIN_PASSWORD in Vercel to use your own password
  const validPassword = process.env.ADMIN_PASSWORD || 'ontop2024'
  
  console.log('Login attempt - Password check:', password === validPassword ? 'SUCCESS' : 'FAILED')

  if (password !== validPassword) {
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


