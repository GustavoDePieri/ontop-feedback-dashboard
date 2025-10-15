/**
 * DIIO API Utility
 * 
 * Handles authentication and API requests to DIIO
 */

const config = useRuntimeConfig()

// In-memory token cache (expires in 1 hour per DIIO docs)
let cachedToken: string | null = null
let tokenExpiry: number = 0

/**
 * Get a valid access token (uses cache if valid)
 */
export async function getDiioAccessToken(): Promise<string> {
  // Check if cached token is still valid (with 5-minute buffer)
  const now = Date.now()
  if (cachedToken && tokenExpiry > now + 5 * 60 * 1000) {
    return cachedToken
  }

  // Get new token
  const clientId = config.diioClientId
  const clientSecret = config.diioClientSecret
  const refreshToken = config.diioRefreshToken
  const subdomain = config.diioSubdomain || 'getontop'

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('DIIO credentials not configured')
  }

  const baseUrl = `https://${subdomain}.diio.com/api/external`
  
  try {
    const response = await $fetch<{ access_token: string }>(`${baseUrl}/refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      }
    })

    cachedToken = response.access_token
    // Tokens expire in 1 hour
    tokenExpiry = Date.now() + 60 * 60 * 1000

    return cachedToken
  } catch (error: any) {
    console.error('Failed to get DIIO access token:', error)
    throw new Error(`DIIO authentication failed: ${error.message}`)
  }
}

/**
 * Make an authenticated request to DIIO API
 */
export async function diioRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    params?: Record<string, any>
  } = {}
): Promise<T> {
  const token = await getDiioAccessToken()
  const subdomain = config.diioSubdomain || 'getontop'
  const baseUrl = `https://${subdomain}.diio.com/api/external`

  const url = `${baseUrl}${endpoint}`

  try {
    return await $fetch<T>(url, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: options.body,
      params: options.params
    })
  } catch (error: any) {
    console.error(`DIIO API request failed: ${endpoint}`, error)
    throw error
  }
}

/**
 * Clear cached token (useful for testing or error recovery)
 */
export function clearDiioToken() {
  cachedToken = null
  tokenExpiry = 0
}

