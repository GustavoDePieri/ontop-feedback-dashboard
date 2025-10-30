<template>
  <div class="space-y-4">
    <div v-for="i in count" :key="i" class="bg-white/5 rounded-lg p-4 border border-white/10 animate-pulse">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <!-- Title skeleton -->
          <div class="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
          <!-- Date skeleton -->
          <div class="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
          <!-- Attendees skeleton -->
          <div class="space-y-2">
            <div class="h-3 bg-gray-700 rounded w-1/4"></div>
            <div class="space-y-1">
              <div class="h-3 bg-gray-700 rounded w-1/3"></div>
              <div class="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        <!-- Status and button skeleton -->
        <div class="flex items-center gap-2">
          <div class="h-6 bg-gray-700 rounded w-16"></div>
          <div class="h-8 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 5
})
</script>
