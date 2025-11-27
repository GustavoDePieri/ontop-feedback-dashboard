<template>
  <div class="min-h-screen bg-gradient-dark">
    <!-- Header -->
    <header class="bg-ontop-navy-dark border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb & Home Button -->
        <div class="pt-4 pb-2 flex items-center justify-between">
          <AppBreadcrumb :items="[{ label: 'Advanced Analytics' }]" />
          <NuxtLink 
            to="/"
            class="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200 group"
          >
            <svg class="w-4 h-4 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Home</span>
          </NuxtLink>
        </div>
        
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-white">
              Advanced Analytics
            </h1>
            <p class="mt-2 text-white/70">
              Deep insights and trend analysis
            </p>
          </div>
          
          <div class="flex space-x-3">
            <select class="bg-ontop-navy-dark/80 text-white border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ontop-pink-400 focus:border-ontop-pink-400 backdrop-blur-sm">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
            <button class="bg-gradient-cta hover:bg-gradient-cta-hover text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
              Export Report
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Average Sentiment Score -->
        <div class="bg-gradient-to-br from-ontop-purple-600/20 to-ontop-purple-800/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-ontop-purple-500/50 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-gradient-ontop-hero rounded-lg p-3">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </div>
          </div>
          <div class="text-sm font-medium text-white/70 mb-2">Avg Sentiment Score</div>
          <div class="flex items-baseline">
            <div class="text-3xl font-bold text-white">7.2</div>
            <div class="ml-2 text-sm font-medium text-white/50">/10</div>
          </div>
          <div class="mt-2 text-xs text-green-400">↑ 0.3 from last period</div>
        </div>

        <!-- Response Rate -->
        <div class="bg-gradient-to-br from-ontop-pink-600/20 to-ontop-pink-800/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-ontop-pink-500/50 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-gradient-cta rounded-lg p-3">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div class="text-sm font-medium text-white/70 mb-2">Response Rate</div>
          <div class="flex items-baseline">
            <div class="text-3xl font-bold text-white">84%</div>
          </div>
          <div class="mt-2 text-xs text-green-400">↑ +2.1% from last period</div>
        </div>

        <!-- Account Satisfaction -->
        <div class="bg-gradient-to-br from-ontop-coral-600/20 to-ontop-coral-800/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-ontop-coral-500/50 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-gradient-to-r from-ontop-coral-500 to-ontop-pink-500 rounded-lg p-3">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div class="text-sm font-medium text-white/70 mb-2">Account Satisfaction</div>
          <div class="flex items-baseline">
            <div class="text-3xl font-bold text-white">92%</div>
          </div>
          <div class="mt-2 text-xs text-green-400">↑ +5.2% from last period</div>
        </div>

        <!-- At-Risk Accounts -->
        <div class="bg-gradient-to-br from-orange-600/20 to-red-800/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-orange-500/50 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-3">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div class="text-sm font-medium text-white/70 mb-2">At-Risk Accounts</div>
          <div class="flex items-baseline">
            <div class="text-3xl font-bold text-white">3</div>
          </div>
          <div class="mt-2 text-xs text-red-400">↑ +1 new this period</div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Top Performing Accounts -->
        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-white">Top Performing Accounts</h3>
            <span class="text-xs text-white/50">Last 30 days</span>
          </div>
          
          <div class="space-y-4">
            <div v-for="(account, index) in topAccounts" :key="index" class="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 rounded-full bg-gradient-ontop-hero flex items-center justify-center text-white font-bold text-sm">
                  {{ account.initials }}
                </div>
                <div>
                  <div class="text-white font-medium">{{ account.name }}</div>
                  <div class="text-xs text-white/50">{{ account.manager }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-white font-semibold">{{ account.score }}%</div>
                <div class="text-xs text-green-400">↑ {{ account.change }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Feedback Trends -->
        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-white">Feedback Trends</h3>
            <span class="text-xs text-white/50">Last 30 days</span>
          </div>
          
          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-white/70">Positive Feedback</span>
                <span class="text-green-400 font-medium">98 (65%)</span>
              </div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-green-500 to-emerald-500" style="width: 65%"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-white/70">Neutral Feedback</span>
                <span class="text-yellow-400 font-medium">38 (25%)</span>
              </div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-yellow-500 to-amber-500" style="width: 25%"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-white/70">Negative Feedback</span>
                <span class="text-red-400 font-medium">15 (10%)</span>
              </div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-red-500 to-rose-500" style="width: 10%"></div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-white/10">
            <div class="text-sm text-white/70 mb-3">Top Categories</div>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-ontop-purple-500/20 text-ontop-purple-300 rounded-full text-xs border border-ontop-purple-500/30">Product Features</span>
              <span class="px-3 py-1 bg-ontop-pink-500/20 text-ontop-pink-300 rounded-full text-xs border border-ontop-pink-500/30">Support Quality</span>
              <span class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30">Pricing</span>
              <span class="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">Performance</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Manager Performance -->
      <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">Account Manager Performance</h3>
          <button class="text-sm text-ontop-purple-400 hover:text-ontop-purple-300 transition-colors">View All →</button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(manager, index) in managers" :key="index" class="p-5 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-ontop-purple-500/50">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-12 h-12 rounded-full bg-gradient-ontop-hero flex items-center justify-center text-white font-bold">
                {{ manager.initials }}
              </div>
              <div>
                <div class="text-white font-medium">{{ manager.name }}</div>
                <div class="text-xs text-white/50">{{ manager.accounts }} accounts</div>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-white/70">Satisfaction</span>
                <span class="text-white font-semibold">{{ manager.satisfaction }}%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-white/70">Response Time</span>
                <span class="text-white font-semibold">{{ manager.responseTime }}h</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-white/70">Feedback</span>
                <span :class="manager.feedbackTrend > 0 ? 'text-green-400' : 'text-red-400'" class="font-semibold">
                  {{ manager.feedbackTrend > 0 ? '↑' : '↓' }} {{ Math.abs(manager.feedbackTrend) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Notice -->
      <div class="mt-8 bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-white font-semibold mb-1">📊 Advanced Analytics</h4>
            <p class="text-white/60 text-sm">
              This page shows aggregated insights from your feedback data. 
              Go to <NuxtLink to="/feedback" class="text-ontop-purple-400 hover:text-ontop-purple-300 underline">Feedback Analytics</NuxtLink> 
              to see detailed real-time data and generate AI-powered reports. The visualizations above show sample data patterns for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Advanced Analytics - Ontop Analytics',
  meta: [
    { name: 'description', content: 'Deep insights and trend analysis' }
  ]
})

// Sample data
const topAccounts = ref([
  { name: 'Acme Corporation', manager: 'Nicholas Taylor', initials: 'AC', score: 98, change: 12 },
  { name: 'TechStart Inc', manager: 'Taylor Green', initials: 'TS', score: 95, change: 8 },
  { name: 'Global Systems', manager: 'Green Martin', initials: 'GS', score: 92, change: -5 },
])

const managers = ref([
  { name: 'Nicholas Taylor', initials: 'NT', accounts: 15, satisfaction: 98, responseTime: 2.3, feedbackTrend: 12 },
  { name: 'Taylor Green', initials: 'TG', accounts: 12, satisfaction: 95, responseTime: 3.1, feedbackTrend: 8 },
  { name: 'Green Martin', initials: 'GM', accounts: 18, satisfaction: 92, responseTime: 2.8, feedbackTrend: -5 },
])
</script>
