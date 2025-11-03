<template>
  <div class="min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <!-- Home Button -->
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
          
          <!-- Status Badge -->
          <div class="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-white/80">DIIO Connected</span>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <DiioStatsCards
        :users-count="store.state.usersCount"
        :phone-calls-count="store.state.phoneCallsCount"
        :meetings-count="store.state.meetingsCount"
        :total-transcripts="store.state.totalTranscripts"
      />

      <!-- Action Buttons -->
      <DiioActionButtons
        :loading="store.isLoading"
        @check-new-meetings="checkForNewMeetings"
        @refresh-stats="loadTranscriptStats"
      />

      <!-- Transcript Processing Progress -->
      <div v-if="store.state.transcriptProcessing.isProcessing" class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white">🎙️ Processing Transcripts</h3>
            <div class="text-sm text-gray-400">
              {{ store.state.transcriptProcessing.current }} / {{ store.state.transcriptProcessing.total }}
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div 
              class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
              :style="{ width: `${(store.state.transcriptProcessing.current / store.state.transcriptProcessing.total) * 100}%` }"
            ></div>
          </div>
          
          <!-- Current Item -->
          <div class="text-gray-300 mb-4">
            <div class="text-sm text-gray-400 mb-1">Currently processing:</div>
            <div class="font-medium">{{ store.state.transcriptProcessing.currentItem }}</div>
          </div>
          
          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-green-500/20 rounded-lg p-3">
              <div class="text-2xl font-bold text-green-400">{{ store.state.transcriptProcessing.stored }}</div>
              <div class="text-sm text-gray-400">Stored</div>
            </div>
            <div class="bg-yellow-500/20 rounded-lg p-3">
              <div class="text-2xl font-bold text-yellow-400">{{ store.state.transcriptProcessing.skipped }}</div>
              <div class="text-sm text-gray-400">Skipped</div>
            </div>
            <div class="bg-red-500/20 rounded-lg p-3">
              <div class="text-2xl font-bold text-red-400">{{ store.state.transcriptProcessing.errors }}</div>
              <div class="text-sm text-gray-400">Errors</div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Filter (shown when meetings are loaded) -->
      <div v-if="store.state.meetings.length > 0" class="mb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label class="text-white font-medium text-sm">Filter by User:</label>
          <select
            v-model="selectedUserEmail"
            class="bg-gray-800 text-white border border-white/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[300px]"
            style="color-scheme: dark;"
          >
            <option value="" class="bg-gray-800 text-white">All Users</option>
            <option v-for="user in store.state.users" :key="user.id" :value="user.email" class="bg-gray-800 text-white">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
          <span class="text-white/60 text-sm">{{ filteredMeetings.length }} of {{ store.state.meetings.length }} meetings loaded</span>
          <button
            v-if="store.state.meetings.length < store.state.meetingsTotal"
            @click="loadMoreMeetings"
            :disabled="store.isLoading"
            class="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            Load More ({{ store.state.meetingsTotal - store.state.meetings.length }} remaining)
          </button>
        </div>
      </div>

      <!-- Error Display -->
      <DiioErrorDisplay
        :error="store.state.error"
        @dismiss="store.clearError"
      />

      <!-- Stored Transcripts Section -->
      <div class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 class="text-2xl font-bold text-white flex items-center gap-2">
              <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Stored Transcripts ({{ filteredTranscriptsCount }})
            </h2>
            
            <div class="flex items-center gap-2">
              <button
                @click="loadStoredTranscripts"
                :disabled="store.state.transcriptsLoading"
                class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ store.state.transcriptsLoading ? 'Loading...' : 'Refresh' }}
              </button>

              <button
                @click="checkForNewMeetings"
                :disabled="store.state.loading"
                class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {{ store.state.loading ? 'Checking...' : 'Check for New' }}
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="mb-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Search -->
              <div class="relative">
                <label class="block text-sm text-gray-400 mb-2">Search</label>
                <input
                  v-model="transcriptFilters.search"
                  type="text"
                  placeholder="Search by name or text..."
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
                  v-model="transcriptFilters.type"
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
                  v-model="transcriptFilters.dateFrom"
                  type="date"
                  class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <!-- Date To -->
              <div>
                <label class="block text-sm text-gray-400 mb-2">To Date</label>
                <input
                  v-model="transcriptFilters.dateTo"
                  type="date"
                  class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <!-- Filter Actions -->
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-400">
                <span v-if="hasActiveFilters">
                  Showing {{ filteredTranscriptsCount }} of {{ store.state.totalTranscripts }} transcripts
                </span>
                <span v-else>
                  Showing all {{ store.state.totalTranscripts }} transcripts
                </span>
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
          <div v-if="store.state.transcriptsLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            <p class="text-gray-400 mt-2">Loading transcripts...</p>
          </div>

          <div v-else-if="store.state.storedTranscripts.length === 0" class="text-center py-8">
            <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-gray-400 mb-2">No transcripts loaded yet</p>
            <p class="text-gray-500 text-sm">Click "Check for New" to load transcripts from the database</p>
          </div>

          <div v-else-if="filteredStoredTranscripts.length === 0" class="text-center py-8">
            <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-gray-400 mb-2">No transcripts match your filters</p>
            <p class="text-gray-500 text-sm">Try adjusting your search criteria or clear the filters</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="transcript in filteredStoredTranscripts"
              :key="transcript.id"
              class="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-emerald-500/50 transition-colors duration-200"
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
                      {{ formatDate(transcript.occurred_at) }}
                    </span>
                    <span v-if="transcript.duration" class="text-xs text-gray-400">
                      {{ Math.floor(transcript.duration / 60) }}m {{ transcript.duration % 60 }}s
                    </span>
                  </div>
                  
                  <h3 class="text-white font-medium mb-2">{{ transcript.source_name || 'Untitled' }}</h3>
                  
                  <p class="text-gray-300 text-sm mb-3 line-clamp-2">
                    {{ transcript.transcript_text ? (transcript.transcript_text.substring(0, 200) + (transcript.transcript_text.length > 200 ? '...' : '')) : 'No transcript text available' }}
                  </p>
                  
                  <div class="flex items-center gap-4 text-xs text-gray-400">
                    <span>ID: {{ transcript.diio_transcript_id }}</span>
                    <span v-if="transcript.total_attendees">Attendees: {{ transcript.total_attendees }}</span>
                    <span>{{ formatDate(transcript.created_at) }}</span>
                  </div>
                </div>
                
                <button
                  @click="viewStoredTranscript(transcript)"
                  class="ml-4 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                >
                  View Full
                </button>
              </div>
            </div>

            <!-- Pagination Controls -->
            <div v-if="totalTranscriptPages > 1" class="pt-6 border-t border-white/10 mt-6 space-y-4">
              <!-- Page Info & Jump to Page -->
              <div class="flex items-center justify-between flex-wrap gap-4">
                <div class="text-gray-400 text-sm">
                  Showing page <span class="text-white font-semibold">{{ transcriptPage }}</span> of 
                  <span class="text-white font-semibold">{{ totalTranscriptPages }}</span>
                  <span class="ml-2">
                    ({{ (transcriptPage - 1) * transcriptsPerPage + 1 }}-{{ Math.min(transcriptPage * transcriptsPerPage, store.state.totalTranscripts) }} of {{ store.state.totalTranscripts }} transcripts)
                  </span>
                </div>

                <!-- Jump to Page -->
                <div class="flex items-center gap-2">
                  <label class="text-gray-400 text-sm">Jump to page:</label>
                  <input
                    type="number"
                    v-model.number="jumpToPageInput"
                    @keyup.enter="jumpToCustomPage"
                    :min="1"
                    :max="totalTranscriptPages"
                    class="w-20 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="1"
                  />
                  <button
                    @click="jumpToCustomPage"
                    :disabled="!jumpToPageInput || jumpToPageInput < 1 || jumpToPageInput > totalTranscriptPages"
                    class="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="flex items-center gap-2">
                <!-- Previous Button -->
                <button
                  @click="prevTranscriptPage"
                  :disabled="transcriptPage === 1 || store.state.transcriptsLoading"
                  class="px-4 py-2 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <!-- Page Numbers -->
                <div class="flex items-center gap-1">
                  <!-- First Page -->
                  <button
                    v-if="transcriptPage > 3"
                    @click="goToTranscriptPage(1)"
                    class="w-10 h-10 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    1
                  </button>
                  <span v-if="transcriptPage > 4" class="text-gray-500 px-2">...</span>

                  <!-- Pages around current -->
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="goToTranscriptPage(page)"
                    :class="[
                      'w-10 h-10 rounded-lg border transition-all duration-200',
                      page === transcriptPage
                        ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    ]"
                  >
                    {{ page }}
                  </button>

                  <!-- Last Page -->
                  <span v-if="transcriptPage < totalTranscriptPages - 3" class="text-gray-500 px-2">...</span>
                  <button
                    v-if="transcriptPage < totalTranscriptPages - 2"
                    @click="goToTranscriptPage(totalTranscriptPages)"
                    class="w-10 h-10 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    {{ totalTranscriptPages }}
                  </button>
                </div>

                <!-- Next Button -->
                <button
                  @click="nextTranscriptPage"
                  :disabled="transcriptPage === totalTranscriptPages || store.state.transcriptsLoading"
                  class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  Next
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Section -->
      <div v-if="store.state.users.length > 0" class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            DIIO Users ({{ store.state.users.length }})
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="user in store.state.users"
              :key="user.id"
              class="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-200"
            >
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-semibold text-sm">{{ user.name.charAt(0) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-semibold truncate">{{ user.name }}</h3>
                  <p class="text-gray-400 text-sm truncate">{{ user.email }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Meetings Section -->
      <div v-if="store.state.meetings.length > 0" class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Recent Meetings ({{ filteredMeetings.length }})
          </h2>
          
          <div v-if="store.state.meetingsLoading" class="space-y-3">
            <DiioLoadingSkeleton :count="5" />
          </div>
          <div v-else class="space-y-3">
            <DiioMeetingCard
              v-for="meeting in filteredMeetings"
              :key="meeting.id"
              :meeting="meeting"
              @view-transcript="fetchTranscript"
            />
          </div>
        </div>
      </div>

      <!-- Phone Calls Section -->
      <div v-if="store.state.phoneCalls.length > 0" class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Phone Calls ({{ store.state.phoneCallsCount }})
          </h2>
          
          <div class="space-y-3">
            <div
              v-for="call in store.state.phoneCalls"
              :key="call.id"
              class="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-green-500/50 hover:bg-white/10 transition-all duration-200"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <h3 class="text-white font-semibold mb-1">{{ call.name }}</h3>
                  <p class="text-gray-400 text-sm mb-2">{{ formatDate(call.occurred_at) }}</p>
                  
                  <div v-if="call.attendees">
                    <p class="text-gray-500 text-xs">
                      <span class="text-gray-400">Sellers:</span> {{ call.attendees.sellers?.map(s => s.name).join(', ') || 'None' }}
                    </p>
                  </div>
                </div>

                <button
                  v-if="call.last_transcript_id"
                  @click="fetchTranscript(call.last_transcript_id, call.name)"
                  class="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  View Transcript
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Data Display -->
      <div v-if="exportedData" class="mb-8">
        <div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 class="text-2xl font-bold text-white mb-4">Exported Data</h2>
          <pre class="text-gray-300 text-sm overflow-auto max-h-96 bg-gray-900/50 p-4 rounded border border-white/10">{{ JSON.stringify(exportedData, null, 2) }}</pre>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-if="!store.isLoading && !store.hasData" class="text-center py-16">
        <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <p class="text-gray-400 mb-2">No data loaded yet</p>
        <p class="text-gray-500 text-sm">Click the buttons above to fetch data from DIIO</p>
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
              <h2 class="text-2xl font-bold text-white">{{ selectedTranscriptName }}</h2>
              <p class="text-gray-400 text-sm mt-1">Transcript ID: {{ selectedTranscript.id }}</p>
            </div>
            <button
              @click="selectedTranscript = null"
              class="text-gray-400 hover:text-white text-2xl transition-colors duration-200"
            >
              ×
            </button>
          </div>
          
          <div class="bg-gray-900 rounded-lg p-4 text-gray-300 whitespace-pre-wrap border border-gray-700">
            {{ selectedTranscript.transcript }}
          </div>
        </div>
      </div>
    </div>

    <!-- Back to Top Button -->
    <Transition name="fade">
      <button
        v-if="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 p-4 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-700 transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Back to top"
      >
        <svg class="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span class="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Back to Top
        </span>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { DiioUser, DiioPhoneCall, DiioMeeting, DiioTranscript } from '~/types/diio'
import { diioService } from '~/services/diioService'
import { ErrorHandler } from '~/utils/errorHandler'

definePageMeta({
  layout: 'default'
})

// Use the centralized store
const store = useDiioStore()

// Legacy composables for database operations
const { 
  saveDiioUsers, 
  saveDiioMeetings, 
  saveDiioPhoneCalls, 
  saveDiioTranscript, 
  getDiioTranscripts, 
  getDiioTranscriptStats,
  transcriptExists 
} = useSupabase()

// Local state for UI
const selectedTranscript = ref<DiioTranscript | null>(null)
const selectedTranscriptName = ref('')
const selectedUserEmail = ref('')
const exportedData = ref<any>(null)

// Filter state for transcripts
const transcriptFilters = reactive({
  search: '',
  type: '',
  dateFrom: '',
  dateTo: ''
})

// Computed: Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(transcriptFilters.search || transcriptFilters.type || transcriptFilters.dateFrom || transcriptFilters.dateTo)
})

