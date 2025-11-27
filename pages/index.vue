<template>
  <div class="min-h-screen bg-gradient-dark">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-ontop-navy-dark border-b border-white/5">
      <!-- Animated Background -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 -left-4 w-96 h-96 bg-ontop-purple-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div class="absolute top-0 -right-4 w-96 h-96 bg-ontop-pink-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-20 w-96 h-96 bg-ontop-coral-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div class="text-center">
          <!-- Logo -->
          <div class="flex justify-center mb-6">
            <AppLogo size="xl" :show-text="false" :shadow="true" />
          </div>
          
          <h1 class="text-5xl sm:text-6xl font-bold text-white mb-4">
            Welcome to <span class="bg-gradient-ontop bg-clip-text text-transparent">Ontop Analytics</span>
          </h1>
          <p class="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            AI-powered customer intelligence platform. Choose a module below to get started.
          </p>

          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div v-if="loading" class="flex items-center justify-center h-12">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
              <template v-else>
                <div class="text-3xl font-bold text-white">{{ stats.totalFeedback }}</div>
                <div class="text-sm text-white/60">Total Feedback</div>
              </template>
            </div>
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div v-if="loading" class="flex items-center justify-center h-12">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
              <template v-else>
                <div class="text-3xl font-bold text-white">{{ stats.totalTranscripts }}</div>
                <div class="text-sm text-white/60">Call Transcripts</div>
              </template>
            </div>
            <div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div v-if="loading" class="flex items-center justify-center h-12">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
              <template v-else>
                <div class="text-3xl font-bold text-white">{{ stats.reportsGenerated }}</div>
                <div class="text-sm text-white/60">Reports Generated</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Cards Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Feedback Analytics Card -->
        <NuxtLink 
          to="/feedback"
          class="group relative bg-gradient-to-br from-ontop-purple-600/20 to-ontop-purple-800/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-ontop-purple-500/50 transition-all duration-300 hover:shadow-glow hover:scale-105"
        >
          <div class="absolute inset-0 bg-gradient-ontop opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
          
          <div class="relative z-10">
            <div class="bg-gradient-ontop-hero rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-ontop-purple-300 transition-colors">
              Feedback Analytics
            </h3>
            <p class="text-white/60 mb-4">
              Real-time customer feedback analysis with AI-powered insights and sentiment tracking
            </p>
            
            <div class="flex items-center text-ontop-purple-400 font-medium">
              <span>Open Dashboard</span>
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            <div class="mt-4 pt-4 border-t border-white/10">
              <div class="flex items-center space-x-4 text-sm text-white/50">
                <span>📊 Metrics</span>
                <span>🎯 Sentiment</span>
                <span>🤖 AI Reports</span>
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- DIIO Transcripts Card -->
        <NuxtLink 
          to="/diio"
          class="group relative bg-gradient-to-br from-ontop-pink-600/20 to-ontop-pink-800/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-ontop-pink-500/50 transition-all duration-300 hover:shadow-glow-pink hover:scale-105"
        >
          <div class="absolute inset-0 bg-gradient-cta opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
          
          <div class="relative z-10">
            <div class="bg-gradient-cta rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            
            <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-ontop-pink-300 transition-colors">
              Call Transcripts
            </h3>
            <p class="text-white/60 mb-4">
              Access and analyze customer call recordings with AI sentiment analysis and churn detection
            </p>
            
            <div class="flex items-center text-ontop-pink-400 font-medium">
              <span>View Transcripts</span>
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            <div class="mt-4 pt-4 border-t border-white/10">
              <div class="flex items-center space-x-4 text-sm text-white/50">
                <span>📞 Calls</span>
                <span>💬 Meetings</span>
                <span>⚠️ Churn Risk</span>
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- Reports Card -->
        <NuxtLink 
          to="/reports"
          class="group relative bg-gradient-to-br from-ontop-coral-600/20 to-ontop-coral-800/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-ontop-coral-500/50 transition-all duration-300 hover:shadow-glow-pink hover:scale-105"
        >
          <div class="absolute inset-0 bg-gradient-cta opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
          
          <div class="relative z-10">
            <div class="bg-gradient-to-r from-ontop-coral-500 to-ontop-pink-500 rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-ontop-coral-300 transition-colors">
              Reports
            </h3>
            <p class="text-white/60 mb-4">
              Generate comprehensive intelligence reports with AI insights and export capabilities
            </p>
            
            <div class="flex items-center text-ontop-coral-400 font-medium">
              <span>Generate Reports</span>
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            <div class="mt-4 pt-4 border-t border-white/10">
              <div class="flex items-center space-x-4 text-sm text-white/50">
                <span>📄 PDF</span>
                <span>📊 Analytics</span>
                <span>📧 Export</span>
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- Advanced Analytics Card -->
        <NuxtLink 
          to="/analytics"
          class="group relative bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:shadow-glow hover:scale-105"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
          
          <div class="relative z-10">
            <div class="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
              Advanced Analytics
            </h3>
            <p class="text-white/60 mb-4">
              Deep dive into trends, patterns, and correlations with advanced visualization tools
            </p>
            
            <div class="flex items-center text-blue-400 font-medium">
              <span>View Analytics</span>
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            <div class="mt-4 pt-4 border-t border-white/10">
              <div class="flex items-center space-x-4 text-sm text-white/50">
                <span>📈 Trends</span>
                <span>💰 Revenue</span>
                <span>👥 Teams</span>
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- Quick Actions Card -->
        <div class="group relative bg-gradient-to-br from-green-600/20 to-emerald-800/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300">
          <div class="relative z-10">
            <div class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h3 class="text-2xl font-bold text-white mb-4">
              Quick Actions
            </h3>
            
            <div class="space-y-3">
              <button 
                @click="refreshAllData"
                :disabled="refreshing"
                class="w-full bg-white/5 hover:bg-white/10 text-white rounded-lg px-4 py-3 text-left transition-all duration-200 flex items-center justify-between group/btn"
              >
                <span class="flex items-center">
                  <svg class="w-5 h-5 mr-3" :class="{'animate-spin': refreshing}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh All Data
                </span>
                <svg class="w-4 h-4 text-white/50 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <NuxtLink 
                to="/test"
                class="w-full bg-white/5 hover:bg-white/10 text-white rounded-lg px-4 py-3 text-left transition-all duration-200 flex items-center justify-between group/btn"
              >
                <span class="flex items-center">
                  <svg class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  System Debug
                </span>
                <svg class="w-4 h-4 text-white/50 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Data Sources Status Card -->
        <div class="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div class="relative z-10">
            <div class="bg-gradient-to-r from-gray-500 to-gray-700 rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-4 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            
            <h3 class="text-2xl font-bold text-white mb-4">
              Data Sources
            </h3>
            
            <div class="space-y-3">
              <div class="bg-white/5 rounded-lg p-3 border border-white/10">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                    <span class="text-white font-medium">Google Sheets</span>
                  </div>
                  <span class="text-xs text-green-400">Connected</span>
                </div>
              </div>

              <div class="bg-white/5 rounded-lg p-3 border border-white/10">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                    <span class="text-white font-medium">DIIO API</span>
                  </div>
                  <span class="text-xs text-green-400">Connected</span>
                </div>
              </div>

              <div class="bg-white/5 rounded-lg p-3 border border-white/10">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                    <span class="text-white font-medium">Gemini AI</span>
                  </div>
                  <span class="text-xs text-green-400">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Footer Info -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-ontop-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-white font-semibold mb-1">💡 Getting Started</h4>
            <p class="text-white/60 text-sm">
              Choose any module above to begin. <strong>Feedback Analytics</strong> provides real-time customer insights, 
              <strong>Call Transcripts</strong> analyzes recorded conversations, and <strong>Reports</strong> generates comprehensive intelligence documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page metadata
