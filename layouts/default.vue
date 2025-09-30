<template>
  <div class="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-800 shadow-soft dark:shadow-none border-r border-secondary-200 dark:border-secondary-700 transform transition-all duration-300 ease-in-out lg:translate-x-0" :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }">
      <div class="flex items-center justify-center h-16 px-4 gradient-primary">
        <h1 class="text-xl font-bold text-white">Ontop Analytics</h1>
      </div>
      
      <nav class="mt-6 px-3 space-y-1">
        <NuxtLink
          to="/"
          class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          :class="$route.path === '/' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 hover:text-secondary-900 dark:hover:text-white'"
        >
          <svg class="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NuxtLink>
        
        <NuxtLink
          to="/analytics"
          class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          :class="$route.path === '/analytics' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 hover:text-secondary-900 dark:hover:text-white'"
        >
          <svg class="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analytics
        </NuxtLink>
        
        <NuxtLink
          to="/reports"
          class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          :class="$route.path.startsWith('/reports') ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 hover:text-secondary-900 dark:hover:text-white'"
        >
          <svg class="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Reports
        </NuxtLink>
        
        <NuxtLink
          to="/test"
          class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          :class="$route.path === '/test' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 hover:text-secondary-900 dark:hover:text-white'"
        >
          <svg class="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Debug
        </NuxtLink>
      </nav>
        
      <!-- Bottom section -->
      <div class="absolute bottom-0 w-full p-3 space-y-2 border-t border-secondary-200 dark:border-secondary-700">
        <!-- Data source info -->
        <div class="bg-secondary-50 dark:bg-secondary-700/30 rounded-lg p-3 mb-2">
          <p class="text-xs text-secondary-600 dark:text-secondary-300 font-medium">Data Source</p>
          <p class="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">Google Sheets</p>
          <div class="flex items-center mt-2">
            <div class="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></div>
            <span class="ml-2 text-xs text-secondary-500 dark:text-secondary-400">Live</span>
          </div>
        </div>
        
        <!-- Dark Mode Toggle -->
        <button
          @click="toggleDarkMode"
          class="w-full flex items-center px-3 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700/50 rounded-lg transition-all duration-200"
        >
          <svg v-if="!isDarkMode" class="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else class="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
        </button>
        
        <!-- Logout button -->
        <button
          @click="handleLogout"
          class="w-full flex items-center px-3 py-2 text-sm font-medium text-secondary-600 hover:bg-danger-50 hover:text-danger-700 dark:text-secondary-300 dark:hover:bg-danger-900/10 dark:hover:text-danger-400 rounded-lg transition-all duration-200"
        >
          <svg class="mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>

    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
      <div class="absolute inset-0 bg-gray-600 opacity-75"></div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar for mobile -->
      <div class="lg:hidden bg-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700 transition-colors duration-300">
        <div class="flex items-center justify-between px-4 py-3.5">
          <button @click="sidebarOpen = !sidebarOpen" class="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors duration-200">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-secondary-900 dark:text-white transition-colors duration-200">Ontop Analytics</h1>
          <div class="flex items-center space-x-2">
            <!-- Mobile Dark Mode Toggle -->
            <button @click="toggleDarkMode" class="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 p-1.5 transition-colors duration-200">
              <svg v-if="!isDarkMode" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <!-- Mobile Logout Button -->
            <button @click="handleLogout" class="text-secondary-500 dark:text-secondary-400 hover:text-danger-600 dark:hover:text-danger-400 p-1.5 transition-colors duration-200">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="animate-fade-in">
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