// Computed: Filter transcripts based on criteria
const filteredStoredTranscripts = computed(() => {
  let filtered = [...store.state.storedTranscripts]
  
  // Search filter (name or text content)
  if (transcriptFilters.search) {
    const searchLower = transcriptFilters.search.toLowerCase()
    filtered = filtered.filter(t => 
      t.source_name?.toLowerCase().includes(searchLower) ||
      t.transcript_text?.toLowerCase().includes(searchLower)
    )
  }
  
  // Type filter
  if (transcriptFilters.type) {
    filtered = filtered.filter(t => t.transcript_type === transcriptFilters.type)
  }
  
  // Date from filter
  if (transcriptFilters.dateFrom) {
    const fromDate = new Date(transcriptFilters.dateFrom)
    filtered = filtered.filter(t => {
      const transcriptDate = new Date(t.occurred_at || t.created_at)
      return transcriptDate >= fromDate
    })
  }
  
  // Date to filter
  if (transcriptFilters.dateTo) {
    const toDate = new Date(transcriptFilters.dateTo)
    toDate.setHours(23, 59, 59, 999) // Include the entire end date
    filtered = filtered.filter(t => {
      const transcriptDate = new Date(t.occurred_at || t.created_at)
      return transcriptDate <= toDate
    })
  }
  
  return filtered
})