useHead({
  title: 'Home - Ontop Analytics',
  meta: [
    { name: 'description', content: 'AI-powered customer intelligence platform' }
  ]
})

// State
const refreshing = ref(false)
const loading = ref(true)
const stats = ref({
  totalFeedback: '---',
  totalTranscripts: '---',
  reportsGenerated: '---'
})

// Fetch real stats on mount
onMounted(async () => {
  try {
    loading.value = true
    
    // Fetch stats from our dedicated stats API
    const response = await fetch('/api/stats')
    const data = await response.json()
    
    if (data.success) {
      stats.value = {
        totalFeedback: data.feedbackCount?.toLocaleString() || '0',
        totalTranscripts: data.transcriptCount?.toLocaleString() || '0',
        reportsGenerated: data.reportsCount?.toLocaleString() || '0'
      }
    } else {
      // Show zeros if API fails
      stats.value = {
        totalFeedback: '0',
        totalTranscripts: '0',
        reportsGenerated: '0'
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Show zeros instead of placeholder on error
    stats.value = {
      totalFeedback: '0',
      totalTranscripts: '0',
      reportsGenerated: '0'
    }
  } finally {
    loading.value = false
  }
})

// Refresh all data
const refreshAllData = async () => {
  refreshing.value = true
  try {
    // Fetch fresh stats
    const response = await fetch('/api/stats')
    const data = await response.json()
    
    if (data.success) {
      stats.value = {
        totalFeedback: data.feedbackCount?.toLocaleString() || '0',
        totalTranscripts: data.transcriptCount?.toLocaleString() || '0',
        reportsGenerated: data.reportsCount?.toLocaleString() || '0'
      }
      console.log('✅ Data refreshed successfully!')
    } else {
      console.error('Failed to refresh data:', data.error)
    }
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    refreshing.value = false
  }
}
</script>

<style scoped>
@keyframes blob {
  0%, 100% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>

