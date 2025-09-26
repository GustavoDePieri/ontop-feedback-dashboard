<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              🎉 Ontop Feedback Analytics
            </h1>
            <p class="mt-2 text-gray-600">
              Real-time insights from Salesforce feedback data
            </p>
          </div>
          
          <div class="flex space-x-3">
            <button 
              @click="refreshData" 
              :disabled="loading"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {{ loading ? 'Loading...' : 'Refresh Data' }}
            </button>
            <button 
              @click="testConnection"
              class="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Status Message -->
      <div class="mb-6 p-4 rounded-lg" :class="{
        'bg-blue-50 border border-blue-200': loading,
        'bg-red-50 border border-red-200': error,
        'bg-green-50 border border-green-200': !loading && !error && feedbackData.length > 0,
        'bg-yellow-50 border border-yellow-200': !loading && !error && feedbackData.length === 0
      }">
        <div v-if="loading" class="text-blue-800">
          🔄 Loading feedback data...
        </div>
        <div v-else-if="error" class="text-red-800">
          ❌ Error: {{ error }}
        </div>
        <div v-else-if="feedbackData.length > 0" class="text-green-800">
          ✅ Successfully loaded {{ feedbackData.length }} feedback items
        </div>
        <div v-else class="text-yellow-800">
          ⚠️ No feedback data found. Click "Test Connection" to check your Google Sheets connection.
        </div>
      </div>

      <!-- Simple Stats -->
      <div v-if="feedbackData.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-sm font-medium text-gray-500">Total Feedback</h3>
          <p class="text-2xl font-bold text-gray-900">{{ feedbackData.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-sm font-medium text-gray-500">Positive</h3>
          <p class="text-2xl font-bold text-green-600">{{ sentimentSummary.positive }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-sm font-medium text-gray-500">Neutral</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ sentimentSummary.neutral }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-sm font-medium text-gray-500">Negative</h3>
          <p class="text-2xl font-bold text-red-600">{{ sentimentSummary.negative }}</p>
        </div>
      </div>

      <!-- Recent Feedback -->
      <div v-if="feedbackData.length > 0" class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Recent Feedback</h3>
        </div>
        <div class="p-6 space-y-4">
          <div 
            v-for="item in recentFeedback" 
            :key="item.id"
            class="border-l-4 pl-4 py-2"
            :class="{
              'border-green-400': item.sentiment === 'Positive',
              'border-yellow-400': item.sentiment === 'Neutral',
              'border-red-400': item.sentiment === 'Negative'
            }"
          >
            <p class="text-sm text-gray-900">{{ item.feedback }}</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ item.accountName }} • {{ formatDate(item.createdDate) }} • 
              <span :class="{
                'text-green-600': item.sentiment === 'Positive',
                'text-yellow-600': item.sentiment === 'Neutral',
                'text-red-600': item.sentiment === 'Negative'
              }">{{ item.sentiment }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Data Freshness -->
      <div v-if="lastUpdated" class="text-center text-sm text-gray-500 mt-6">
        Last updated: {{ formatDate(lastUpdated) }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Dashboard - Ontop Feedback Analytics',
  meta: [
    { name: 'description', content: 'Real-time feedback analytics dashboard powered by Salesforce data' }
  ]
})

// Reactive data
const feedbackData = ref([])
const loading = ref(false)
const error = ref('')
const lastUpdated = ref(null)

// Computed data
const sentimentSummary = computed(() => {
  if (!feedbackData.value.length) {
    return { positive: 0, neutral: 0, negative: 0, totalItems: 0 }
  }
  
  const positive = feedbackData.value.filter(item => item.sentiment === 'Positive').length
  const neutral = feedbackData.value.filter(item => item.sentiment === 'Neutral').length
  const negative = feedbackData.value.filter(item => item.sentiment === 'Negative').length
  
  return {
    positive,
    neutral,
    negative,
    totalItems: feedbackData.value.length
  }
})

const recentFeedback = computed(() => 
  feedbackData.value
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5)
)

// Methods
const refreshData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/sheets/data')
    feedbackData.value = response.data || []
    lastUpdated.value = new Date()
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch data'
    console.error('Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

const testConnection = async () => {
  try {
    const result = await $fetch('/api/sheets/test')
    if (result.success) {
      alert('✅ Google Sheets connection successful!')
    } else {
      alert(`❌ Connection failed: ${result.message}`)
    }
  } catch (err: any) {
    alert(`❌ Connection test failed: ${err.message}`)
  }
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize data on mount
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
