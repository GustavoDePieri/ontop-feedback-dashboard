<template>
  <div v-if="error" class="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg backdrop-blur-sm">
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="flex-1">
        <p class="text-red-400 font-medium">{{ error.title || 'Error' }}</p>
        <p class="text-red-300 text-sm mt-1">{{ error.message }}</p>
        <div v-if="error.details" class="text-red-200 text-xs mt-2">
          <details>
            <summary class="cursor-pointer hover:text-red-100">Technical Details</summary>
            <pre class="mt-2 whitespace-pre-wrap">{{ error.details }}</pre>
          </details>
        </div>
      </div>
      <button
        @click="$emit('dismiss')"
        class="text-red-400 hover:text-red-300 transition-colors"
        aria-label="Dismiss error"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ErrorInfo {
  title?: string
  message: string
  details?: string
}

interface Props {
  error: ErrorInfo | null
}

defineProps<Props>()

defineEmits<{
  dismiss: []
}>()
</script>