// Computed: Count of filtered transcripts
const filteredTranscriptsCount = computed(() => filteredStoredTranscripts.value.length)

// Function to clear all filters
const clearFilters = () => {
  transcriptFilters.search = ''
  transcriptFilters.type = ''
  transcriptFilters.dateFrom = ''
  transcriptFilters.dateTo = ''
}

// Back to Top functionality
const showBackToTop = ref(false)

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// Add scroll listener on mount
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

// Remove scroll listener on unmount
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Computed property to filter meetings by selected user
const filteredMeetings = computed(() => {
  return store.getFilteredMeetings(selectedUserEmail.value)
})

const fetchUsers = async () => {
  store.setUsersLoading(true)
  store.clearError()
  
  try {
    const { users, error } = await diioService.getUsers()
    
    if (error) {
      store.setError(error)
      return
    }
    
    store.setUsers(users)
    
    // Store users in database
    if (users.length > 0) {
      const { error: dbError } = await saveDiioUsers(users)
      if (dbError) {
        const dbAppError = ErrorHandler.handleDatabaseError(dbError, 'saveDiioUsers')
        store.setError(dbAppError)
      } else {
        store.updateStorageStatus({ usersStored: true })
        console.log(`✅ Stored ${users.length} users in database`)
      }
    }
  } catch (error: any) {
    const appError = ErrorHandler.handleApiError(error, 'fetchUsers')
    store.setError(appError)
  } finally {
    store.setUsersLoading(false)
  }
}

