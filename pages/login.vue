<template>
  <div class="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="card p-8 animate-scale-in">
        <div class="text-center">
          <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl gradient-primary shadow-soft-lg">
            <svg class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="mt-6 text-3xl font-bold text-secondary-900 dark:text-white">
            Welcome Back
          </h2>
          <p class="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
            Sign in to access your Ontop Analytics dashboard
          </p>
        </div>
      
        <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
          <div>
            <label for="password" class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="input"
              placeholder="Enter your password"
              :disabled="loading"
            />
          </div>

          <div v-if="error" class="rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 p-4 animate-slide-down">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-danger-600 dark:text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-danger-800 dark:text-danger-200">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading || !password"
              class="btn btn-primary btn-lg w-full"
            >
              <span v-if="!loading" class="flex items-center justify-center">
                <svg class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                Sign In
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            </button>
          </div>

          <div class="text-center pt-2">
            <p class="text-xs text-secondary-500 dark:text-secondary-400">
              🔒 Secure access to your analytics dashboard
            </p>
          </div>
        </form>
      </div>
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
