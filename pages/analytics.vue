<template>
  <div class="min-h-screen bg-transparent">
    <!-- Header -->
    <header class="bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-white">
              Advanced Analytics
            </h1>
            <p class="mt-2 text-white/80">
              Deep insights and trend analysis
            </p>
          </div>
          
          <div class="flex space-x-3">
            <select class="bg-white/10 text-white placeholder-gray-300 border border-white/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ontop-pink-400">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
            <AppButton variant="primary" size="md">Export Report</AppButton>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Advanced Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Average Sentiment Score -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-ontop-purple-600 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-white/70 truncate">Avg Sentiment Score</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-white">7.2</div>
                    <div class="ml-2 text-sm font-medium text-green-400">/10</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Response Rate -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-ontop-purple-700 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-white/70 truncate">Response Rate</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-white">84%</div>
                    <div class="ml-2 text-sm font-medium text-green-400">+2.1%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Account Satisfaction -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-ontop-pink-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-white/70 truncate">Account Satisfaction</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-white">92%</div>
                    <div class="ml-2 text-sm font-medium text-green-400">+5.2%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Risk Accounts -->
        <AppCard>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-white/70 truncate">At-Risk Accounts</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-white">3</div>
                    <div class="ml-2 text-sm font-medium text-red-400">+1</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Advanced Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Sentiment Trends Over Time -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-white mb-4">Sentiment Trends</h3>
            <div class="h-64 flex items-center justify-center text-white/50">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-white">Time Series Analysis</h3>
                <p class="mt-1 text-sm text-white/70">Sentiment evolution over time</p>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Topic Distribution -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-white mb-4">Topic Distribution</h3>
            <div class="h-64 flex items-center justify-center text-white/50">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-white">Topic Modeling</h3>
                <p class="mt-1 text-sm text-white/70">Key themes and categories</p>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Account Analysis -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Top Performing Accounts -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-white mb-4">Top Performing Accounts</h3>
            <div class="space-y-4">
              <div v-for="account in topPerformingAccounts" :key="account.name" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 h-8 w-8 bg-white/10 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-white">{{ account.name.charAt(0) }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{{ account.name }}</p>
                    <p class="text-xs text-white/60">{{ account.feedback_count }} feedback</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-green-400">{{ account.satisfaction }}%</p>
                  <p class="text-xs text-white/60">satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- At-Risk Accounts -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-white mb-4">At-Risk Accounts</h3>
            <div class="space-y-4">
              <div v-for="account in riskAccounts" :key="account.name" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-red-800">{{ account.name.charAt(0) }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{{ account.name }}</p>
                    <p class="text-xs text-white/60">{{ account.risk_reason }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-red-600">{{ account.risk_score }}%</p>
                  <p class="text-xs text-white/60">risk</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Trending Topics -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-white mb-4">Trending Topics</h3>
            <div class="space-y-4">
              <div v-for="topic in trendingTopics" :key="topic.name" class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-white">{{ topic.name }}</p>
                  <p class="text-xs text-white/60">{{ topic.mentions }} mentions</p>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="flex items-center">
                    <svg v-if="topic.trend === 'up'" class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <svg v-else class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-xs font-medium" :class="topic.trend === 'up' ? 'text-green-600' : 'text-red-600'">
                      {{ topic.change }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Insights and Recommendations -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- AI Insights -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-white mb-4">AI-Powered Insights</h3>
            <div class="space-y-4">
              <div v-for="insight in aiInsights" :key="insight.id" class="border-l-4 pl-4 py-2" :class="{
                'border-green-400': insight.type === 'positive',
                'border-yellow-400': insight.type === 'warning',
                'border-red-400': insight.type === 'alert'
              }">
                <p class="text-sm font-medium text-white">{{ insight.title }}</p>
                <p class="text-xs text-white/80 mt-1">{{ insight.description }}</p>
                <p class="text-xs text-white/60 mt-2">Confidence: {{ insight.confidence }}%</p>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Recommendations -->
        <AppCard>
          <div class="p-6">
            <h3 class="text-lg font-medium text-white mb-4">Recommended Actions</h3>
            <div class="space-y-4">
              <div v-for="recommendation in recommendations" :key="recommendation.id" class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="{
                    'bg-red-100': recommendation.priority === 'high',
                    'bg-yellow-100': recommendation.priority === 'medium',
                    'bg-green-100': recommendation.priority === 'low'
                  }">
                    <div class="w-2 h-2 rounded-full" :class="{
                      'bg-red-500': recommendation.priority === 'high',
                      'bg-yellow-500': recommendation.priority === 'medium',
                      'bg-green-500': recommendation.priority === 'low'
                    }"></div>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-white">{{ recommendation.title }}</p>
                  <p class="text-xs text-white/80 mt-1">{{ recommendation.description }}</p>
                  <p class="text-xs text-white/60 mt-2">Expected impact: {{ recommendation.impact }}</p>
                </div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Advanced Analytics - Ontop Feedback Analytics',
  meta: [
    { name: 'description', content: 'Advanced analytics and insights for customer feedback data' }
  ]
})

// Mock data for advanced analytics
const topPerformingAccounts = ref([
  { name: 'Gallant Luxury Service', satisfaction: 98, feedback_count: 45 },
  { name: 'Somerville YMCA', satisfaction: 95, feedback_count: 32 },
  { name: 'Kirafin.ai', satisfaction: 92, feedback_count: 28 },
  { name: 'Pagos Asap', satisfaction: 89, feedback_count: 23 }
])

const riskAccounts = ref([
  { name: 'NUBIRAL COL S.A.S', risk_score: 75, risk_reason: 'Declining sentiment' },
  { name: 'Tech Solutions Inc', risk_score: 68, risk_reason: 'Low response rate' },
  { name: 'Global Services Ltd', risk_score: 62, risk_reason: 'Negative feedback spike' }
])

const trendingTopics = ref([
  { name: 'Platform Usability', mentions: 234, trend: 'up', change: 12 },
  { name: 'Payment Processing', mentions: 189, trend: 'up', change: 8 },
  { name: 'Customer Support', mentions: 156, trend: 'down', change: -5 },
  { name: 'Integration Issues', mentions: 98, trend: 'up', change: 15 }
])

const aiInsights = ref([
  {
    id: 1,
    type: 'positive',
    title: 'Positive Sentiment Spike',
    description: 'Customer satisfaction increased by 15% after recent platform updates',
    confidence: 92
  },
  {
    id: 2,
    type: 'warning',
    title: 'Topic Shift Detected',
    description: 'Increasing mentions of "integration challenges" - worth monitoring',
    confidence: 87
  },
  {
    id: 3,
    type: 'alert',
    title: 'Account Risk Alert',
    description: 'NUBIRAL COL S.A.S showing declining engagement patterns',
    confidence: 94
  }
])

const recommendations = ref([
  {
    id: 1,
    priority: 'high',
    title: 'Proactive Account Management',
    description: 'Reach out to at-risk accounts within 48 hours',
    impact: 'Reduce churn by 25%'
  },
  {
    id: 2,
    priority: 'medium',
    title: 'Feature Enhancement',
    description: 'Address top integration pain points mentioned in feedback',
    impact: 'Improve satisfaction by 10%'
  },
  {
    id: 3,
    priority: 'low',
    title: 'Documentation Update',
    description: 'Create guides for frequently asked questions',
    impact: 'Reduce support tickets by 15%'
  }
])
</script>
