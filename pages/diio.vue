<template>
  <div class="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <NuxtLink
              to="/"
              class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 group"
            >
              <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="text-sm text-gray-400 group-hover:text-white transition-colors">Home</span>
            </NuxtLink>

            <div>
              <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">
                Call Transcripts
              </h1>
              <p class="text-gray-400">Access and analyze meeting and call transcripts from DIIO</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <div class="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-white/80">DIIO Connected</span>
            </div>


            <button
              @click="syncTranscripts"
              :disabled="syncing"
              class="flex items-center gap-2 px-4 py-2 bg-gradient-cta text-white rounded-lg hover:bg-gradient-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg v-if="!syncing" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ syncing ? 'Syncing...' : 'Sync New Transcripts' }}
            </button>

          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Total Transcripts</p>
              <p class="text-3xl font-bold text-white">{{ stats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Total Transcripts</p>
              <p class="text-3xl font-bold text-white">{{ stats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">AI Analyzed</p>
              <p class="text-3xl font-bold text-white">{{ stats.aiAnalyzed }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ stats.total > 0 ? Math.round((stats.aiAnalyzed / stats.total) * 100) : 0 }}% complete</p>
            </div>
            <div class="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Churned Accounts</p>
              <p class="text-3xl font-bold text-white">{{ stats.churned }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ stats.total > 0 ? Math.round((stats.churned / stats.total) * 100) : 0 }}% of transcripts</p>
            </div>
            <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Active Accounts</p>
              <p class="text-3xl font-bold text-white">{{ stats.active }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0 }}% of transcripts</p>
            </div>
            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Last Sync</p>
              <p class="text-lg font-semibold text-white">{{ lastSyncTime || 'Never' }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      <!-- Sync Progress -->
      <div v-if="syncProgress.show" class="mb-8 bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-white">🔄 Syncing Transcripts</h3>
          <div class="text-sm text-gray-400">
            {{ syncProgress.current }} / {{ syncProgress.total }}
          </div>
        </div>
        
        <div class="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div 
            class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
            :style="{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }"
          ></div>
        </div>
        
        <div class="text-gray-300 text-sm">
          {{ syncProgress.message }}
        </div>
      </div>


      <!-- Error Display -->
      <div v-if="error" class="mb-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-red-400 font-semibold mb-1">{{ error.title || 'Error' }}</h3>
            <p class="text-red-300 text-sm">{{ error.message }}</p>
          </div>
          <button
            @click="clearError"
            class="text-red-400 hover:text-red-300"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <!-- Search -->
          <div class="relative">
            <label class="block text-sm text-gray-400 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search transcripts, client ID..."
              class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <svg class="absolute right-3 top-10 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Type</label>
            <select
              v-model="filters.type"
              class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="" class="text-gray-900 bg-white">All Types</option>
              <option value="meeting" class="text-gray-900 bg-white">Meetings</option>
              <option value="phone_call" class="text-gray-900 bg-white">Phone Calls</option>
            </select>
          </div>

          <!-- AI Analysis Filter -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">AI Analysis</label>
            <select
              v-model="filters.aiAnalysis"
              class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="" class="text-gray-900 bg-white">All Transcripts</option>
              <option value="analyzed" class="text-gray-900 bg-white">Analyzed</option>
              <option value="not_analyzed" class="text-gray-900 bg-white">Not Analyzed</option>
            </select>
          </div>

          <!-- Churned Account Filter -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Account Status</label>
            <select
              v-model="filters.churnedStatus"
              class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="" class="text-gray-900 bg-white">All Accounts</option>
              <option value="churned" class="text-gray-900 bg-white">Churned Accounts</option>
              <option value="active" class="text-gray-900 bg-white">Active Accounts</option>
            </select>
          </div>

          <!-- Date From -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">From Date</label>
            <input
              v-model="filters.dateFrom"
              type="date"
              class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <!-- Date To -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">To Date</label>
            <input
              v-model="filters.dateTo"
              type="date"
              class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-gray-400">
            Showing {{ filteredTranscripts.length }} of {{ transcripts.length }} transcripts
          </div>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors duration-200"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Transcripts List -->
      <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Stored Transcripts ({{ filteredTranscripts.length }})
          </h2>
          
          <button
            @click="loadTranscripts"
            :disabled="loading"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          <p class="text-gray-400 mt-2">Loading transcripts...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTranscripts.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-400 mb-2">{{ transcripts.length === 0 ? 'No transcripts stored yet' : 'No transcripts match your filters' }}</p>
          <p class="text-gray-500 text-sm">{{ transcripts.length === 0 ? 'Click "Sync New Transcripts" to fetch transcripts from DIIO' : 'Try adjusting your search criteria' }}</p>
        </div>

        <!-- Transcripts Grid -->
        <div v-else class="space-y-4">
          <div
            v-for="transcript in paginatedTranscripts"
            :key="transcript.id"
            class="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-emerald-500/50 transition-colors duration-200 cursor-pointer"
            @click="viewTranscript(transcript)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2 flex-wrap">
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="transcript.transcript_type === 'meeting' ? 'bg-blue-900/30 text-blue-300' : 'bg-green-900/30 text-green-300'"
                  >
                    {{ transcript.transcript_type === 'meeting' ? '📅 Meeting' : '📞 Call' }}
                  </span>
                  
                  <!-- Churned Account Badge -->
                  <span
                    v-if="transcript.account_status === 'churned'"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-500/30"
                    :title="`Churned Account: ${transcript.account_name} (${transcript.client_platform_id})`"
                  >
                    ⚠️ Churned
                  </span>

                  <!-- Debug: Show account_status for all transcripts -->
                  <span class="text-xs text-gray-500 ml-2">[{{ transcript.account_status || 'NULL' }}]</span>

                  <!-- Active Account Badge -->
                  <span
                    v-if="transcript.account_status === 'active'"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30"
                    :title="`Active Account: ${transcript.account_name} (${transcript.client_platform_id})`"
                  >
                    ✅ Active
                  </span>

                  <!-- AI Analyzed Badge -->
                  <span
                    v-if="transcript.ai_analysis"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30"
                    title="AI Analysis completed"
                  >
                    🤖 AI Analyzed
                  </span>
                  
                  <span class="text-xs text-gray-400">
                    {{ formatDate(transcript.occurred_at || transcript.created_at) }}
                  </span>
                  <span v-if="transcript.duration" class="text-xs text-gray-400">
                    {{ formatDuration(transcript.duration) }}
                  </span>
                </div>
                
                <h3 class="text-white font-medium mb-2">{{ transcript.source_name || 'Untitled' }}</h3>
                
                <p class="text-gray-300 text-sm mb-3 line-clamp-2">
                  {{ getTranscriptPreview(transcript.transcript_text) }}
                </p>
                
                <!-- Account Info Section (for churned accounts) -->
                <div v-if="transcript.client_platform_id && transcript.account_status === 'churned'" class="mb-3 p-2 bg-red-900/20 rounded border border-red-500/30">
                  <p class="text-xs text-red-400 font-semibold mb-1">⚠️ Churned Account:</p>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1">
                      <span class="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300 border border-red-500/30">
                        {{ transcript.account_name }}
                      </span>
                      <button
                        @click.stop="copyToClipboard(transcript.account_name)"
                        class="text-red-400 hover:text-red-200 transition-colors p-1 rounded"
                        title="Copy Account Name"
                      >
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300 border border-red-500/30">
                        ID: {{ transcript.client_platform_id }}
                      </span>
                      <button
                        @click.stop="copyToClipboard(transcript.client_platform_id)"
                        class="text-red-400 hover:text-red-200 transition-colors p-1 rounded"
                        title="Copy Client Platform ID"
                      >
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Attendees Section -->
                <div v-if="transcript.attendees && (transcript.attendees.sellers || transcript.attendees.customers)" class="mb-3 p-2 bg-gray-900/50 rounded border border-gray-700">
                  <div v-if="transcript.attendees.sellers && transcript.attendees.sellers.length > 0" class="mb-2">
                    <p class="text-xs text-purple-400 font-semibold mb-1">👔 Sellers:</p>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="(seller, idx) in transcript.attendees.sellers.slice(0, 3)"
                        :key="idx"
                        class="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        :title="seller.email"
                      >
                        {{ seller.name || seller.email || 'Unknown' }}
                      </span>
                      <span v-if="transcript.attendees.sellers.length > 3" class="px-2 py-1 text-xs text-gray-400">
                        +{{ transcript.attendees.sellers.length - 3 }} more
                      </span>
                    </div>
                  </div>

                  <div v-if="transcript.attendees.customers && transcript.attendees.customers.length > 0">
                    <p class="text-xs text-blue-400 font-semibold mb-1">🏢 Customers:</p>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="(customer, idx) in transcript.attendees.customers.slice(0, 3)"
                        :key="idx"
                        class="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        :title="customer.email"
                      >
                        {{ customer.name || customer.email || 'Unknown' }}
                      </span>
                      <span v-if="transcript.attendees.customers.length > 3" class="px-2 py-1 text-xs text-gray-400">
                        +{{ transcript.attendees.customers.length - 3 }} more
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-4 text-xs text-gray-400">
                  <div class="flex items-center gap-1">
                    <span class="select-all cursor-pointer hover:text-gray-300 transition-colors" title="Click to select full ID">ID: {{ transcript.diio_transcript_id }}</span>
                    <button
                      @click.stop="copyToClipboard(transcript.diio_transcript_id)"
                      class="text-gray-500 hover:text-white transition-colors p-1 rounded"
                      title="Copy Transcript ID"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <span v-if="transcript.attendees">{{ getAttendeeCount(transcript.attendees) }} attendees</span>
                  <div v-if="transcript.client_platform_id" class="flex items-center gap-1">
                    <button
                      @click.stop="copyToClipboard(transcript.client_platform_id)"
                      class="text-gray-500 hover:text-white transition-colors p-1 rounded"
                      title="Copy Client Platform ID"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="ml-4 flex flex-col items-end gap-2">
                <div class="flex items-center gap-2">
                  <button
                    @click.stop="viewTranscript(transcript)"
                    class="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                  >
                    View
                  </button>
                  <button
                    v-if="transcript.feedback_extracted"
                    @click.stop="viewFeedback(transcript)"
                    class="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-1"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Feedback
                  </button>
                </div>
                
                <!-- AI Sentiment Analysis Button -->
                <button
                  @click.stop="showSentimentAnalysis(transcript)"
                  :disabled="!transcript.ai_analysis"
                  class="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                  :title="!transcript.ai_analysis ? 'No sentiment analysis available' : 'View sentiment analysis'"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Sentiment
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
            <div class="text-gray-400 text-sm">
              Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-4 py-2 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Transcript Modal -->
      <div
        v-if="selectedTranscript"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="selectedTranscript = null"
      >
        <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[85vh] overflow-auto border border-gray-700 shadow-2xl">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-2xl font-bold text-white">{{ selectedTranscript.source_name || 'Untitled' }}</h2>
                <button
                  @click="copyToClipboard(selectedTranscript.source_name || 'Untitled')"
                  class="text-gray-400 hover:text-white transition-colors p-1 rounded"
                  title="Copy transcript name"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div class="flex items-center gap-4">
                <p class="text-gray-400 text-sm">
                  {{ selectedTranscript.transcript_type === 'meeting' ? 'Meeting' : 'Phone Call' }} •
                  {{ formatDate(selectedTranscript.occurred_at || selectedTranscript.created_at) }}
                </p>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 text-xs">ID:</span>
                  <button
                    @click="copyToClipboard(selectedTranscript.diio_transcript_id)"
                    class="text-gray-400 hover:text-white transition-colors px-2 py-1 bg-gray-800 rounded text-xs flex items-center gap-1"
                    title="Copy Transcript ID"
                  >
                    <span>{{ selectedTranscript.diio_transcript_id }}</span>
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Attendees in Modal -->
              <div v-if="selectedTranscript.attendees && (selectedTranscript.attendees.sellers || selectedTranscript.attendees.customers)" class="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                <div v-if="selectedTranscript.attendees.sellers && selectedTranscript.attendees.sellers.length > 0" class="mb-3">
                  <p class="text-xs text-purple-400 font-semibold mb-2">👔 Sellers:</p>
                  <div class="space-y-1">
                    <div
                      v-for="(seller, idx) in selectedTranscript.attendees.sellers"
                      :key="idx"
                      class="flex items-center gap-2 text-sm"
                    >
                      <span class="text-purple-300">{{ seller.name || 'Unknown' }}</span>
                      <span v-if="seller.email" class="text-gray-400 text-xs">{{ seller.email }}</span>
                    </div>
                  </div>
                </div>
                
                <div v-if="selectedTranscript.attendees.customers && selectedTranscript.attendees.customers.length > 0">
                  <p class="text-xs text-blue-400 font-semibold mb-2">🏢 Customers:</p>
                  <div class="space-y-1">
                    <div
                      v-for="(customer, idx) in selectedTranscript.attendees.customers"
                      :key="idx"
                      class="flex items-center gap-2 text-sm"
                    >
                      <span class="text-blue-300">{{ customer.name || 'Unknown' }}</span>
                      <span v-if="customer.email" class="text-gray-400 text-xs">{{ customer.email }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              @click="selectedTranscript = null"
              class="text-gray-400 hover:text-white text-2xl transition-colors duration-200 ml-4"
            >
              ×
            </button>
          </div>
          
          <div class="bg-gray-900 rounded-lg p-4 text-gray-300 whitespace-pre-wrap border border-gray-700 max-h-[50vh] overflow-auto">
            {{ formatTranscriptText(selectedTranscript.transcript_text) }}
          </div>
        </div>
      </div>

      <!-- Feedback & Churn Signals Modal -->
      <div
        v-if="selectedFeedbackTranscript"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="selectedFeedbackTranscript = null"
      >
        <div class="bg-gray-800 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-auto border border-gray-700 shadow-2xl">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-2xl font-bold text-white">Feedback & Churn Signals</h2>
                <button
                  @click="copyToClipboard(selectedFeedbackTranscript.diio_transcript_id)"
                  class="text-gray-400 hover:text-white transition-colors p-1 rounded"
                  title="Copy Transcript ID"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <p class="text-gray-400 text-sm">
                {{ selectedFeedbackTranscript.source_name || 'Untitled' }} •
                {{ formatDate(selectedFeedbackTranscript.occurred_at || selectedFeedbackTranscript.created_at) }}
              </p>
            </div>
            <button
              @click="selectedFeedbackTranscript = null"
              class="text-gray-400 hover:text-white text-2xl transition-colors duration-200"
            >
              ×
            </button>
          </div>

          <div v-if="loadingFeedback" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"></div>
            <p class="text-gray-400 mt-2">Loading feedback...</p>
          </div>

          <div v-else-if="feedbackSegments.length === 0" class="text-center py-8">
            <p class="text-gray-400">No feedback segments found for this transcript.</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Summary Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Total Segments</p>
                <p class="text-2xl font-bold text-white">{{ feedbackSegments.length }}</p>
              </div>
              <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Critical Signals</p>
                <p class="text-2xl font-bold text-red-400">{{ criticalSignalsCount }}</p>
              </div>
              <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Pain Points</p>
                <p class="text-2xl font-bold text-orange-400">{{ painPointsCount }}</p>
              </div>
              <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Negative Sentiment</p>
                <p class="text-2xl font-bold text-red-400">{{ negativeSentimentCount }}</p>
              </div>
            </div>

            <!-- Feedback Segments -->
            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-white mb-3">Feedback Segments</h3>
              <div
                v-for="(segment, index) in feedbackSegments"
                :key="index"
                class="bg-gray-900 rounded-lg p-4 border border-gray-700"
                :class="{
                  'border-red-500': segment.urgency === 'critical',
                  'border-orange-500': segment.urgency === 'high' && segment.urgency !== 'critical',
                  'border-yellow-500': segment.urgency === 'medium' && segment.urgency !== 'high' && segment.urgency !== 'critical'
                }"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="px-2 py-1 text-xs rounded bg-indigo-500/20 text-indigo-300">
                      {{ segment.speaker_type === 'seller' ? 'Seller' : segment.speaker_type === 'customer' ? 'Customer' : 'Unknown' }}
                    </span>
                    <span class="px-2 py-1 text-xs rounded" :class="{
                      'bg-red-500/20 text-red-300': segment.feedback_type === 'pain_point',
                      'bg-blue-500/20 text-blue-300': segment.feedback_type === 'feature_request',
                      'bg-green-500/20 text-green-300': segment.feedback_type === 'praise',
                      'bg-yellow-500/20 text-yellow-300': segment.feedback_type === 'concern',
                      'bg-purple-500/20 text-purple-300': segment.feedback_type === 'question'
                    }">
                      {{ segment.feedback_type.replace('_', ' ') }}
                    </span>
                    <span class="px-2 py-1 text-xs rounded" :class="{
                      'bg-red-500/20 text-red-300': segment.urgency === 'critical',
                      'bg-orange-500/20 text-orange-300': segment.urgency === 'high',
                      'bg-yellow-500/20 text-yellow-300': segment.urgency === 'medium',
                      'bg-gray-500/20 text-gray-300': segment.urgency === 'low'
                    }">
                      {{ segment.urgency }}
                    </span>
                    <span class="px-2 py-1 text-xs rounded" :class="{
                      'bg-green-500/20 text-green-300': segment.sentiment === 'positive',
                      'bg-red-500/20 text-red-300': segment.sentiment === 'negative',
                      'bg-gray-500/20 text-gray-300': segment.sentiment === 'neutral'
                    }">
                      {{ segment.sentiment }}
                    </span>
                  </div>
                </div>
                
                <p class="text-gray-300 mb-2">{{ segment.feedback_text }}</p>
                
                <div v-if="segment.keywords && segment.keywords.length > 0" class="mt-2">
                  <p class="text-xs text-gray-500 mb-1">Keywords:</p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="keyword in segment.keywords"
                      :key="keyword"
                      class="px-2 py-1 text-xs rounded bg-gray-800 text-gray-400"
                    >
                      {{ keyword }}
                    </span>
                  </div>
                </div>

                <div v-if="segment.churn_signals && segment.churn_signals.length > 0" class="mt-3 pt-3 border-t border-gray-700">
                  <p class="text-xs text-red-400 font-semibold mb-2">⚠️ Churn Signals Detected:</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="signal in segment.churn_signals"
                      :key="signal"
                      class="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300 border border-red-500/50"
                    >
                      {{ signal }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Sentiment Analysis Modal -->
      <div
        v-if="aiAnalysisResult"
        class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        @click.self="aiAnalysisResult = null"
      >
        <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto border border-gray-700 shadow-2xl">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                  <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Sentiment Analysis
                </h2>
                <span class="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  🤖 AI Generated
                </span>
              </div>
              <p class="text-gray-400 text-sm mt-1">
                {{ aiAnalysisResult.metadata.sourceName }}
              </p>
              <p class="text-gray-500 text-xs mt-1">
                Analyzed: {{ new Date(aiAnalysisResult.metadata.analyzedAt).toLocaleString() }}
              </p>
            </div>
            <button
              @click="aiAnalysisResult = null"
              class="text-gray-400 hover:text-white text-2xl transition-colors duration-200"
            >
              ×
            </button>
          </div>

          <!-- Sentiment Summary -->
          <div class="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg border border-blue-500/30">
            <p class="text-white text-sm leading-relaxed">{{ aiAnalysisResult.analysis.summary }}</p>
          </div>

          <!-- Key Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p class="text-gray-400 text-xs mb-1">Overall Sentiment</p>
              <p class="text-lg font-bold" :class="{
                'text-green-400': aiAnalysisResult.analysis.overallSentiment === 'Positive',
                'text-yellow-400': aiAnalysisResult.analysis.overallSentiment === 'Neutral',
                'text-red-400': aiAnalysisResult.analysis.overallSentiment === 'Negative'
              }">
                {{ aiAnalysisResult.analysis.overallSentiment.toUpperCase() }}
              </p>
            </div>

            <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p class="text-gray-400 text-xs mb-1">Sentiment Score</p>
              <p class="text-lg font-bold" :class="{
                'text-green-400': aiAnalysisResult.analysis.sentimentScore > 0.3,
                'text-yellow-400': aiAnalysisResult.analysis.sentimentScore >= -0.3 && aiAnalysisResult.analysis.sentimentScore <= 0.3,
                'text-red-400': aiAnalysisResult.analysis.sentimentScore < -0.3
              }">
                {{ (aiAnalysisResult.analysis.sentimentScore * 100).toFixed(1) }}%
              </p>
            </div>

            <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p class="text-gray-400 text-xs mb-1">Confidence</p>
              <p class="text-lg font-bold" :class="{
                'text-green-400': aiAnalysisResult.analysis.confidence > 0.15,
                'text-yellow-400': aiAnalysisResult.analysis.confidence >= 0.05 && aiAnalysisResult.analysis.confidence <= 0.15,
                'text-red-400': aiAnalysisResult.analysis.confidence < 0.05
              }">
                {{ (aiAnalysisResult.analysis.confidence * 100).toFixed(1) }}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { getDiioTranscripts, getDiioTranscriptStats } = useSupabase()

