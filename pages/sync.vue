<template>
  <div class="min-h-screen bg-gradient-dark p-6">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">
          Client ID Sync
        </h1>
        <p class="text-white/60">
          Automatically sync Client IDs from Salesforce for all transcripts
        </p>
      </div>

      <!-- Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Transcripts -->
        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-white/60 text-sm">Total Transcripts</span>
            <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-white">
            {{ loading ? '...' : stats.total.toLocaleString() }}
          </div>
        </div>

        <!-- With Client ID -->
        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-white/60 text-sm">With Client ID</span>
            <svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-white">
            {{ loading ? '...' : stats.withClientId.toLocaleString() }}
          </div>
          <div class="mt-2 text-sm text-green-400">
            {{ loading ? '...' : ((stats.withClientId / stats.total) * 100).toFixed(1) }}% complete
          </div>
        </div>

        <!-- Missing Client ID -->
        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-white/60 text-sm">Missing Client ID</span>
            <svg class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="text-3xl font-bold text-white">
            {{ loading ? '...' : stats.missing.toLocaleString() }}
          </div>
          <div class="mt-2 text-sm text-yellow-400">
            Need to sync
          </div>
        </div>
      </div>

      <!-- Sync Control -->
      <div class="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-white mb-2">
              {{ syncing ? 'Sync in Progress...' : 'Ready to Sync' }}
            </h3>
            <p class="text-white/60 mb-4">
              {{ syncing 
                ? 'Processing transcripts and fetching Client IDs from Salesforce...' 
                : stats.missing > 0
                  ? `${stats.missing.toLocaleString()} transcripts need Client IDs`
                  : 'All transcripts have Client IDs!' 
              }}
            </p>
            
            <!-- Progress Bar -->
            <div v-if="syncing || syncResult" class="mb-4">
              <div class="flex items-center justify-between text-sm text-white/60 mb-2">
                <span>{{ progressInfo.currentStep || 'Processing...' }}</span>
                <span>{{ progressInfo.transcriptsProcessed || 0 }} / {{ stats.missing }}</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  :style="{ width: `${Math.min((progressInfo.transcriptsProcessed || 0) / Math.max(stats.missing, 1) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
            
            <!-- Detailed Progress Info -->
            <div v-if="syncing && progressInfo.isRunning" class="bg-white/5 rounded-lg p-4 mb-4">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div class="text-xs text-white/50 mb-1">Current Batch</div>
                  <div class="text-lg font-bold text-white">{{ progressInfo.currentBatch || 0 }}</div>
                </div>
                <div>
                  <div class="text-xs text-white/50 mb-1">Emails Extracted</div>
                  <div class="text-lg font-bold text-green-400">{{ progressInfo.emailsExtracted || 0 }}</div>
                </div>
                <div>
                  <div class="text-xs text-white/50 mb-1">Client IDs Found</div>
                  <div class="text-lg font-bold text-blue-400">{{ progressInfo.clientIdsMatched || 0 }}</div>
                </div>
                <div>
                  <div class="text-xs text-white/50 mb-1">Transcripts Updated</div>
                  <div class="text-lg font-bold text-purple-400">{{ progressInfo.transcriptsUpdated || 0 }}</div>
                </div>
              </div>
              
              <div v-if="progressInfo.errors > 0" class="mt-2">
                <div class="text-xs text-white/50 mb-1">Errors</div>
                <div class="text-sm font-semibold text-yellow-400">{{ progressInfo.errors }}</div>
              </div>
              
              <!-- Recent Activity Log -->
              <div v-if="progressInfo.recentLogs && progressInfo.recentLogs.length > 0" class="mt-4 pt-4 border-t border-white/10">
                <div class="text-xs text-white/50 mb-2">Recent Activity</div>
                <div class="max-h-32 overflow-y-auto space-y-1">
                  <div 
                    v-for="(log, idx) in progressInfo.recentLogs.slice().reverse()" 
                    :key="idx"
                    class="text-xs text-white/70 font-mono"
                  >
                    {{ log }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Last Sync Info -->
            <div v-if="!syncing && lastSync" class="flex items-center text-sm text-white/50">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last sync: {{ lastSync }}
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button
              @click="runSync"
              :disabled="syncing || stats.missing === 0"
              class="bg-gradient-ontop hover:opacity-90 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
            >
              <svg 
                v-if="syncing"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg 
                v-else
                class="w-5 h-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ syncing ? 'Syncing...' : stats.missing === 0 ? 'All Synced' : 'Run Sync' }}
            </button>

            <button
              @click="loadStats"
              :disabled="loading || syncing"
              class="bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg 
                class="w-5 h-5 mr-2" 
                :class="{ 'animate-spin': loading }"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Stats
            </button>
          </div>
        </div>
      </div>

      <!-- Sync Result -->
      <div 
        v-if="syncResult" 
        class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8"
      >
        <div class="flex items-start">
          <svg 
            v-if="syncResult.success" 
            class="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-0.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg 
            v-else 
            class="w-6 h-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <h4 class="text-white font-semibold mb-2">{{ syncResult.success ? 'Sync Completed' : 'Sync Failed' }}</h4>
            <p class="text-white/60 text-sm mb-4">{{ syncResult.message }}</p>
            
            <div v-if="syncResult.summary" class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div class="text-2xl font-bold text-white">{{ syncResult.summary.transcriptsProcessed }}</div>
                <div class="text-xs text-white/50">Processed</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-400">{{ syncResult.summary.clientIdsMatched }}</div>
                <div class="text-xs text-white/50">Matched</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-blue-400">{{ syncResult.summary.transcriptsUpdated }}</div>
                <div class="text-xs text-white/50">Updated</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-yellow-400">{{ syncResult.summary.errors }}</div>
                <div class="text-xs text-white/50">Errors</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works -->
      <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h3 class="text-xl font-bold text-white mb-4">How It Works</h3>
        <div class="space-y-4">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
              <span class="text-purple-400 font-bold">1</span>
            </div>
            <div>
              <div class="text-white font-medium">Find Transcripts</div>
              <div class="text-white/60 text-sm">Identifies transcripts missing Client IDs</div>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center mr-3">
              <span class="text-pink-400 font-bold">2</span>
            </div>
            <div>
              <div class="text-white font-medium">Extract Emails</div>
              <div class="text-white/60 text-sm">Extracts customer emails from transcript attendees</div>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
              <span class="text-purple-400 font-bold">3</span>
            </div>
            <div>
              <div class="text-white font-medium">Query Salesforce</div>
              <div class="text-white/60 text-sm">Sends emails to n8n workflow → Salesforce lookup</div>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center mr-3">
              <span class="text-pink-400 font-bold">4</span>
            </div>
            <div>
              <div class="text-white font-medium">Update Database</div>
              <div class="text-white/60 text-sm">Updates transcripts with Client IDs and account names</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Client ID Sync - Ontop Analytics',
})

