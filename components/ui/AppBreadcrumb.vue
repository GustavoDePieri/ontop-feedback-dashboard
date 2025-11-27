<template>
  <nav class="flex items-center space-x-2 text-sm">
    <NuxtLink 
      to="/" 
      class="flex items-center text-white/60 hover:text-white transition-colors duration-200"
    >
      <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Home
    </NuxtLink>
    
    <template v-if="items && items.length > 0">
      <svg 
        v-for="(item, index) in items" 
        :key="`separator-${index}`"
        class="w-4 h-4 text-white/30" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      
      <template v-for="(item, index) in items" :key="`item-${index}`">
        <NuxtLink 
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="text-white/60 hover:text-white transition-colors duration-200"
        >
          {{ item.label }}
        </NuxtLink>
        <span 
          v-else
          class="text-white font-medium"
          :class="{ 'text-white/60': index < items.length - 1 }"
        >
          {{ item.label }}
        </span>
        
        <svg 
          v-if="index < items.length - 1" 
          class="w-4 h-4 text-white/30" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </template>
    </template>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

interface Props {
  items?: BreadcrumbItem[]
}

defineProps<Props>()
</script>

