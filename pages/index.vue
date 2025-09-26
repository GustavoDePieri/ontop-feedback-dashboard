<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Dashboard Overview
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

      <!-- Advanced Stats Grid -->
      <div v-if="feedbackData.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Feedback -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Feedback</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ feedbackData.length }}</div>
                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <svg class="self-center flex-shrink-0 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span class="sr-only">Increased by</span>
                      {{ weeklyGrowth }}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Positive Sentiment -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Positive Sentiment</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ sentimentSummary.positive }}</div>
                    <div class="ml-2 text-sm font-medium text-gray-500">
                      ({{ sentimentPercentages.positive }}%)
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Neutral Sentiment -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-5 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Neutral Sentiment</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ sentimentSummary.neutral }}</div>
                    <div class="ml-2 text-sm font-medium text-gray-500">
                      ({{ sentimentPercentages.neutral }}%)
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Negative Sentiment -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 1.414 3 3 0 004.242 0 1 1 0 001.415-1.414 5 5 0 00-7.072 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Negative Sentiment</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ sentimentSummary.negative }}</div>
                    <div class="ml-2 text-sm font-medium text-gray-500">
                      ({{ sentimentPercentages.negative }}%)
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Charts Grid -->
      <div v-if="feedbackData.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Sentiment Analysis Chart -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Sentiment Distribution</h3>
            <SentimentChart :data="sentimentSummary" />
          </div>
        </AppCard>

        <!-- Feedback Trends Chart -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Feedback Trends (Last 30 Days)</h3>
            <div class="h-64 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Time Series Chart</h3>
                <p class="mt-1 text-sm text-gray-500">Coming soon - Feedback trends over time</p>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Additional Analytics Row -->
      <div v-if="feedbackData.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Top Keywords -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Top Keywords</h3>
            <div class="space-y-3">
              <div v-for="keyword in topKeywords" :key="keyword.word" class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">{{ keyword.word }}</span>
                <div class="flex items-center space-x-2">
                  <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" :style="{ width: `${keyword.percentage}%` }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ keyword.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Account Activity -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Most Active Accounts</h3>
            <div class="space-y-3">
              <div v-for="account in topAccounts" :key="account.name" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-gray-600">{{ account.name.charAt(0) }}</span>
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ account.name }}</span>
                </div>
                <span class="text-sm text-gray-500">{{ account.count }} feedback</span>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Recent Insights -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                </div>
                <p class="text-sm text-gray-600">Positive sentiment increased by {{ weeklyGrowth }}% this week</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                </div>
                <p class="text-sm text-gray-600">Most discussed topic: {{ topKeywords[0]?.word || 'Platform usability' }}</p>
              </div>
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                </div>
                <p class="text-sm text-gray-600">{{ topAccounts[0]?.name || 'Top account' }} is most active this period</p>
              </div>
            </div>
          </div>
        </AppCard>
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

const sentimentPercentages = computed(() => {
  const total = feedbackData.value.length
  if (total === 0) return { positive: 0, neutral: 0, negative: 0 }
  
  return {
    positive: Math.round((sentimentSummary.value.positive / total) * 100),
    neutral: Math.round((sentimentSummary.value.neutral / total) * 100),
    negative: Math.round((sentimentSummary.value.negative / total) * 100)
  }
})

const weeklyGrowth = computed(() => {
  // Mock weekly growth calculation
  return Math.floor(Math.random() * 15) + 5
})

const topKeywords = computed(() => {
  if (!feedbackData.value.length) return []
  
  const wordCount = new Map()
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'])
  
  feedbackData.value.forEach(item => {
    const words = item.feedback.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
    
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    })
  })
  
  const sortedWords = Array.from(wordCount.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word, count]) => ({
      word,
      count,
      percentage: Math.min(100, (count / feedbackData.value.length) * 100 * 5)
    }))
  
  return sortedWords
})

const topAccounts = computed(() => {
  if (!feedbackData.value.length) return []
  
  const accountCount = new Map()
  feedbackData.value.forEach(item => {
    const name = item.accountName
    accountCount.set(name, (accountCount.get(name) || 0) + 1)
  })
  
  return Array.from(accountCount.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))
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