// State
const transcripts = ref<any[]>([])
const loading = ref(false)
const syncing = ref(false)
// Removed: generatingReport, testingSentiment
const error = ref<{ title?: string; message: string } | null>(null)
const selectedTranscript = ref<any>(null)
const currentPage = ref(1)
const itemsPerPage = 20

// Removed: churnedReportData, showChurnedReportModal

// Sentiment Analysis State
const aiAnalysisResult = ref<any>(null)

// Stats
const stats = reactive({
  total: 0,
  aiAnalyzed: 0,
  churned: 0,
  active: 0
})

const lastSyncTime = ref<string | null>(null)

// Sync progress
const syncProgress = reactive({
  show: false,
  current: 0,
  total: 0,
  message: ''
})

// Filters
const filters = reactive({
  search: '',
  type: '',
  aiAnalysis: '',
  churnedStatus: '',
  dateFrom: '',
  dateTo: ''
})

// Computed
const hasActiveFilters = computed(() => {
  return !!(filters.search || filters.type || filters.aiAnalysis || filters.churnedStatus || filters.dateFrom || filters.dateTo)
})

const filteredTranscripts = computed(() => {
  let filtered = [...transcripts.value]
  
  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(t => 
      t.source_name?.toLowerCase().includes(searchLower) ||
      t.transcript_text?.toLowerCase().includes(searchLower) ||
      t.client_platform_id?.toLowerCase().includes(searchLower)
    )
  }
  
  // Type filter
  if (filters.type) {
    filtered = filtered.filter(t => t.transcript_type === filters.type)
  }
  
  // AI Analysis filter
  if (filters.aiAnalysis === 'analyzed') {
    filtered = filtered.filter(t => t.ai_analysis !== null && t.ai_analysis !== undefined)
  } else if (filters.aiAnalysis === 'not_analyzed') {
    filtered = filtered.filter(t => !t.ai_analysis)
  }

  // Account Status filter
  if (filters.churnedStatus === 'churned') {
    filtered = filtered.filter(t => t.account_status === 'churned')
  } else if (filters.churnedStatus === 'active') {
    filtered = filtered.filter(t => t.account_status === 'active')
  }

  // Date filters
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    filtered = filtered.filter(t => {
      const date = new Date(t.occurred_at || t.created_at)
      return date >= fromDate
    })
  }
  
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    toDate.setHours(23, 59, 59, 999)
    filtered = filtered.filter(t => {
      const date = new Date(t.occurred_at || t.created_at)
      return date <= toDate
    })
  }
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredTranscripts.value.length / itemsPerPage))