const fetchPhoneCalls = async () => {
  store.setPhoneCallsLoading(true)
  store.clearError()
  
  try {
    console.log('🔄 Fetching all phone calls at once...')
    const { calls, total, error } = await diioService.getPhoneCalls(1, 1000)
    
    if (error) {
      store.setError(error)
      return
    }
    
    store.setPhoneCalls(calls, total)
    console.log(`📊 Fetched ${calls.length} phone calls (total: ${total})`)
    
    // Store phone calls in database
    if (calls.length > 0) {
      console.log('💾 Storing all phone calls in database...')
      const { error: dbError } = await saveDiioPhoneCalls(calls)
      if (dbError) {
        const dbAppError = ErrorHandler.handleDatabaseError(dbError, 'saveDiioPhoneCalls')
        store.setError(dbAppError)
      } else {
        store.updateStorageStatus({ phoneCallsStored: true })
        console.log(`✅ Successfully stored ${calls.length} phone calls in database`)
      }
    }
  } catch (error: any) {
    const appError = ErrorHandler.handleApiError(error, 'fetchPhoneCalls')
    store.setError(appError)
  } finally {
    store.setPhoneCallsLoading(false)
  }
}

const fetchMeetings = async () => {
  store.setMeetingsLoading(true)
  store.clearError()
  
  try {
    console.log('🔄 Fetching all meetings at once...')
    const { meetings, total, error } = await diioService.getMeetings(1, 1000)
    
    if (error) {
      store.setError(error)
      return
    }
    
    store.setMeetings(meetings, total)
    console.log(`📊 Fetched ${meetings.length} meetings (total: ${total})`)
    
    // Store all meetings in database at once
    if (meetings.length > 0) {
      console.log('💾 Storing all meetings in database...')
      const { error: dbError } = await saveDiioMeetings(meetings)
      if (dbError) {
        const dbAppError = ErrorHandler.handleDatabaseError(dbError, 'saveDiioMeetings')
        store.setError(dbAppError)
      } else {
        store.updateStorageStatus({ meetingsStored: true })
        console.log(`✅ Successfully stored ${meetings.length} meetings in database`)
      }
    }
  } catch (error: any) {
    const appError = ErrorHandler.handleApiError(error, 'fetchMeetings')
    store.setError(appError)
  } finally {
    store.setMeetingsLoading(false)
  }
}

const loadMoreMeetings = async () => {
  store.setMeetingsLoading(true)
  store.clearError()
  
  try {
    const currentPage = store.state.meetingsCurrentPage + 1
    const { meetings, total, error } = await diioService.getMeetings(currentPage, 100)
    
    if (error) {
      store.setError(error)
      return
    }
    
    store.addMeetings(meetings)
    store.setMeetings(store.state.meetings, total)
    
    // Store new meetings in database
    if (meetings.length > 0) {
      const { error: dbError } = await saveDiioMeetings(meetings)
      if (dbError) {
        const dbAppError = ErrorHandler.handleDatabaseError(dbError, 'saveDiioMeetings')
        store.setError(dbAppError)
      } else {
        console.log(`✅ Stored ${meetings.length} additional meetings in database`)
      }
    }
  } catch (error: any) {
    const appError = ErrorHandler.handleApiError(error, 'loadMoreMeetings')
    store.setError(appError)
  } finally {
    store.setMeetingsLoading(false)
  }
}

const fetchTranscript = async (transcriptId: string, name: string) => {
  store.setLoading(true)
  store.clearError()
  
  try {
    // Check if transcript already exists in database
    const { exists } = await transcriptExists(transcriptId)
    
    if (exists) {
      console.log(`📋 Transcript ${transcriptId} already exists in database`)
    }
    
    const { transcript, error } = await diioService.getTranscript(transcriptId)
    
    if (error) {
      store.setError(error)
      return
    }
    
    if (transcript) {
      selectedTranscript.value = transcript
      selectedTranscriptName.value = name
      
      // Store transcript in database if it doesn't exist
      if (!exists) {
        // Determine source type and metadata
        const sourceType = name.toLowerCase().includes('meeting') ? 'meeting' : 'phone_call'
        const sourceId = transcriptId // This would need to be mapped to actual meeting/call ID
        
        const { error: dbError } = await saveDiioTranscript(
          transcript, 
          sourceType, 
          sourceId, 
          name,
          {
            occurred_at: new Date().toISOString(),
            attendees: {}
          }
        )
        
        if (dbError) {
          const dbAppError = ErrorHandler.handleDatabaseError(dbError, 'saveDiioTranscript')
          store.setError(dbAppError)
        } else {
          store.updateStorageStatus({ 
            transcriptsStored: store.state.storageStatus.transcriptsStored + 1 
          })
          console.log(`✅ Stored transcript ${transcriptId} in database`)
        }
      }
    }
  } catch (error: any) {
    const appError = ErrorHandler.handleApiError(error, 'fetchTranscript')
    store.setError(appError)
  } finally {
    store.setLoading(false)
  }
}

