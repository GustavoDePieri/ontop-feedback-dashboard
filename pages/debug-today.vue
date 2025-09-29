<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Today's Feedback Debug</h1>
      
      <!-- Current Date Info -->
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Current Date Information</h2>
        <div class="space-y-2 text-sm">
          <p><strong>Client Date:</strong> {{ new Date().toLocaleDateString() }}</p>
          <p><strong>Client DateTime:</strong> {{ new Date().toLocaleString() }}</p>
          <p><strong>Client ISO:</strong> {{ new Date().toISOString() }}</p>
          <p><strong>Today Start:</strong> {{ todayStart.toISOString() }}</p>
          <p><strong>Today End:</strong> {{ todayEnd.toISOString() }}</p>
        </div>
      </div>

      <!-- Data Loading Status -->
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Data Status</h2>
        <div v-if="loading" class="text-blue-600">Loading...</div>
        <div v-else-if="error" class="text-red-600">Error: {{ error }}</div>
        <div v-else class="space-y-2">
          <p><strong>Total Feedback Items:</strong> {{ feedbackData.length }}</p>
          <p><strong>Today's Feedback Count:</strong> {{ todaysFeedback.length }}</p>
        </div>
      </div>

      <!-- Today's Feedback Items -->
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Today's Feedback Items</h2>
        <div v-if="todaysFeedback.length === 0" class="text-gray-500">
          No feedback found for today
        </div>
        <div v-else class="space-y-4">
          <div 
            v-for="(item, index) in todaysFeedback" 
            :key="item.id"
            class="border border-green-200 rounded-lg p-4 bg-green-50"
          >
            <div class="space-y-2">
              <p><strong>Account:</strong> {{ item.accountName }}</p>
              <p><strong>Raw Date:</strong> {{ item.createdDate }}</p>
              <p><strong>Parsed Date:</strong> {{ new Date(item.createdDate).toLocaleString() }}</p>
              <p><strong>Feedback:</strong> {{ item.feedback.substring(0, 100) }}...</p>
              <p><strong>Sentiment:</strong> {{ item.sentiment }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- All Recent Items (for debugging) -->
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Recent Items (Last 10)</h2>
        <div class="space-y-3">
          <div 
            v-for="(item, index) in recentItems" 
            :key="item.id"
            class="border rounded-lg p-3"
            :class="{
              'border-green-400 bg-green-50': isToday(item.createdDate),
              'border-gray-200 bg-gray-50': !isToday(item.createdDate)
            }"
          >
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <strong>{{ item.accountName }}</strong><br>
                <span class="text-xs text-gray-500">{{ item.accountOwner }}</span>
              </div>
              <div>
                <strong>Date:</strong> {{ new Date(item.createdDate).toLocaleDateString() }}<br>
                <span class="text-xs">{{ new Date(item.createdDate).toLocaleTimeString() }}</span><br>
                <span class="text-xs font-mono">{{ item.createdDate }}</span>
              </div>
              <div>
                <strong>Is Today:</strong> {{ isToday(item.createdDate) ? 'YES' : 'NO' }}<br>
                <span class="text-xs">{{ item.sentiment }}</span>
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-700">{{ item.feedback.substring(0, 150) }}...</p>
          </div>
        </div>
      </div>

      <!-- Refresh Button -->
      <div class="mt-6 text-center">
        <button 
          @click="refreshData"
          :disabled="loading"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {{ loading ? 'Loading...' : 'Refresh Data' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FeedbackItem } from '~/types/feedback'

// Page metadata
definePageMeta({
  title: 'Debug Today\'s Feedback'
})

// Reactive data
const feedbackData = ref<FeedbackItem[]>([])
const loading = ref(false)
const error = ref('')

// Current date calculations
const today = new Date()
const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

// Computed properties
const todaysFeedback = computed(() => {
  if (!feedbackData.value.length) return []
  
  return feedbackData.value.filter((item) => {
    const itemDate = new Date(item.createdDate)
    const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    return itemDateOnly.getTime() === todayOnly.getTime()
  }).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
})

const recentItems = computed(() => {
  return feedbackData.value
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 10)
})

// Helper functions
const isToday = (date: string | Date) => {
  const itemDate = new Date(date)
  const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  return itemDateOnly.getTime() === todayOnly.getTime()
}

// Methods
const refreshData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('🔄 Fetching data from API...')
    const response = await $fetch('/api/sheets/data')
    console.log('📊 API Response:', response)
    
    feedbackData.value = response.data || []
    console.log(`✅ Loaded ${feedbackData.value.length} items`)
    
    // Log first few items for debugging
    feedbackData.value.slice(0, 3).forEach((item, index) => {
      console.log(`Item ${index}:`, {
        accountName: item.accountName,
        createdDate: item.createdDate,
        parsedDate: new Date(item.createdDate).toLocaleDateString(),
        isToday: isToday(item.createdDate),
        feedback: item.feedback.substring(0, 50) + '...'
      })
    })
    
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch data'
    console.error('❌ Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  refreshData()
})
</script>
