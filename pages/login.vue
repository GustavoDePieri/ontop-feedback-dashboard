<template>
  <div class="min-h-screen bg-gradient-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto w-24 h-24 flex items-center justify-center rounded-2xl bg-gradient-ontop-hero p-4 shadow-glow-pink">
          <img src="/ontop-logo-ai.jpg" alt="Ontop Logo" class="w-full h-full object-contain rounded-xl" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          Ontop Feedback Analytics
        </h2>
        <p class="mt-2 text-center text-sm text-white/70">
          Enter password to access the dashboard
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-white/10 bg-white/5 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 focus:z-10 sm:text-sm"
              placeholder="Enter password"
              :disabled="loading"
            />
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !password"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-cta hover:bg-gradient-cta-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ontop-coral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg v-if="!loading" class="h-5 w-5 text-white/70 group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="animate-spin h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-xs text-white">
            Secure access to Ontop's feedback analytics dashboard
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Login - Ontop Feedback Analytics',
  meta: [
    { name: 'description', content: 'Secure login to access Ontop feedback analytics dashboard' }
  ]
})

// Define page layout
definePageMeta({
  layout: false // Don't use the default layout for login page
})

// Reactive data
const password = ref('')
const loading = ref(false)
const error = ref('')

// Methods
const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    if (password.value === 'Ontop#2025') {
      // Set authentication in localStorage and cookie
      if (process.client) {
        localStorage.setItem('ontop_authenticated', 'true')
        localStorage.setItem('ontop_auth_timestamp', Date.now().toString())
      }
      
      // Set cookie for server-side validation
      const authCookie = useCookie('ontop_auth', {
        default: () => false,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        secure: true,
        sameSite: 'strict'
      })
      authCookie.value = true

      // Redirect to dashboard
      await navigateTo('/')
    } else {
      error.value = 'Invalid password. Please try again.'
      password.value = ''
    }
  } catch (err) {
    error.value = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

// Auto-focus password input on mount
onMounted(() => {
  const passwordInput = document.getElementById('password')
  if (passwordInput) {
    passwordInput.focus()
  }
})
</script>