const exportData = async () => {
  exportedData.value = await exportPhoneCalls()
}

const loadTranscriptStats = async () => {
  try {
    const { data } = await getDiioTranscriptStats()
    if (data) {
      store.setTotalTranscripts(data.total_transcripts || 0)
      console.log(`📊 Database contains ${data.total_transcripts} transcripts`)
    }
  } catch (error: any) {
    const appError = ErrorHandler.handleDatabaseError(error, 'loadTranscriptStats')
    store.setError(appError)
  }
}

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation '${operation}' timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

const checkForNewMeetings = async () => {
  store.setLoading(true)
  store.clearError()
  
  try {
    console.log('🔄 Checking for new meetings and transcripts...')
    
    // Fetch users first with timeout
    console.log('👥 Step 1/7: Fetching users...')
    await withTimeout(fetchUsers(), 30000, 'fetchUsers')
    console.log('✅ Users fetched')
    
    // Fetch meetings with timeout
    console.log('📅 Step 2/7: Fetching meetings...')
    await withTimeout(fetchMeetings(), 30000, 'fetchMeetings')
    console.log('✅ Meetings fetched')
    
    // Fetch phone calls with timeout
    console.log('📞 Step 3/7: Fetching phone calls...')
    await withTimeout(fetchPhoneCalls(), 30000, 'fetchPhoneCalls')
    console.log('✅ Phone calls fetched')
    
    // Get all stored transcript IDs to compare
    console.log('📊 Step 4/7: Checking for new transcripts...')
    const { data: storedTranscriptsData } = await withTimeout(
      getDiioTranscripts(10000, 0),
      30000,
      'getDiioTranscripts'
    )
    const storedTranscriptIds = new Set((storedTranscriptsData || []).map(t => t.diio_transcript_id))
    
    console.log(`📋 Found ${storedTranscriptIds.size} transcripts already in database`)
    
    // Find new meetings with transcripts that aren't stored yet
    const newMeetingsWithTranscripts = store.state.meetings.filter(meeting => 
      meeting.last_transcript_id && 
      !storedTranscriptIds.has(meeting.last_transcript_id)
    )
    
    // Find new phone calls with transcripts that aren't stored yet
    const newPhoneCallsWithTranscripts = store.state.phoneCalls.filter(call => 
      call.last_transcript_id && 
      !storedTranscriptIds.has(call.last_transcript_id)
    )
    
    const totalNewTranscripts = newMeetingsWithTranscripts.length + newPhoneCallsWithTranscripts.length
    
    if (totalNewTranscripts > 0) {
      console.log(`🎉 Step 5/7: Found ${totalNewTranscripts} new transcripts to fetch (${newMeetingsWithTranscripts.length} meetings + ${newPhoneCallsWithTranscripts.length} calls)`)
      
      // Automatically fetch and store new transcripts
      try {
        await withTimeout(
          fetchAndStoreNewTranscripts(newMeetingsWithTranscripts, newPhoneCallsWithTranscripts),
          300000, // 5 minutes for processing all new transcripts
          'fetchAndStoreNewTranscripts'
        )
        console.log('✅ New transcripts processed')
      } catch (transcriptError) {
        console.error('⚠️ Error processing new transcripts (continuing anyway):', transcriptError)
      }
    } else {
      console.log('✅ Step 5/7: No new transcripts found. All transcripts are already stored.')
    }
    
    // Load stored transcripts
    console.log('📋 Step 6/7: Loading stored transcripts...')
    await withTimeout(loadStoredTranscripts(), 30000, 'loadStoredTranscripts')
    console.log('✅ Stored transcripts loaded')
    
    // Update stats
    console.log('📊 Step 7/7: Updating statistics...')
    await withTimeout(loadTranscriptStats(), 30000, 'loadTranscriptStats')
    console.log('✅ Stats updated')
    
    console.log('🎉 Check completed successfully!')
  } catch (error: any) {
    const appError = ErrorHandler.handleApiError(error, 'checkForNewMeetings')
    store.setError(appError)
    console.error('❌ Error checking for new data:', error)
  } finally {
    console.log('🏁 Finishing check process...')
    store.setLoading(false)
  }
}

