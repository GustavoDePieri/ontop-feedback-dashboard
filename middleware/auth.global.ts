export default defineNuxtRouteMiddleware((to, from) => {
  // Skip authentication check for login page
  if (to.path === '/login') {
    return
  }

  // Check authentication on client side
  if (process.client) {
    // Check for JWT token in localStorage
    const authToken = localStorage.getItem('auth_token')
    
    if (!authToken) {
      // No token, redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_email')
      return navigateTo('/login')
    }

    // Token exists - actual validation happens server-side on API calls
    // Client just checks for presence of token
  }

  // Check authentication on server side using cookie
  if (process.server) {
    const authToken = useCookie('auth_token')
    
    if (!authToken.value) {
      return navigateTo('/login')
    }

    // Note: Full JWT validation happens in API endpoints via requireAuth()
    // This middleware just checks for token presence
  }
})