const paginatedTranscripts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTranscripts.value.slice(start, end)
})

// Methods
const loadTranscripts = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Fetch all transcripts (increase limit if needed)
    const { data, error: dbError } = await getDiioTranscripts(50000, 0)
    
    if (dbError) throw dbError
    
    transcripts.value = data || []
    console.log(`✅ Loaded ${transcripts.value.length} transcripts from database`)
    await loadStats()
  } catch (err: any) {
    error.value = {
      title: 'Failed to load transcripts',
      message: err.message || 'An error occurred while loading transcripts'
    }
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const { data } = await getDiioTranscriptStats()
    if (data) {
      stats.total = data.total_transcripts || 0
    }
  } catch (err) {
    console.error('Error loading stats:', err)
  }
  
  // Count AI analyzed transcripts from loaded data
  stats.aiAnalyzed = transcripts.value.filter(t => t.ai_analysis).length

  // Count account status transcripts from loaded data
  stats.churned = transcripts.value.filter(t => t.account_status === 'churned').length
  stats.active = transcripts.value.filter(t => t.account_status === 'active').length
}

// Removed: generateChurnedAccountsReport function

const syncTranscripts = async () => {
  syncing.value = true
  error.value = null
  syncProgress.show = true
  syncProgress.current = 0
  syncProgress.total = 1
  syncProgress.message = 'Starting sync...'
  
  try {
    // Use fetch instead of $fetch to get streaming updates if needed
    const response = await fetch('/api/diio/sync-transcripts', {
      method: 'POST'
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      // Update progress with detailed message
      syncProgress.message = result.message || 'Sync completed successfully!'
      syncProgress.total = result.summary.newTranscriptsFound || 1
      syncProgress.current = result.summary.transcriptsStored || 0
      
      lastSyncTime.value = new Date().toLocaleString()
      
      // Reload transcripts after sync
      await loadTranscripts()
      
      // Show success message with stats
      const statsMessage = `Sync completed. Stored ${result.summary.transcriptsStored || 0} new transcripts.`
      syncProgress.message = statsMessage
      
      // Show success message longer
      setTimeout(() => {
        syncProgress.show = false
      }, 5000)
    } else {
      error.value = {
        title: 'Sync Failed',
        message: result.message || 'Sync failed. Please check the error details and try again.'
      }
      syncProgress.show = false
    }
  } catch (err: any) {
    console.error('Sync error:', err)
    error.value = {
      title: 'Sync Failed',
      message: err.message || err.statusMessage || 'An error occurred while syncing transcripts. Please check your DIIO credentials and database connection.'
    }
    syncProgress.show = false
  } finally {
    syncing.value = false
  }
}

// Removed: testSentimentAnalysis function

const viewTranscript = (transcript: any) => {
  selectedTranscript.value = transcript
}

const showSentimentAnalysis = (transcript: any) => {
  if (!transcript.ai_analysis) return

  // Parse the stored sentiment analysis from the database
  let sentimentData
  try {
    sentimentData = typeof transcript.ai_analysis === 'string'
      ? JSON.parse(transcript.ai_analysis)
      : transcript.ai_analysis
  } catch (e) {
    console.error('Error parsing sentiment data:', e)
    return
  }

  // Format for display in the modal
  aiAnalysisResult.value = {
    analysis: {
      overallSentiment: sentimentData.sentiment || 'neutral',
      sentimentScore: sentimentData.score || 0.5,
      confidence: sentimentData.confidence || 0,
      churnSignals: [], // Not available in basic sentiment analysis
      summary: `Sentiment analysis shows ${sentimentData.sentiment || 'neutral'} sentiment with ${(sentimentData.confidence * 100 || 0).toFixed(1)}% confidence.`
    },
    metadata: {
      sourceName: transcript.source_name || 'Unknown',
      analyzedAt: sentimentData.analyzed_at || new Date().toISOString(),
      cached: false // This is stored data
    }
  }

  console.log('📊 Showing stored sentiment analysis:', sentimentData)
}

// Removed: analyzeTranscriptWithAI function - now using stored sentiment data

const selectedFeedbackTranscript = ref<any>(null)
const feedbackSegments = ref<any[]>([])
const loadingFeedback = ref(false)

const viewFeedback = async (transcript: any) => {
  selectedFeedbackTranscript.value = transcript
  loadingFeedback.value = true
  feedbackSegments.value = []
  
  try {
    const { getTranscriptFeedback } = useSupabase()
    const { data, error } = await getTranscriptFeedback(transcript.id)
    
    if (error) throw error
    
    if (data) {
      // Sort by segment_number and process keywords/churn_signals
      feedbackSegments.value = data
        .sort((a: any, b: any) => a.segment_number - b.segment_number)
        .map((segment: any) => ({
          ...segment,
          keywords: segment.keywords || [],
          churn_signals: segment.keywords?.filter((k: string) => 
            k.startsWith('churn_') || k === 'payment_issue' || k === 'worker_payout_issue' || 
            k === 'recurring_problem' || k === 'long_lasting_problem' || k === 'price_negotiation'
          ) || []
        }))
    }
  } catch (err: any) {
    console.error('Error loading feedback:', err)
    error.value = {
      title: 'Failed to Load Feedback',
      message: err.message || 'An error occurred while loading feedback segments.'
    }
  } finally {
    loadingFeedback.value = false
  }
}

const criticalSignalsCount = computed(() => {
  return feedbackSegments.value.filter(s => s.urgency === 'critical').length
})

const painPointsCount = computed(() => {
  return feedbackSegments.value.filter(s => s.feedback_type === 'pain_point').length
})

const negativeSentimentCount = computed(() => {
  return feedbackSegments.value.filter(s => s.sentiment === 'negative').length
})

const clearFilters = () => {
  filters.search = ''
  filters.type = ''
  filters.aiAnalysis = ''
  filters.churnedStatus = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  currentPage.value = 1
}

const clearError = () => {
  error.value = null
  hasQuotaError.value = false
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleString()
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

const getTranscriptPreview = (text: string) => {
  if (!text) return 'No transcript text available'
  
  // Handle if text is stored as object/array (shouldn't happen but handle it)
  if (typeof text !== 'string') {
    try {
      text = JSON.stringify(text)
    } catch {
      text = String(text)
    }
  }
  
  // Remove any "[object Object]" artifacts
  text = text.replace(/\[object Object\]/g, '').trim()
  
  if (!text || text.length === 0) return 'No transcript text available'
  
  return text.substring(0, 200) + (text.length > 200 ? '...' : '')
}

const getAttendeeCount = (attendees: any) => {
  if (!attendees) return 0
  const sellers = attendees.sellers?.length || 0
  const customers = attendees.customers?.length || 0
  return sellers + customers
}

const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(textArea)
      }
    }

    // Show success feedback (you could implement a toast notification here)
    console.log(`✅ Copied to clipboard: ${text}`)
  } catch (err) {
    console.error('❌ Failed to copy to clipboard:', err)
    // Fallback: show alert
    alert(`Copy failed. Text: ${text}`)
  }
}

