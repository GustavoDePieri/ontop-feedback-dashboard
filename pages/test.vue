<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-blue-600">
      🎉 Nuxt.js Dashboard is Working!
    </h1>
    <p class="mt-4 text-gray-600">
      If you can see this page, the routing is working correctly.
    </p>
    <div class="mt-6">
      <NuxtLink to="/" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Go to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Test Page - Ontop Feedback Analytics'
})
</script>