const fetchAndStoreNewTranscripts = async (newMeetings: DiioMeeting[], newPhoneCalls: DiioPhoneCall[]) => {
  console.log('🎙️ Starting automatic fetch and storage of new transcripts...')
  
  // Initialize progress tracking
  const totalNewTranscripts = newMeetings.length + newPhoneCalls.length
  store.setTranscriptProcessing({
    isProcessing: true,
    current: 0,
    total: totalNewTranscripts,
    currentItem: '',
    stored: 0,
    skipped: 0,
    errors: 0
  })
  
  // Process new meeting transcripts
  for (let i = 0; i < newMeetings.length; i++) {
    const meeting = newMeetings[i]
    store.setTranscriptProcessing({
      current: i + 1,
      currentItem: `Meeting: ${meeting.name}`
    })
    
    console.log(`📅 Fetching new meeting transcript ${i + 1}/${newMeetings.length}: ${meeting.name}`)
    
    try {
      const { transcript, error } = await diioService.getTranscript(meeting.last_transcript_id!)
      
      if (error) {
        store.setTranscriptProcessing({ errors: store.state.transcriptProcessing.errors + 1 })
        console.error(`❌ Error fetching transcript for ${meeting.name}:`, error)
        continue
      }
      
      // Skip if transcript is null (not ready yet or empty)
      if (!transcript) {
        store.setTranscriptProcessing({ skipped: store.state.transcriptProcessing.skipped + 1 })
        console.warn(`⚠️ Skipping transcript for ${meeting.name} - not ready yet or empty`)
        continue
      }
      
      // Store valid transcript
      const { error: dbError } = await saveDiioTranscript(
        transcript,
        'meeting',
        meeting.id,
        meeting.name,
        {
          occurred_at: meeting.scheduled_at,
          attendees: meeting.attendees,
          duration: null
        }
      )
      
      if (!dbError) {
        store.setTranscriptProcessing({ stored: store.state.transcriptProcessing.stored + 1 })
        console.log(`✅ Stored new meeting transcript: ${meeting.name}`)
      } else {
          store.setTranscriptProcessing({ errors: store.state.transcriptProcessing.errors + 1 })
          console.error(`❌ Error storing transcript for ${meeting.name}:`, dbError)
        }
      } else {
        store.setTranscriptProcessing({ errors: store.state.transcriptProcessing.errors + 1 })
        console.error(`❌ Failed to fetch transcript for ${meeting.name}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      store.setTranscriptProcessing({ errors: store.state.transcriptProcessing.errors + 1 })
      console.error(`❌ Error processing ${meeting.name}:`, error)
    }
  }
  
  // Process new phone call transcripts
  for (let i = 0; i < newPhoneCalls.length; i++) {
    const call = newPhoneCalls[i]
    store.setTranscriptProcessing({
      current: newMeetings.length + i + 1,
      currentItem: `Call: ${call.name}`
    })
    
    console.log(`📞 Fetching new phone call transcript ${i + 1}/${newPhoneCalls.length}: ${call.name}`)
    
    try {
      const { transcript, error } = await diioService.getTranscript(call.last_transcript_id!)
      
      if (error) {
        store.setTranscriptProcessing({ errors: store.state.transcriptProcessing.errors + 1 })
        console.error(`❌ Error fetching transcript for ${call.name}:`, error)
        continue
      }
      
      // Skip if transcript is null (not ready yet or empty)
      if (!transcript) {
        store.setTranscriptProcessing({ skipped: store.state.transcriptProcessing.skipped + 1 })
        console.warn(`⚠️ Skipping transcript for ${call.name} - not ready yet or empty`)
        continue
      }
      
      // Store valid transcript
      const { error: dbError } = await saveDiioTranscript(
        transcript,
        'phone_call',
        call.id,
        call.name,
        {
          occurred_at: call.occurred_at,
          attendees: call.attendees,
          duration: call.duration
        }
      )
        
        if (!dbError) {
          store.setTranscriptProcessing({ stored: store.state.transcriptProcessing.stored + 1 })
          console.log(`✅ Stored new phone call transcript: ${call.name}`)
        } else {
          store.setTranscriptProcessing({ errors: store.state.transcriptProcessing.errors + 1 })
          console.error(`❌ Error storing transcript for ${call.name}:`, dbError)
        }
      } else {
        store.setTranscriptProcessing({ errors: store.state.transcriptProcessing.errors + 1 })
        console.error(`❌ Failed to fetch transcript for ${call.name}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      store.setTranscriptProcessing({ errors: store.state.transcriptProcessing.errors + 1 })
      console.error(`❌ Error processing ${call.name}:`, error)
    }
  }
  
  // Mark processing as complete
  store.setTranscriptProcessing({
    isProcessing: false,
    currentItem: 'Completed!'
  })
  
  console.log('🎉 Automatic transcript fetch completed!')
  console.log(`📊 Results: ${store.state.transcriptProcessing.stored} stored, ${store.state.transcriptProcessing.skipped} skipped, ${store.state.transcriptProcessing.errors} errors`)
}

// Pagination state for transcripts
const transcriptPage = ref(1)
const transcriptsPerPage = ref(50)
const jumpToPageInput = ref<number | null>(null)
const totalTranscriptPages = computed(() => Math.ceil(store.state.totalTranscripts / transcriptsPerPage.value))

// Visible page numbers (show 5 pages around current)
const visiblePages = computed(() => {
  const pages = []
  const current = transcriptPage.value
  const total = totalTranscriptPages.value
  
  // Show up to 5 pages around current page
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  
  // Adjust if we're near the beginning or end
  if (current <= 3) {
    end = Math.min(5, total)
  }
  if (current >= total - 2) {
    start = Math.max(1, total - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const loadStoredTranscripts = async (page = 1) => {
  store.setTranscriptsLoading(true)
  
  try {
    const offset = (page - 1) * transcriptsPerPage.value
    console.log(`📋 Loading transcripts page ${page} (offset: ${offset}, limit: ${transcriptsPerPage.value})`)
    
    const { data } = await getDiioTranscripts(transcriptsPerPage.value, offset)
    if (data) {
      store.setStoredTranscripts(data)
      transcriptPage.value = page
      console.log(`📋 Loaded ${data.length} stored transcripts (page ${page}/${totalTranscriptPages.value})`)
      
      // Debug: Check the first transcript structure
      if (data.length > 0) {
        console.log('🔍 First transcript structure:', data[0])
        console.log('🔍 Transcript text length:', data[0].transcript_text?.length || 'undefined')
        console.log('🔍 Transcript text preview:', data[0].transcript_text?.substring(0, 100) || 'undefined')
      }
    }
  } catch (error: any) {
    const appError = ErrorHandler.handleDatabaseError(error, 'loadStoredTranscripts')
    store.setError(appError)
    console.error('❌ Error loading stored transcripts:', error)
  } finally {
    store.setTranscriptsLoading(false)
  }
}

const nextTranscriptPage = () => {
  if (transcriptPage.value < totalTranscriptPages.value) {
    loadStoredTranscripts(transcriptPage.value + 1)
  }
}

const prevTranscriptPage = () => {
  if (transcriptPage.value > 1) {
    loadStoredTranscripts(transcriptPage.value - 1)
  }
}

const goToTranscriptPage = (page: number) => {
  if (page >= 1 && page <= totalTranscriptPages.value) {
    loadStoredTranscripts(page)
  }
}

const jumpToCustomPage = () => {
  if (jumpToPageInput.value && jumpToPageInput.value >= 1 && jumpToPageInput.value <= totalTranscriptPages.value) {
    goToTranscriptPage(jumpToPageInput.value)
    jumpToPageInput.value = null // Clear input after jump
  }
}

const viewStoredTranscript = (transcript: any) => {
  selectedTranscript.value = {
    id: transcript.diio_transcript_id,
    transcript: transcript.transcript_text || 'No transcript text available'
  }
  selectedTranscriptName.value = transcript.source_name || 'Untitled'
}

const fetchAllData = async () => {
  console.log('🚀 Starting bulk data fetch and storage...')
  
  try {
    // Fetch and store users
    console.log('1️⃣ Fetching users...')
    await fetchUsers()
    
    // Fetch and store phone calls
    console.log('2️⃣ Fetching phone calls...')
    await fetchPhoneCalls()
    
    // Fetch and store meetings
    console.log('3️⃣ Fetching meetings...')
    await fetchMeetings()
    
    // Update stats
    console.log('4️⃣ Updating statistics...')
    await loadTranscriptStats()
    
    console.log('✅ Bulk data fetch and storage completed!')
  } catch (error) {
    console.error('❌ Error during bulk fetch:', error)
  }
}

const fetchAllTranscripts = async () => {
  console.log('🎙️ Starting bulk transcript fetch and storage...')
  
  try {
    // Get all meetings and phone calls that have transcripts
    // Note: The field is 'last_transcript_id' (with 's') in the API
    const allMeetings = meetings.value.filter(meeting => meeting.last_transcript_id)
    const allPhoneCalls = phoneCalls.value.filter(call => call.last_transcript_id)
    
    const totalTranscripts = allMeetings.length + allPhoneCalls.length
    console.log(`📊 Found ${totalTranscripts} transcripts to fetch (${allMeetings.length} meetings + ${allPhoneCalls.length} phone calls)`)
    
    // Debug: Let's also check the first few meetings to see their structure
    if (meetings.value.length > 0) {
      console.log('🔍 Debug - First meeting structure:', meetings.value[0])
      console.log('🔍 Debug - Meetings with transcript IDs:', meetings.value.filter(m => m.last_transcript_id).length)
    }
    
    if (totalTranscripts === 0) {
      console.log('⚠️ No transcripts found. Please fetch meetings and phone calls first.')
      console.log('💡 Tip: Check if meetings have "last_transcript_id" field populated')
      return
    }
    
    // Initialize progress tracking
    transcriptProcessing.value = {
      isProcessing: true,
      current: 0,
      total: totalTranscripts,
      currentItem: '',
      stored: 0,
      skipped: 0,
      errors: 0
    }
    
    // Process meeting transcripts
    console.log('📅 Processing meeting transcripts...')
    for (let i = 0; i < allMeetings.length; i++) {
      const meeting = allMeetings[i]
      transcriptProcessing.value.current = i + 1
      transcriptProcessing.value.currentItem = `Meeting: ${meeting.name}`
      
      console.log(`📅 Processing meeting ${i + 1}/${allMeetings.length}: ${meeting.name}`)
      
      try {
        // Check if transcript already exists (continue if check fails)
        const { exists, error: checkError } = await transcriptExists(meeting.last_transcript_id!)
        
        if (checkError) {
          console.warn(`⚠️ Could not check if transcript exists, proceeding anyway: ${checkError}`)
        } else if (exists) {
          console.log(`⏭️ Transcript ${meeting.last_transcript_id} already exists, skipping`)
          transcriptProcessing.value.skipped++
          continue
        }
        
        // Fetch transcript
        const transcript = await getTranscript(meeting.last_transcript_id!)
        
        if (transcript) {
          // Store transcript
          const { error } = await saveDiioTranscript(
            transcript,
            'meeting',
            meeting.id,
            meeting.name,
            {
              occurred_at: meeting.scheduled_at,
              attendees: meeting.attendees,
              duration: null
            }
          )
          
          if (!error) {
            transcriptProcessing.value.stored++
            console.log(`✅ Stored meeting transcript: ${meeting.name}`)
          } else {
            transcriptProcessing.value.errors++
            console.error(`❌ Error storing meeting transcript: ${meeting.name}`, error)
          }
        } else {
          transcriptProcessing.value.errors++
          console.error(`❌ Failed to fetch transcript for meeting: ${meeting.name}`)
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        transcriptProcessing.value.errors++
        console.error(`❌ Error processing meeting ${meeting.name}:`, error)
      }
    }
    
    // Process phone call transcripts
    console.log('📞 Processing phone call transcripts...')
    for (let i = 0; i < allPhoneCalls.length; i++) {
      const call = allPhoneCalls[i]
      transcriptProcessing.value.current = allMeetings.length + i + 1
      transcriptProcessing.value.currentItem = `Call: ${call.name}`
      
      console.log(`📞 Processing call ${i + 1}/${allPhoneCalls.length}: ${call.name}`)
      
      try {
        // Check if transcript already exists (continue if check fails)
        const { exists, error: checkError } = await transcriptExists(call.last_transcript_id!)
        
        if (checkError) {
          console.warn(`⚠️ Could not check if transcript exists, proceeding anyway: ${checkError}`)
        } else if (exists) {
          console.log(`⏭️ Transcript ${call.last_transcript_id} already exists, skipping`)
          transcriptProcessing.value.skipped++
          continue
        }
        
        // Fetch transcript
        const transcript = await getTranscript(call.last_transcript_id!)
        
        if (transcript) {
          // Store transcript
          const { error } = await saveDiioTranscript(
            transcript,
            'phone_call',
            call.id,
            call.name,
            {
              occurred_at: call.occurred_at,
              attendees: call.attendees,
              duration: call.duration
            }
          )
          
          if (!error) {
            transcriptProcessing.value.stored++
            console.log(`✅ Stored phone call transcript: ${call.name}`)
          } else {
            transcriptProcessing.value.errors++
            console.error(`❌ Error storing phone call transcript: ${call.name}`, error)
          }
        } else {
          transcriptProcessing.value.errors++
          console.error(`❌ Failed to fetch transcript for call: ${call.name}`)
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        transcriptProcessing.value.errors++
        console.error(`❌ Error processing call ${call.name}:`, error)
      }
    }
    
    // Update stats
    await loadTranscriptStats()
    
    // Mark processing as complete
    transcriptProcessing.value.isProcessing = false
    transcriptProcessing.value.currentItem = 'Completed!'
    
    console.log('🎉 Bulk transcript processing completed!')
    console.log(`📊 Results: ${transcriptProcessing.value.stored} stored, ${transcriptProcessing.value.skipped} skipped, ${transcriptProcessing.value.errors} errors`)
    
  } catch (error) {
    transcriptProcessing.value.isProcessing = false
    console.error('❌ Error during bulk transcript fetch:', error)
  }
}

const debugMeetingData = () => {
  console.log('🔍 DEBUG: Meeting Data Analysis')
  console.log(`📊 Total meetings loaded: ${meetings.value.length}`)
  
  if (meetings.value.length > 0) {
    const firstMeeting = meetings.value[0]
    console.log('📋 First meeting structure:', firstMeeting)
    console.log('🔑 Available fields:', Object.keys(firstMeeting))
    
    // Check for transcript-related fields
    const transcriptFields = Object.keys(firstMeeting).filter(key => 
      key.toLowerCase().includes('transcript') || 
      key.toLowerCase().includes('trancript')
    )
    console.log('🎙️ Transcript-related fields:', transcriptFields)
    
    // Count meetings with transcript IDs
    const meetingsWithTranscripts = meetings.value.filter(m => m.last_transcript_id)
    console.log(`📈 Meetings with last_transcript_id: ${meetingsWithTranscripts.length}`)
    
    // Show sample of meetings with transcripts
    if (meetingsWithTranscripts.length > 0) {
      console.log('📝 Sample meetings with transcripts:', meetingsWithTranscripts.slice(0, 3))
    }
    
    // Check for alternative field names
    const altFields = ['transcript_id', 'last_transcript_id', 'transcriptId', 'lastTranscriptId']
    altFields.forEach(field => {
      const count = meetings.value.filter(m => (m as any)[field]).length
      if (count > 0) {
        console.log(`🔍 Found ${count} meetings with field "${field}"`)
      }
    })
  }
  
  console.log('📞 Phone calls loaded:', phoneCalls.value.length)
  if (phoneCalls.value.length > 0) {
    const firstCall = phoneCalls.value[0]
    console.log('📋 First phone call structure:', firstCall)
    console.log('🔑 Available fields:', Object.keys(firstCall))
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleString()
}

// Auto-load users, stats, and stored transcripts on mount
onMounted(async () => {
  await fetchUsers()
  await loadTranscriptStats()
  await loadStoredTranscripts()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

