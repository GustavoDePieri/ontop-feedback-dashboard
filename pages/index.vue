<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Ontop Feedback Analytics
            </h1>
            <p class="mt-2 text-gray-600">
              Real-time insights from Salesforce feedback data
            </p>
          </div>
          
          <div class="flex space-x-3">
            <AppButton 
              @click="refreshData" 
              :loading="loading"
              variant="primary"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </AppButton>
            <AppButton 
              @click="testConnection"
              variant="secondary"
            >
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Test Connection
            </AppButton>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading && !feedbackData.length" class="flex justify-center py-12">
        <AppLoader message="Loading feedback data..." />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-md bg-red-50 p-4 mb-6">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading data</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="feedbackData.length > 0">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Feedback -->
          <AppCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Feedback
                  </dt>
                  <dd class="text-2xl font-bold text-gray-900">
                    {{ feedbackData.length }}
                  </dd>
                </dl>
              </div>
            </div>
          </AppCard>

          <!-- Positive Sentiment -->
          <AppCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Positive
                  </dt>
                  <dd class="text-2xl font-bold text-green-600">
                    {{ sentimentSummary.positive }}
                  </dd>
                  <dd class="text-sm text-gray-500">
                    {{ ((sentimentSummary.positive / sentimentSummary.totalItems) * 100).toFixed(1) }}%
                  </dd>
                </dl>
              </div>
            </div>
          </AppCard>

          <!-- Neutral Sentiment -->
          <AppCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Neutral
                  </dt>
                  <dd class="text-2xl font-bold text-yellow-600">
                    {{ sentimentSummary.neutral }}
                  </dd>
                  <dd class="text-sm text-gray-500">
                    {{ ((sentimentSummary.neutral / sentimentSummary.totalItems) * 100).toFixed(1) }}%
                  </dd>
                </dl>
              </div>
            </div>
          </AppCard>

          <!-- Negative Sentiment -->
          <AppCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Negative
                  </dt>
                  <dd class="text-2xl font-bold text-red-600">
                    {{ sentimentSummary.negative }}
                  </dd>
                  <dd class="text-sm text-gray-500">
                    {{ ((sentimentSummary.negative / sentimentSummary.totalItems) * 100).toFixed(1) }}%
                  </dd>
                </dl>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Sentiment Analysis Chart -->
          <AppCard>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">
                Sentiment Distribution
              </h3>
            </template>
            <SentimentChart :data="sentimentSummary" />
          </AppCard>

          <!-- Recent Feedback -->
          <AppCard>
            <template #header>
              <h3 class="text-lg font-medium text-gray-900">
                Recent Feedback
              </h3>
            </template>
            <div class="space-y-4">
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
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="text-sm text-gray-900 line-clamp-2">{{ item.feedback }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ item.accountName }} • {{ formatDate(item.createdDate) }}
                    </p>
                  </div>
                  <span 
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': item.sentiment === 'Positive',
                      'bg-yellow-100 text-yellow-800': item.sentiment === 'Neutral',
                      'bg-red-100 text-red-800': item.sentiment === 'Negative'
                    }"
                  >
                    {{ item.sentiment }}
                  </span>
                </div>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Data Freshness -->
        <div v-if="lastUpdated" class="text-center text-sm text-gray-500">
          Last updated: {{ formatDate(lastUpdated) }}
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No feedback data</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by connecting to your Google Sheets.</p>
        <div class="mt-6">
          <AppButton @click="testConnection" variant="primary">
            Test Google Sheets Connection
          </AppButton>
        </div>
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