const copyReportToClipboard = async () => {
  if (!churnedReportData.value) return

  const report = churnedReportData.value
  const formattedReport = `
CHURNED ACCOUNTS REPORT
Generated: ${new Date(report.generatedAt).toLocaleString()}

EXECUTIVE SUMMARY
================
Total Churned Accounts: ${report.totalChurnedAccounts}
Total Transcripts: ${report.totalTranscripts}
Accounts with Data: ${report.accountsWithTranscripts}
Accounts without Data: ${report.accountsWithoutTranscripts}

TRANSCRIPT DISTRIBUTION
======================
1 transcript: ${report.transcriptDistribution.accountsWith1Transcript} accounts
2-5 transcripts: ${report.transcriptDistribution.accountsWith2To5Transcripts} accounts
6-10 transcripts: ${report.transcriptDistribution.accountsWith6To10Transcripts} accounts
10+ transcripts: ${report.transcriptDistribution.accountsWith10PlusTranscripts} accounts

TOP ACCOUNTS BY TRANSCRIPTS
===========================
${report.topAccountsByTranscripts.slice(0, 10).map((account: any, index: number) =>
  `${index + 1}. ${account.accountName} (${account.clientPlatformId}): ${account.transcriptCount} transcripts`
).join('\n')}
  `.trim()

  await copyToClipboard(formattedReport)
}

