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
              @click="extractFeedback"
              :disabled="extracting"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg v-if="!extracting" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ extracting ? 'Extracting...' : 'Extract Feedback' }}
            </button>
            
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              <p class="text-gray-400 text-sm mb-1">Meetings</p>
              <p class="text-3xl font-bold text-white">{{ stats.meetings }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Phone Calls</p>
              <p class="text-3xl font-bold text-white">{{ stats.phoneCalls }}</p>
            </div>
            <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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

      <!-- Feedback Extraction Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Feedback Segments</p>
              <p class="text-3xl font-bold text-white">{{ feedbackStats.totalSegments || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm mb-1">Churn Signals</p>
              <p class="text-3xl font-bold text-white">{{ feedbackStats.criticalSignals || 0 }}</p>
              <p class="text-xs text-gray-500 mt-1">Critical signals detected</p>
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
              <p class="text-gray-400 text-sm mb-1">Last Extraction</p>
              <p class="text-lg font-semibold text-white">{{ lastExtractionTime || 'Never' }}</p>
            </div>
            <div class="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

      <!-- Extraction Progress -->
      <div v-if="extractionProgress.show" class="mb-8 bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-white">🎯 Extracting Feedback</h3>
          <div class="text-sm text-gray-400">
            {{ extractionProgress.processed }} / {{ extractionProgress.total }}
          </div>
        </div>
        
        <div class="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div 
            class="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
            :style="{ width: `${(extractionProgress.processed / extractionProgress.total) * 100}%` }"
          ></div>
        </div>
        
        <div class="text-gray-300 text-sm mb-2">
          {{ extractionProgress.message }}
        </div>
        
        <div v-if="extractionProgress.segmentsExtracted > 0" class="text-sm text-gray-400">
          <span class="text-indigo-400 font-semibold">{{ extractionProgress.segmentsExtracted }}</span> feedback segments extracted
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
            @click="error = null"
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="relative">
            <label class="block text-sm text-gray-400 mb-2">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search transcripts..."
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
              <option value="">All Types</option>
              <option value="meeting">📅 Meetings</option>
              <option value="phone_call">📞 Phone Calls</option>
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
                <div class="flex items-center gap-3 mb-2">
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="transcript.transcript_type === 'meeting' ? 'bg-blue-900/30 text-blue-300' : 'bg-green-900/30 text-green-300'"
                  >
                    {{ transcript.transcript_type === 'meeting' ? '📅 Meeting' : '📞 Call' }}
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
                
                <div class="flex items-center gap-4 text-xs text-gray-400">
                  <span>ID: {{ transcript.diio_transcript_id.substring(0, 20) }}...</span>
                  <span v-if="transcript.attendees">{{ getAttendeeCount(transcript.attendees) }} attendees</span>
                </div>
              </div>
              
              <button
                @click.stop="viewTranscript(transcript)"
                class="ml-4 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors duration-200"
              >
                View
              </button>
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
        <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto border border-gray-700 shadow-2xl">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="text-2xl font-bold text-white">{{ selectedTranscript.source_name || 'Untitled' }}</h2>
              <p class="text-gray-400 text-sm mt-1">
                {{ selectedTranscript.transcript_type === 'meeting' ? 'Meeting' : 'Phone Call' }} • 
                {{ formatDate(selectedTranscript.occurred_at || selectedTranscript.created_at) }}
              </p>
            </div>
            <button
              @click="selectedTranscript = null"
              class="text-gray-400 hover:text-white text-2xl transition-colors duration-200"
            >
              ×
            </button>
          </div>
          
          <div class="bg-gray-900 rounded-lg p-4 text-gray-300 whitespace-pre-wrap border border-gray-700 max-h-[60vh] overflow-auto">
            {{ formatTranscriptText(selectedTranscript.transcript_text) }}
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
const error = ref<{ title?: string; message: string } | null>(null)
const selectedTranscript = ref<any>(null)
const currentPage = ref(1)
const itemsPerPage = 20

// Stats
const stats = reactive({
  total: 0,
  meetings: 0,
  phoneCalls: 0
})

const feedbackStats = reactive({
  totalSegments: 0,
  criticalSignals: 0
})

const lastSyncTime = ref<string | null>(null)

// Sync progress
const syncProgress = reactive({
  show: false,
  current: 0,
  total: 0,
  message: ''
})

// Extraction progress
const extractionProgress = reactive({
  show: false,
  processed: 0,
  total: 0,
  segmentsExtracted: 0,
  message: ''
})

const lastExtractionTime = ref<string | null>(null)

// Filters
const filters = reactive({
  search: '',
  type: '',
  dateFrom: '',
  dateTo: ''
})

// Computed
const hasActiveFilters = computed(() => {
  return !!(filters.search || filters.type || filters.dateFrom || filters.dateTo)
})

const filteredTranscripts = computed(() => {
  let filtered = [...transcripts.value]
  
  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(t => 
      t.source_name?.toLowerCase().includes(searchLower) ||
      t.transcript_text?.toLowerCase().includes(searchLower)
    )
  }
  
  // Type filter
  if (filters.type) {
    filtered = filtered.filter(t => t.transcript_type === filters.type)
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
      stats.meetings = data.meeting_transcripts || 0
      stats.phoneCalls = data.phone_call_transcripts || 0
    }
  } catch (err) {
    console.error('Error loading stats:', err)
  }
  
  // Load feedback stats
  try {
    const { getTranscriptFeedbackStats } = useSupabase()
    const { data: feedbackData, error: feedbackError } = await getTranscriptFeedbackStats()
    
    if (feedbackError) {
      console.warn('Feedback stats not available (database function may not exist yet):', feedbackError)
      // Set defaults if stats not available
      feedbackStats.totalSegments = 0
      feedbackStats.criticalSignals = 0
      return
    }
    
    if (feedbackData && typeof feedbackData === 'object') {
      feedbackStats.totalSegments = feedbackData.total_feedback_segments || 0
      // Calculate critical signals from feedback types
      feedbackStats.criticalSignals = (feedbackData.pain_points || 0) + (feedbackData.concerns || 0)
    } else {
      // Set defaults if data is not available
      feedbackStats.totalSegments = 0
      feedbackStats.criticalSignals = 0
    }
  } catch (err) {
    console.error('Error loading feedback stats:', err)
    // Set defaults on error
    feedbackStats.totalSegments = 0
    feedbackStats.criticalSignals = 0
  }
}

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
      const statsMessage = `Found ${result.summary.meetingsFetched || 0} meetings, ${result.summary.phoneCallsFetched || 0} calls. Stored ${result.summary.transcriptsStored || 0} new transcripts.`
      syncProgress.message = statsMessage
      
      // Check if extraction was mentioned in the message (automatic extraction)
      if (result.message.includes('Extracted')) {
        // Extract feedback stats from message
        const extractionMatch = result.message.match(/Extracted (\d+) feedback segments/)
        if (extractionMatch) {
          extractionProgress.segmentsExtracted = parseInt(extractionMatch[1])
        }
      }
      
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

const extractFeedback = async () => {
  extracting.value = true
  error.value = null
  extractionProgress.show = true
  extractionProgress.processed = 0
  extractionProgress.total = 1
  extractionProgress.segmentsExtracted = 0
  extractionProgress.message = 'Starting feedback extraction...'
  
  try {
    const response = await fetch('/api/diio/extract-feedback', {
      method: 'POST'
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      extractionProgress.message = result.message || 'Extraction completed successfully!'
      extractionProgress.total = result.summary.transcriptsProcessed || 1
      extractionProgress.processed = result.summary.transcriptsProcessed || 0
      extractionProgress.segmentsExtracted = result.summary.feedbackSegmentsExtracted || 0
      
      lastExtractionTime.value = new Date().toLocaleString()
      
      // Reload stats to update feedback counts
      await loadStats()
      
      // Show success message longer
      setTimeout(() => {
        extractionProgress.show = false
      }, 5000)
    } else {
      error.value = {
        title: 'Extraction Failed',
        message: result.message || 'Extraction failed. Please check the error details and try again.'
      }
      extractionProgress.show = false
    }
  } catch (err: any) {
    console.error('Extraction error:', err)
    error.value = {
      title: 'Extraction Failed',
      message: err.message || err.statusMessage || 'An error occurred while extracting feedback. Please check the database connection.'
    }
    extractionProgress.show = false
  } finally {
    extracting.value = false
  }
}

const viewTranscript = (transcript: any) => {
  selectedTranscript.value = transcript
}

const clearFilters = () => {
  filters.search = ''
  filters.type = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  currentPage.value = 1
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
watch([filters.search, filters.type, filters.dateFrom, filters.dateTo], () => {
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
