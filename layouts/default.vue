<template>
  <div class="min-h-screen bg-gradient-dark transition-colors duration-300">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-ontop-navy-dark/95 backdrop-blur-xl border-r border-white/5 transform transition-all duration-300 ease-in-out lg:translate-x-0" :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }">
      <div class="flex items-center justify-center h-16 px-4 bg-gradient-ontop-hero">
        <h1 class="text-lg font-bold text-white">Ontop Analytics</h1>
      </div>
      
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <NuxtLink
            to="/"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path === '/' ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            Dashboard
          </NuxtLink>
          
          <NuxtLink
            to="/analytics"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path === '/analytics' ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Advanced Analytics
          </NuxtLink>
          
          <NuxtLink
            to="/reports"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path.startsWith('/reports') ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reports
          </NuxtLink>
          
          <NuxtLink
            to="/test"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path === '/test' ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Debug
          </NuxtLink>
        </div>
        
        <!-- Bottom section -->
        <div class="absolute bottom-0 w-full p-4 space-y-3">
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="w-full flex items-center px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
          >
            <svg v-if="!isDarkMode" class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
          </button>
          
          <!-- Logout button -->
          <button
            @click="handleLogout"
            class="w-full flex items-center px-4 py-3 text-sm font-medium text-white/70 hover:bg-ontop-coral-500/20 hover:text-ontop-coral-400 rounded-lg transition-all duration-200"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
          
          <!-- Data source info -->
          <div class="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 transition-colors duration-200">
            <p class="text-xs text-white/80 font-medium">Data Source</p>
            <p class="text-xs text-white/60">Google Sheets (Live)</p>
            <div class="flex items-center mt-2">
              <div class="w-2 h-2 bg-ontop-coral-500 rounded-full animate-pulse"></div>
              <span class="ml-2 text-xs text-white/60">Connected</span>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
      <div class="absolute inset-0 bg-gray-600 opacity-75"></div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar for mobile -->
      <div class="lg:hidden bg-ontop-navy-dark/95 backdrop-blur-xl shadow-lg border-b border-white/5 transition-colors duration-300">
        <div class="flex items-center justify-between px-4 py-3">
          <button @click="sidebarOpen = !sidebarOpen" class="text-white/70 hover:text-white transition-colors duration-200">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-white transition-colors duration-200">✨ Ontop Analytics</h1>
          <div class="flex items-center space-x-2">
            <!-- Mobile Dark Mode Toggle -->
            <button @click="toggleDarkMode" class="text-gray-300 hover:text-white p-1 transition-colors duration-200">
              <svg v-if="!isDarkMode" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <!-- Mobile Logout Button -->
            <button @click="handleLogout" class="text-gray-300 hover:text-ontop-pink-400 p-1 transition-colors duration-200">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main>
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const sidebarOpen = ref(false)

// Dark mode composable
const { isDarkMode, toggleDarkMode, initializeDarkMode, watchSystemTheme } = useDarkMode()

// Close sidebar on route change (mobile)
const route = useRoute()
watch(() => route.path, () => {
  sidebarOpen.value = false
})

// Logout method
const handleLogout = async () => {
  // Clear client-side authentication
  if (process.client) {
    localStorage.removeItem('ontop_authenticated')
    localStorage.removeItem('ontop_auth_timestamp')
  }
  
  // Clear server-side cookie
  const authCookie = useCookie('ontop_auth')
  authCookie.value = false
  
  // Redirect to login page
  await navigateTo('/login')
}

// Initialize dark mode on mount
onMounted(() => {
  initializeDarkMode()
  watchSystemTheme()
})
</script>
