<template>
  <div>
    <!-- Force showing pages instead of welcome -->
    <NuxtPage />
  </div>
</template>

<script setup>
// Set favicon and app metadata
useHead({
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'shortcut icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/favicon.png' }
  ]
})

// Force dark mode on mount
onMounted(() => {
  document.documentElement.classList.add('dark')
})
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow border border-gray-200;
  }
  
  .metric-card {
    @apply bg-white rounded-lg shadow p-6 border border-gray-200;
  }
}
</style>