const formatTranscriptText = (text: any): string => {
  if (!text) return 'No transcript text available'
  
  // Handle if text is stored as object/array
  if (typeof text !== 'string') {
    try {
      // If it's an array, try to extract text from segments
      if (Array.isArray(text)) {
        return text.map((segment: any) => {
          if (typeof segment === 'string') {
            return segment
          } else if (segment && typeof segment === 'object') {
            return segment.text || 
                   segment.content || 
                   segment.transcript ||
                   (segment.speaker && segment.text ? `${segment.speaker}: ${segment.text}` : null) ||
                   JSON.stringify(segment)
          }
          return String(segment)
        }).filter((t: string) => t && t.trim().length > 0).join('\n')
      } else if (text && typeof text === 'object') {
        // Single object - try to extract text
        return text.text || text.content || text.transcript || JSON.stringify(text, null, 2)
      } else {
        return JSON.stringify(text)
      }
    } catch {
      return String(text)
    }
  }
  
  // Remove any "[object Object]" artifacts
  text = text.replace(/\[object Object\]/g, '').trim()
  
  return text || 'No transcript text available'
}

// Watch for filter changes to reset pagination
watch([filters.search, filters.type, filters.aiAnalysis, filters.churnedStatus, filters.dateFrom, filters.dateTo], () => {
  currentPage.value = 1
})

// Load on mount
onMounted(async () => {
  await loadTranscripts()
  await loadStats()
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