// State
const loading = ref(false)
const syncing = ref(false)
const syncResult = ref<any>(null)
const lastSync = ref<string | null>(null)

const stats = ref({
  total: 0,
  withClientId: 0,
  missing: 0
})

const syncProgress = ref({
  processed: 0,
  total: 0
})

const progressInfo = ref({
  isRunning: false,
  currentBatch: 0,
  totalBatches: 0,
  transcriptsProcessed: 0,
  emailsExtracted: 0,
  clientIdsMatched: 0,
  transcriptsUpdated: 0,
  errors: 0,
  currentStep: '',
  lastActivity: '',
  recentLogs: [] as string[]
})

let progressPollInterval: NodeJS.Timeout | null = null

// Load stats
const loadStats = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/transcripts/stats')
    const data = await response.json()
    
    stats.value = {
      total: data.total || 0,
      withClientId: data.withClientId || 0,
      missing: data.missing || 0
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    loading.value = false
  }
}

// Poll progress updates
const pollProgress = async () => {
  try {
    const response = await fetch('/api/transcripts/sync-progress')
    const data = await response.json()
    
    if (data) {
      progressInfo.value = {
        isRunning: data.isRunning || false,
        currentBatch: data.currentBatch || 0,
        totalBatches: data.totalBatches || 0,
        transcriptsProcessed: data.transcriptsProcessed || 0,
        emailsExtracted: data.emailsExtracted || 0,
        clientIdsMatched: data.clientIdsMatched || 0,
        transcriptsUpdated: data.transcriptsUpdated || 0,
        errors: data.errors || 0,
        currentStep: data.currentStep || '',
        lastActivity: data.lastActivity || '',
        recentLogs: data.recentLogs || []
      }
      
      // Stop polling if sync is complete
      if (!data.isRunning && syncing.value) {
        stopProgressPolling()
        syncing.value = false
        // Reload stats after a short delay
        setTimeout(() => {
          loadStats()
        }, 1000)
      }
    }
  } catch (error) {
    console.error('Error polling progress:', error)
  }
}

const startProgressPolling = () => {
  // Poll every 1 second
  progressPollInterval = setInterval(pollProgress, 1000)
  // Initial poll
  pollProgress()
}

const stopProgressPolling = () => {
  if (progressPollInterval) {
    clearInterval(progressPollInterval)
    progressPollInterval = null
  }
}

// Run sync
const runSync = async () => {
  if (syncing.value) return
  
  syncing.value = true
  syncResult.value = null
  syncProgress.value = { processed: 0, total: stats.value.missing }
  
  // Reset progress info
  progressInfo.value = {
    isRunning: true,
    currentBatch: 0,
    totalBatches: 0,
    transcriptsProcessed: 0,
    emailsExtracted: 0,
    clientIdsMatched: 0,
    transcriptsUpdated: 0,
    errors: 0,
    currentStep: 'Starting sync...',
    lastActivity: '',
    recentLogs: []
  }
  
  // Start polling for progress
  startProgressPolling()
  
  try {
    const response = await fetch('/api/transcripts/sync-client-ids', {
      method: 'POST'
    })
    
    const data = await response.json()
    
    syncResult.value = data
    lastSync.value = new Date().toLocaleString()
    
    // Update progress
    if (data.summary) {
      syncProgress.value = {
        processed: data.summary.transcriptsProcessed || 0,
        total: data.summary.transcriptsProcessed || 0
      }
    }
    
    // Stop polling and reload stats
    stopProgressPolling()
    await loadStats()
  } catch (error: any) {
    console.error('Error running sync:', error)
    syncResult.value = {
      success: false,
      message: error.message || 'Failed to sync Client IDs'
    }
    stopProgressPolling()
  } finally {
    syncing.value = false
  }
}

// Load stats on mount
onMounted(() => {
  loadStats()
})

// Cleanup on unmount
onUnmounted(() => {
  stopProgressPolling()
})
</script>

