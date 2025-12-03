<template>
  <div class="min-h-screen bg-gradient-dark transition-colors duration-300">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-ontop-navy-dark/95 backdrop-blur-xl border-r border-white/5 transform transition-all duration-300 ease-in-out lg:translate-x-0" :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }">
      <div class="flex items-center justify-center h-20 px-4 bg-gradient-ontop-hero relative overflow-hidden">
        <!-- Subtle animated background -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-0 left-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse-slow"></div>
        </div>
        <!-- Logo -->
        <div class="relative z-10">
          <AppLogo size="md" :show-text="true" />
        </div>
      </div>
      
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <!-- Home -->
          <NuxtLink
            to="/"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path === '/' ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </NuxtLink>

          <!-- Divider -->
          <div class="py-2">
            <div class="border-t border-white/10"></div>
          </div>
          
          <!-- Feedback Analytics -->
          <NuxtLink
            to="/feedback"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path === '/feedback' ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Feedback Analytics
          </NuxtLink>
          
          <!-- Call Transcripts -->
          <NuxtLink
            to="/diio"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path === '/diio' ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Call Transcripts
          </NuxtLink>
          
          <!-- Zendesk Tickets -->
          <NuxtLink
            to="/zendesk"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path === '/zendesk' ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Zendesk Tickets
          </NuxtLink>

          <!-- Clients (Tickets + Transcripts) -->
          <NuxtLink
            to="/clients"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path === '/clients' ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Clients (Tickets + Transcripts)
          </NuxtLink>

          <!-- Divider -->
          <div class="py-2">
            <div class="border-t border-white/10"></div>
          </div>
          
          <!-- Advanced Analytics -->
          <NuxtLink
            to="/analytics"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group"
            :class="$route.path === '/analytics' ? 'bg-gradient-cta text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'"
          >
            <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Advanced Analytics
          </NuxtLink>
          
          <!-- Debug -->
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
            <p class="text-xs text-white/80 font-medium mb-2">Data Sources</p>
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <p class="text-xs text-white/60">Google Sheets</p>
                <div class="flex items-center">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span class="ml-1.5 text-xs text-green-400">Live</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <p class="text-xs text-white/60">DIIO Calls</p>
                <div class="flex items-center">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span class="ml-1.5 text-xs text-green-400">Ready</span>
                </div>
              </div>
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
          <AppLogo size="sm" :show-text="true" title="Ontop Analytics" :subtitle="null" />
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
