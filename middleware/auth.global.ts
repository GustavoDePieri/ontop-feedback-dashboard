export default defineNuxtRouteMiddleware((to, from) => {
  // Skip authentication check for login page
  if (to.path === '/login') {
    return
  }

  // Check authentication on client side
  if (process.client) {
    const isAuthenticated = localStorage.getItem('ontop_authenticated')
    const authTimestamp = localStorage.getItem('ontop_auth_timestamp')
    
    // Check if authentication is valid and not expired (7 days)
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    const isExpired = authTimestamp && (Date.now() - parseInt(authTimestamp)) > sevenDaysInMs
    
    if (!isAuthenticated || isExpired) {
      // Clear expired authentication
      localStorage.removeItem('ontop_authenticated')
      localStorage.removeItem('ontop_auth_timestamp')
      
      return navigateTo('/login')
    }
  }

  // Check authentication on server side using cookie
  if (process.server) {
    const authCookie = useCookie('ontop_auth')
    
    if (!authCookie.value) {
      return navigateTo('/login')
    }
  }
})
